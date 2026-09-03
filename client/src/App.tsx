import React, { useState } from 'react';
import { INITIAL_ORDERS, INITIAL_DRIVERS, INITIAL_VANS, INITIAL_ROUTES, INITIAL_SKU_SETTINGS, KALSI_BRAND_THEME, UK_DEPOTS, INITIAL_USERS, INITIAL_FAULTS } from './data/initialData';
import { Order, Driver, VanVehicle, DeliveryRoute, ProofOfDelivery, SkuDwellSetting, BrandTheme, Depot, UserAccount, VehicleFaultReport } from './types';
import { AdminPortal } from './components/AdminPortal';
import { DriverApp } from './components/DriverApp';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [vans, setVans] = useState<VanVehicle[]>(INITIAL_VANS);
  const [faults, setFaults] = useState<VehicleFaultReport[]>(INITIAL_FAULTS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);
  const [depots, setDepots] = useState<Depot[]>(UK_DEPOTS);
  const [skuCatalog, setSkuCatalog] = useState<SkuDwellSetting[]>(INITIAL_SKU_SETTINGS);
  const [brandTheme, setBrandTheme] = useState<BrandTheme>(KALSI_BRAND_THEME);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Active Signed-In User State
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_USERS[0].id);

  const [viewMode, setViewMode] = useState<'admin' | 'driver'>('admin');
  const [activeDriverId, setActiveDriverId] = useState<string>(INITIAL_DRIVERS[0].id);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

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

  const handleUnassignOrCancelRoute = (routeId: string) => {
    const targetRoute = routes.find((r) => r.id === routeId);
    if (!targetRoute) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.routeId === routeId
          ? { ...o, routeId: undefined, status: 'PENDING' as const, stopSequence: undefined }
          : o
      )
    );

    setRoutes((prev) => prev.filter((r) => r.id !== routeId));

    if (targetRoute.driverId) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === targetRoute.driverId ? { ...d, status: 'IDLE', assignedVanId: undefined, assignedVanReg: undefined } : d))
      );
    }

    if (targetRoute.vanId) {
      setVans((prev) =>
        prev.map((v) => (v.id === targetRoute.vanId ? { ...v, status: 'AVAILABLE' } : v))
      );
    }
  };

  const handleMoveOrderBetweenRoutes = (orderId: string, sourceRouteId: string, targetRouteId: string) => {
    const sourceRoute = routes.find((r) => r.id === sourceRouteId);
    const targetRoute = routes.find((r) => r.id === targetRouteId);
    const movedOrder = orders.find((o) => o.id === orderId);

    if (!sourceRoute || !targetRoute || !movedOrder) return;

    const updatedMovedOrder = { ...movedOrder, routeId: targetRouteId };
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedMovedOrder : o))
    );

    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === sourceRouteId) {
          const updatedOrders = r.orders.filter((o) => o.id !== orderId);
          const totalDwell = updatedOrders.reduce((acc, o) => acc + (o.manualDwellOverrideMins ?? o.totalDwellMins), 0);
          const totalDrive = 50 + (updatedOrders.length * 15);
          const totalEstimated = totalDwell + totalDrive + 45;

          return {
            ...r,
            orders: updatedOrders,
            totalDwellMins: totalDwell,
            totalDrivingMins: totalDrive,
            totalEstimatedMins: totalEstimated,
            totalDistanceKm: 20 + (updatedOrders.length * 7),
            shiftUtilisationPct: Math.round((totalEstimated / 480) * 100),
            isProblemRoute: totalEstimated > 480,
          };
        }

        if (r.id === targetRouteId) {
          const updatedOrders = [...r.orders, updatedMovedOrder];
          const totalDwell = updatedOrders.reduce((acc, o) => acc + (o.manualDwellOverrideMins ?? o.totalDwellMins), 0);
          const totalDrive = 50 + (updatedOrders.length * 15);
          const totalEstimated = totalDwell + totalDrive + 45;

          return {
            ...r,
            orders: updatedOrders,
            totalDwellMins: totalDwell,
            totalDrivingMins: totalDrive,
            totalEstimatedMins: totalEstimated,
            totalDistanceKm: 20 + (updatedOrders.length * 7),
            shiftUtilisationPct: Math.round((totalEstimated / 480) * 100),
            isProblemRoute: totalEstimated > 480,
          };
        }

        return r;
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

  const handleAssignVanToRoute = (routeId: string, vanId: string) => {
    const selectedVan = vans.find((v) => v.id === vanId);
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? {
              ...r,
              vanId: vanId || undefined,
              vanRegistration: selectedVan ? selectedVan.registration : undefined,
            }
          : r
      )
    );

    if (vanId) {
      setVans((prev) =>
        prev.map((v) => (v.id === vanId ? { ...v, status: 'ON_ROUTE' } : v))
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

  const handleDriverSubmitFault = (newFault: VehicleFaultReport) => {
    setFaults((prev) => [newFault, ...prev]);

    // If fault is critical, ground the vehicle
    if (newFault.severity === 'CRITICAL_GROUND_VEHICLE') {
      setVans((prev) =>
        prev.map((v) =>
          v.id === newFault.vanId ? { ...v, status: 'GROUNDED' } : v
        )
      );
    }
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
          vans={vans}
          routes={routes}
          depots={depots}
          skuCatalog={skuCatalog}
          brandTheme={brandTheme}
          users={users}
          faults={faults}
          currentUser={currentUser}
          onSwitchUser={setCurrentUserId}
          onUpdateUsers={setUsers}
          onUpdateDrivers={setDrivers}
          onUpdateVans={setVans}
          onUpdateFaults={setFaults}
          onUpdateBrandTheme={setBrandTheme}
          onUpdateDepots={setDepots}
          onCreateRoute={handleCreateRoute}
          onAssignDriverToRoute={handleAssignDriverToRoute}
          onAssignVanToRoute={handleAssignVanToRoute}
          onUnassignOrCancelRoute={handleUnassignOrCancelRoute}
          onMoveOrderBetweenRoutes={handleMoveOrderBetweenRoutes}
          onUpdateOrderDwell={handleUpdateOrderDwell}
          onUpdateSkuCatalog={setSkuCatalog}
          onSimulateNewOrder={handleSimulateNewOrder}
          onSwitchToDriver={(driverId) => {
            setActiveDriverId(driverId);
            setViewMode('driver');
          }}
          onConfirmRouteLoaded={handleConfirmRouteLoaded}
        />
      ) : (
        <DriverApp
          driver={currentDriver}
          brandTheme={brandTheme}
          vans={vans}
          activeRoute={driverActiveRoute}
          allAvailableRoutes={routes.filter((r) => r.status === 'UNASSIGNED' || r.driverId === activeDriverId)}
          onClaimRoute={handleAssignDriverToRoute}
          onConfirmRouteLoaded={handleConfirmRouteLoaded}
          onStartRoute={handleStartRoute}
          onCompletePod={handleCompletePod}
          onCompleteRoute={handleCompleteRoute}
          onSubmitFaultReport={handleDriverSubmitFault}
          onBackToAdmin={() => setViewMode('admin')}
        />
      )}
    </div>
  );
};
