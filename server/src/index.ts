import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { calculateDistanceKm, optimizeStopsSequence } from './geo.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload folder for POD signatures / photos
const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve Client Web Application in Production
const clientDistPath = path.join(process.cwd(), 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`Serving client from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
}

// -------------------------------------------------------------
// 1. WEBHOOK INGESTION (From Label / Tracking Provider)
// -------------------------------------------------------------
app.post('/api/webhooks/shipment', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('📦 Received Label Webhook Event:', payload.event || 'shipment.created');

    const trackingNumber = payload.tracking_number || `KAL-${Date.now().toString().slice(-6)}`;
    const lat = payload.recipient?.latitude || 52.4862;
    const lng = payload.recipient?.longitude || -1.8904;

    // Find nearest Depot from the 22 UK Depots
    const depots = await prisma.depot.findMany();
    if (depots.length === 0) {
      return res.status(500).json({ error: 'No depots configured in system' });
    }

    let nearestDepot = depots[0];
    let minDistance = calculateDistanceKm(lat, lng, nearestDepot.lat, nearestDepot.lng);

    for (const depot of depots) {
      const d = calculateDistanceKm(lat, lng, depot.lat, depot.lng);
      if (d < minDistance) {
        minDistance = d;
        nearestDepot = depot;
      }
    }

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        externalOrderId: payload.order_reference || `ORD-${Date.now().toString().slice(-4)}`,
        sourceChannel: payload.channel || 'Shopify',
        labelApiRef: payload.label_id || null,
        customerName: payload.recipient?.name || 'Customer',
        customerPhone: payload.recipient?.phone || null,
        customerEmail: payload.recipient?.email || null,
        address: payload.recipient?.address_line1 || 'Main Street',
        city: payload.recipient?.city || 'UK Town',
        postcode: payload.recipient?.postcode || 'B1 1AA',
        lat,
        lng,
        itemsDescription: payload.parcel?.description || 'Plastics Goods Pack (Fascias/Soffits)',
        specialNotes: payload.notes || null,
        dwellTimeMins: payload.parcel?.dwell_time_mins || 15,
        status: 'BUCKET_PENDING',
        depotId: nearestDepot.id,
      },
      include: { depot: true },
    });

    console.log(`✅ Webhook processed. Routed to ${nearestDepot.name} (${Math.round(minDistance)}km away)`);
    return res.status(201).json({
      success: true,
      message: 'Shipment created and dropped into Depot bucket',
      assignedDepot: nearestDepot.name,
      shipment,
    });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 2. DEPOT MANAGEMENT API
// -------------------------------------------------------------
app.get('/api/depots', async (req: Request, res: Response) => {
  const depots = await prisma.depot.findMany({
    include: {
      _count: {
        select: {
          shipments: { where: { status: 'BUCKET_PENDING' } },
          drivers: true,
          routes: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json(depots);
});

app.get('/api/depots/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const depot = await prisma.depot.findUnique({
    where: { id },
    include: {
      drivers: true,
      shipments: {
        where: { status: 'BUCKET_PENDING' },
        orderBy: { createdAt: 'desc' },
      },
      routes: {
        include: {
          driver: true,
          shipments: {
            include: { proofOfDelivery: true },
            orderBy: { stopSequence: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!depot) return res.status(404).json({ error: 'Depot not found' });
  res.json(depot);
});

// -------------------------------------------------------------
// 3. ROUTE OPTIMIZATION & DISPATCH ENGINE
// -------------------------------------------------------------
app.post('/api/routes/optimize-and-create', async (req: Request, res: Response) => {
  try {
    const { depotId, shipmentIds, driverId, dwellTimeMins = 15 } = req.body;

    const depot = await prisma.depot.findUnique({ where: { id: depotId } });
    if (!depot) return res.status(404).json({ error: 'Depot not found' });

    let shipmentsToRoute: any[] = [];
    if (shipmentIds && shipmentIds.length > 0) {
      shipmentsToRoute = await prisma.shipment.findMany({
        where: { id: { in: shipmentIds }, depotId },
      });
    } else {
      shipmentsToRoute = await prisma.shipment.findMany({
        where: { depotId, status: 'BUCKET_PENDING' },
        take: 8,
      });
    }

    if (shipmentsToRoute.length === 0) {
      return res.status(400).json({ error: 'No unassigned orders found in this depot bucket to build a route.' });
    }

    const stopPoints = shipmentsToRoute.map((s) => ({
      ...s,
      dwellTimeMins: s.dwellTimeMins || dwellTimeMins,
    }));

    const result = optimizeStopsSequence(
      { lat: depot.lat, lng: depot.lng },
      stopPoints,
      dwellTimeMins
    );

    const routeNumber = `RT-${depot.code}-${Date.now().toString().slice(-6)}`;

    const newRoute = await prisma.deliveryRoute.create({
      data: {
        routeNumber,
        depotId,
        driverId: driverId || null,
        status: driverId ? 'ASSIGNED' : 'DRAFT',
        dwellTimePerStop: dwellTimeMins,
        totalEstimatedMins: result.totalDurationMins,
        totalDistanceKm: result.totalDistanceKm,
      },
    });

    for (let i = 0; i < result.orderedStops.length; i++) {
      const stop = result.orderedStops[i];
      await prisma.shipment.update({
        where: { id: stop.id },
        data: {
          routeId: newRoute.id,
          stopSequence: i + 1,
          status: 'ROUTED',
        },
      });
    }

    const fullRoute = await prisma.deliveryRoute.findUnique({
      where: { id: newRoute.id },
      include: {
        depot: true,
        driver: true,
        shipments: { orderBy: { stopSequence: 'asc' } },
      },
    });

    return res.status(201).json({
      success: true,
      route: fullRoute,
      optimizationSummary: {
        totalStops: result.orderedStops.length,
        totalDistanceKm: result.totalDistanceKm,
        totalEstimatedDurationMins: result.totalDurationMins,
        drivingTimeMins: result.totalDrivingMins,
        dwellTimeTotalMins: result.totalDwellMins,
      },
    });
  } catch (error: any) {
    console.error('Route Creation Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/routes/:id/assign', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { driverId } = req.body;

  const updated = await prisma.deliveryRoute.update({
    where: { id },
    data: {
      driverId,
      status: 'ASSIGNED',
    },
    include: { driver: true, shipments: true },
  });

  res.json(updated);
});

// -------------------------------------------------------------
// 4. DRIVER MOBILE APPLICATION API
// -------------------------------------------------------------
app.get('/api/driver/:driverId/active-manifest', async (req: Request, res: Response) => {
  const { driverId } = req.params;

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { depot: true },
  });

  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  const activeRoute = await prisma.deliveryRoute.findFirst({
    where: {
      driverId,
      status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
    },
    include: {
      depot: true,
      shipments: {
        include: { proofOfDelivery: true },
        orderBy: { stopSequence: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ driver, activeRoute });
});

app.post('/api/driver/routes/:routeId/start', async (req: Request, res: Response) => {
  const { routeId } = req.params;
  const updatedRoute = await prisma.deliveryRoute.update({
    where: { id: routeId },
    data: { status: 'IN_PROGRESS' },
  });
  await prisma.shipment.updateMany({
    where: { routeId, status: 'ROUTED' },
    data: { status: 'OUT_FOR_DELIVERY' },
  });
  res.json(updatedRoute);
});

app.post('/api/driver/shipments/:shipmentId/pod', async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const { recipientName, signatureData, photoUrl, notes, deliveredLat, deliveredLng } = req.body;

    if (!signatureData) {
      return res.status(400).json({ error: 'Customer signature is required for POD.' });
    }

    const pod = await prisma.proofOfDelivery.create({
      data: {
        shipmentId,
        recipientName: recipientName || 'Customer on Site',
        signatureData,
        photoUrl: photoUrl || null,
        notes: notes || null,
        deliveredLat: deliveredLat || null,
        deliveredLng: deliveredLng || null,
      },
    });

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'DELIVERED' },
      include: { route: true },
    });

    if (updatedShipment.routeId) {
      const remainingStops = await prisma.shipment.count({
        where: {
          routeId: updatedShipment.routeId,
          status: { not: 'DELIVERED' },
        },
      });

      if (remainingStops === 0) {
        await prisma.deliveryRoute.update({
          where: { id: updatedShipment.routeId },
          data: { status: 'COMPLETED' },
        });
      }
    }

    res.json({ success: true, pod, shipment: updatedShipment });
  } catch (error: any) {
    console.error('POD submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/drivers', async (req: Request, res: Response) => {
  const drivers = await prisma.driver.findMany({
    include: { depot: true },
    orderBy: { name: 'asc' },
  });
  res.json(drivers);
});

app.get('/api/routes', async (req: Request, res: Response) => {
  const routes = await prisma.deliveryRoute.findMany({
    include: {
      depot: true,
      driver: true,
      shipments: {
        include: { proofOfDelivery: true },
        orderBy: { stopSequence: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(routes);
});

// Wildcard route to serve index.html for React SPA
if (fs.existsSync(clientDistPath)) {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Kalsi Logistics Server running on port ${PORT}`);
});
