import React, { useState } from 'react';
import { INITIAL_ORDERS, INITIAL_DRIVERS, INITIAL_ROUTES, KALSI_PRODUCT_CATALOG, DEFAULT_SETTINGS } from './data/initialData';
import { Order, Driver, DeliveryRoute, ProofOfDelivery, SkuDwellSetting, GlobalSettings } from './types';
import { AdminPortal } from './components/AdminPortal';
import { DriverApp } from './components/DriverApp';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);
  const [skuCatalog, setSkuCatalog] = useState<SkuDwellSetting[]>(KALSI_PRODUCT_CATALOG);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);

  const [viewMode, setViewMode] = useState<'admin' | 'driver'>('admin');
  const [activeDriverId, setActiveDriverId] = useState<string>(INITIAL_DRIVERS[0].id);

  // Handlers
  const handleCreateRoute = (newRoute: DeliveryRoute) => {
    setRoutes((prev) => [newRoute, ...prev]);

    setOrders((prev) =>
      prev.map((o) => {
        const found = newRoute.orders.find((no) => no.id === o.id);
        if (found) {
          return {
            ...o,
            routeId: newRoute.id,
            status: 'ROUTED',
            stopSequence: found.stopSequence,
          };
        }
        return o;
      })
    );
  };

  const handleBatchCreateRoutes = (newRoutes: DeliveryRoute[]) => {
    setRoutes((prev) => [...newRoutes, ...prev]);

    const routedMap = new Map<string, { routeId: string; sequence: number }>();
    newRoutes.forEach((r) => {
      r.orders.forEach((o) => {
        routedMap.set(o.id, { routeId: r.id, sequence: o.stopSequence || 1 });
      });
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (routedMap.has(o.id)) {
          const info = routedMap.get(o.id)!;
          return {
            ...o,
            routeId: info.routeId,
            status: 'ROUTED',
            stopSequence: info.sequence,
          };
        }
        return o;
      })
    );
  };

  const handleAssignDriverToRoute = (routeId: string, driverId: string) => {
    const selectedDriver = drivers.find((d) => d.id === driverId);
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? {
              ...r,
              driverId: driverId || undefined,
              driver: selectedDriver,
              status: driverId ? 'ASSIGNED' : 'UNASSIGNED',
            }
          : r
      )
    );

    // Update driver active status
    if (driverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, status: 'ON_ROUTE' } : d))
      );
    }
  };

  const handleUpdateOrderDwell = (orderId: string, manualDwell: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, manualDwellOverrideMins: manualDwell } : o
      )
    );
  };

  const handleSimulateNewOrder = (newOrderData: Partial<Order>) => {
    const fullOrder: Order = {
      id: newOrderData.id || `ord-${Date.now()}`,
      trackingNumber: newOrderData.trackingNumber || `KAL-${Math.floor(880000 + Math.random() * 90000)}`,
      customerName: newOrderData.customerName || 'UK Merchant Customer',
      customerPhone: newOrderData.customerPhone || '+44 7700 900999',
      address: newOrderData.address || '10 Trade Park Way',
      city: newOrderData.city || 'Birmingham',
      postcode: newOrderData.postcode || 'B7 5EX',
      lat: newOrderData.lat || 52.4862,
      lng: newOrderData.lng || -1.8904,
      items: newOrderData.items || [],
      totalItemCount: newOrderData.totalItemCount || 4,
      totalVanUnits: newOrderData.totalVanUnits || 4,
      calculatedDwellMins: newOrderData.calculatedDwellMins || 20,
      manualDwellOverrideMins: newOrderData.manualDwellOverrideMins,
      specialNotes: newOrderData.specialNotes || undefined,
      status: 'PENDING_DISPATCH',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [fullOrder, ...prev]);
  };

  const handleStartRoute = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, status: 'IN_PROGRESS' } : r))
    );
    setOrders((prev) =>
      prev.map((o) => (o.routeId === routeId ? { ...o, status: 'OUT_FOR_DELIVERY' } : o))
    );
  };

  const handleCompletePod = (orderId: string, podData: Partial<ProofOfDelivery>) => {
    const fullPod: ProofOfDelivery = {
      id: `pod-${Date.now()}`,
      shipmentId: orderId,
      recipientName: podData.recipientName || 'Customer',
      signatureData: podData.signatureData || '',
      photoUrl: podData.photoUrl || null,
      notes: podData.notes || null,
      deliveredLat: podData.deliveredLat || null,
      deliveredLng: podData.deliveredLng || null,
      timestamp: podData.timestamp || new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'DELIVERED',
            proofOfDelivery: fullPod,
          };
        }
        return o;
      })
    );

    setRoutes((prev) =>
      prev.map((r) => {
        const updatedOrders = r.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'DELIVERED' as const, proofOfDelivery: fullPod }
            : o
        );
        const allDone = updatedOrders.every((o) => o.status === 'DELIVERED');
        return {
          ...r,
          orders: updatedOrders,
          status: allDone ? 'COMPLETED' : r.status,
        };
      })
    );

    // Update driver GPS location to delivery point
    if (podData.deliveredLat && podData.deliveredLng) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === activeDriverId
            ? {
                ...d,
                currentLat: podData.deliveredLat!,
                currentLng: podData.deliveredLng!,
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : d
        )
      );
    }
  };

  const currentDriver = drivers.find((d) => d.id === activeDriverId) || drivers[0];
  const driverActiveRoute = routes.find(
    (r) => r.driverId === activeDriverId && r.status !== 'COMPLETED'
  ) || routes.find((r) => r.driverId === activeDriverId);

  return (
    <div className="w-full min-h-screen">
      {viewMode === 'admin' ? (
        <AdminPortal
          orders={orders}
          drivers={drivers}
          routes={routes}
          skuCatalog={skuCatalog}
          settings={settings}
          onCreateRoute={handleCreateRoute}
          onBatchCreateRoutes={handleBatchCreateRoutes}
          onAssignDriverToRoute={handleAssignDriverToRoute}
          onUpdateOrderDwell={handleUpdateOrderDwell}
          onUpdateSkuCatalog={setSkuCatalog}
          onUpdateSettings={setSettings}
          onSimulateNewOrder={handleSimulateNewOrder}
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
