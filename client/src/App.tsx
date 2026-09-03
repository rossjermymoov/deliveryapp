import React, { useState } from 'react';
import { INITIAL_ORDERS, INITIAL_DRIVERS, INITIAL_ROUTES, INITIAL_SKU_SETTINGS, KALSI_BRAND_THEME } from './data/initialData';
import { Order, Driver, DeliveryRoute, ProofOfDelivery, SkuDwellSetting, BrandTheme } from './types';
import { AdminPortal } from './components/AdminPortal';
import { DriverApp } from './components/DriverApp';
import { CustomerTrackingPortal } from './components/CustomerTrackingPortal';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);
  const [skuCatalog, setSkuCatalog] = useState<SkuDwellSetting[]>(INITIAL_SKU_SETTINGS);
  const [brandTheme, setBrandTheme] = useState<BrandTheme>(KALSI_BRAND_THEME);

  const [viewMode, setViewMode] = useState<'admin' | 'driver' | 'customer'>('admin');
  const [activeDriverId, setActiveDriverId] = useState<string>(INITIAL_DRIVERS[0].id);
  const [activeCustomerTracking, setActiveCustomerTracking] = useState<string>('KAL-889101');

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

    if (driverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, status: 'ON_ROUTE' } : d))
      );
    }
  };

  const handleConfirmRouteLoaded = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, allLoaded: true, status: 'ASSIGNED' } : r))
    );
    setOrders((prev) =>
      prev.map((o) => (o.routeId === routeId ? { ...o, status: 'LOADED' } : o))
    );
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
      depotId: newOrderData.depotId || 'depot-bhm',
      customerName: newOrderData.customerName || 'Customer',
      customerPhone: newOrderData.customerPhone || '07700 900000',
      customerEmail: newOrderData.customerEmail || 'customer@example.co.uk',
      address: newOrderData.address || '10 High Street',
      city: newOrderData.city || 'Birmingham',
      postcode: newOrderData.postcode || 'B1 1AA',
      lat: newOrderData.lat || 52.4862,
      lng: newOrderData.lng || -1.8904,
      items: newOrderData.items || [],
      totalDwellMins: newOrderData.totalDwellMins || 15,
      manualDwellOverrideMins: newOrderData.manualDwellOverrideMins,
      specialNotes: newOrderData.specialNotes || undefined,
      status: 'PENDING',
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

  const handleCompleteRoute = (routeId: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, status: 'COMPLETED' } : r))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === activeDriverId ? { ...d, status: 'IDLE' } : d))
    );
  };

  const handleCompletePod = (orderId: string, podData: Partial<ProofOfDelivery>) => {
    const fullPod: ProofOfDelivery = {
      id: `pod-${Date.now()}`,
      orderId,
      recipientName: podData.recipientName || 'Customer',
      signatureData: podData.signatureData || '',
      photoUrl: podData.photoUrl || null,
      notes: podData.notes || null,
      deliveredLat: podData.deliveredLat || null,
      deliveredLng: podData.deliveredLng || null,
      timestamp: podData.timestamp || new Date().toISOString(),
      hasItemExceptions: podData.hasItemExceptions,
      itemExceptionNotes: podData.itemExceptionNotes,
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
          brandTheme={brandTheme}
          onUpdateBrandTheme={setBrandTheme}
          onCreateRoute={handleCreateRoute}
          onAssignDriverToRoute={handleAssignDriverToRoute}
          onUpdateOrderDwell={handleUpdateOrderDwell}
          onUpdateSkuCatalog={setSkuCatalog}
          onSimulateNewOrder={handleSimulateNewOrder}
          onSwitchToDriver={(driverId) => {
            setActiveDriverId(driverId);
            setViewMode('driver');
          }}
          onOpenCustomerTracker={(trk) => {
            setActiveCustomerTracking(trk);
            setViewMode('customer');
          }}
          onConfirmRouteLoaded={handleConfirmRouteLoaded}
        />
      ) : viewMode === 'driver' ? (
        <DriverApp
          driver={currentDriver}
          brandTheme={brandTheme}
          activeRoute={driverActiveRoute}
          allAvailableRoutes={routes.filter((r) => r.status === 'UNASSIGNED' || r.driverId === activeDriverId)}
          onClaimRoute={handleAssignDriverToRoute}
          onConfirmRouteLoaded={handleConfirmRouteLoaded}
          onStartRoute={handleStartRoute}
          onCompletePod={handleCompletePod}
          onCompleteRoute={handleCompleteRoute}
          onBackToAdmin={() => setViewMode('admin')}
          onOpenCustomerTracker={(trk) => {
            setActiveCustomerTracking(trk);
            setViewMode('customer');
          }}
        />
      ) : (
        <CustomerTrackingPortal
          orders={orders}
          routes={routes}
          drivers={drivers}
          brandTheme={brandTheme}
          initialTrackingNumber={activeCustomerTracking}
          onBackToPortal={() => setViewMode('admin')}
        />
      )}
    </div>
  );
};
