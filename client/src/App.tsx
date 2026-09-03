import React, { useState } from 'react';
import { INITIAL_DEPOTS, INITIAL_DRIVERS, INITIAL_SHIPMENTS, INITIAL_ROUTES } from './data/initialData';
import { Depot, Driver, Shipment, DeliveryRoute, ProofOfDelivery } from './types';
import { AdminPortal } from './components/AdminPortal';
import { DriverApp } from './components/DriverApp';

export const App: React.FC = () => {
  const [depots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);

  const [selectedDepotId, setSelectedDepotId] = useState<string>(INITIAL_DEPOTS[0].id);
  const [viewMode, setViewMode] = useState<'admin' | 'driver'>('admin');
  const [activeDriverId, setActiveDriverId] = useState<string>(INITIAL_DRIVERS[0].id);

  // Handlers
  const handleCreateRoute = (newRoute: DeliveryRoute) => {
    setRoutes((prev) => [newRoute, ...prev]);

    // Update shipment statuses
    setShipments((prev) =>
      prev.map((s) => {
        const found = newRoute.shipments.find((ns) => ns.id === s.id);
        if (found) {
          return {
            ...s,
            routeId: newRoute.id,
            status: 'ROUTED',
            stopSequence: found.stopSequence,
          };
        }
        return s;
      })
    );
  };

  const handleSimulateWebhook = (newShipmentData: Partial<Shipment>) => {
    const fullShipment: Shipment = {
      id: newShipmentData.id || `shp-${Date.now()}`,
      trackingNumber: newShipmentData.trackingNumber || `KAL-UK-${Math.floor(1000 + Math.random() * 9000)}`,
      externalOrderId: newShipmentData.externalOrderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceChannel: newShipmentData.sourceChannel || 'Shopify',
      labelApiRef: newShipmentData.labelApiRef || 'lbl_ext_auto',
      customerName: newShipmentData.customerName || 'UK Customer',
      customerPhone: newShipmentData.customerPhone || '+44 7700 900999',
      address: newShipmentData.address || '10 Main Road',
      city: newShipmentData.city || 'Birmingham',
      postcode: newShipmentData.postcode || 'B1 1AA',
      lat: newShipmentData.lat || 52.4862,
      lng: newShipmentData.lng || -1.8904,
      itemsDescription: newShipmentData.itemsDescription || '4x Plastic Fascia Boards',
      specialNotes: newShipmentData.specialNotes || undefined,
      dwellTimeMins: newShipmentData.dwellTimeMins || 15,
      status: 'BUCKET_PENDING',
      depotId: newShipmentData.depotId || selectedDepotId,
      createdAt: new Date().toISOString(),
    };

    setShipments((prev) => [fullShipment, ...prev]);
  };

  const handleStartRoute = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, status: 'IN_PROGRESS' } : r))
    );
    setShipments((prev) =>
      prev.map((s) => (s.routeId === routeId ? { ...s, status: 'OUT_FOR_DELIVERY' } : s))
    );
  };

  const handleCompletePod = (shipmentId: string, podData: Partial<ProofOfDelivery>) => {
    const fullPod: ProofOfDelivery = {
      id: `pod-${Date.now()}`,
      shipmentId,
      recipientName: podData.recipientName || 'Customer',
      signatureData: podData.signatureData || '',
      photoUrl: podData.photoUrl || null,
      notes: podData.notes || null,
      deliveredLat: podData.deliveredLat || null,
      deliveredLng: podData.deliveredLng || null,
      timestamp: podData.timestamp || new Date().toISOString(),
    };

    // Update shipment
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: 'DELIVERED',
            proofOfDelivery: fullPod,
          };
        }
        return s;
      })
    );

    // Update route state if attached
    setRoutes((prev) =>
      prev.map((r) => {
        const updatedShipments = r.shipments.map((s) =>
          s.id === shipmentId
            ? { ...s, status: 'DELIVERED' as const, proofOfDelivery: fullPod }
            : s
        );
        const allDone = updatedShipments.every((s) => s.status === 'DELIVERED');
        return {
          ...r,
          shipments: updatedShipments,
          status: allDone ? 'COMPLETED' : r.status,
        };
      })
    );
  };

  const currentDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];
  const driverActiveRoute = routes.find(
    (r) => r.driverId === activeDriverId && r.status !== 'COMPLETED'
  ) || routes.find((r) => r.driverId === activeDriverId);

  return (
    <div className="w-full min-h-screen">
      {viewMode === 'admin' ? (
        <AdminPortal
          depots={depots}
          drivers={drivers}
          shipments={shipments}
          routes={routes}
          selectedDepotId={selectedDepotId}
          onSelectDepot={setSelectedDepotId}
          onCreateRoute={handleCreateRoute}
          onSimulateWebhook={handleSimulateWebhook}
          onSwitchToDriver={(driverId) => {
            setActiveDriverId(driverId);
            setViewMode('driver');
          }}
        />
      ) : (
        <DriverApp
          driver={currentDriver}
          activeRoute={driverActiveRoute}
          onCompletePod={handleCompletePod}
          onStartRoute={handleStartRoute}
          onBackToAdmin={() => setViewMode('admin')}
        />
      )}
    </div>
  );
};
