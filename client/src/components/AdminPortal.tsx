import React, { useState } from 'react';
import { Order, Driver, DeliveryRoute, SkuDwellSetting, ShiftParameters, BrandTheme, Depot, UserAccount, VanVehicle } from '../types';
import { DEFAULT_SHIFT_PARAMS } from '../utils/routing';
import { DriverLiveMap } from './DriverLiveMap';
import { MorningDashboard } from './MorningDashboard';
import { ScanToVanModal } from './ScanToVanModal';
import { OrdersManager } from './OrdersManager';
import { RoutesManager } from './RoutesManager';
import { SettingsPage } from './SettingsPage';
import { 
  Package, 
  Route as RouteIcon, 
  Radio, 
  Truck, 
  LayoutDashboard,
  Warehouse,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface Props {
  orders: Order[];
  drivers: Driver[];
  vans: VanVehicle[];
  routes: DeliveryRoute[];
  depots: Depot[];
  skuCatalog: SkuDwellSetting[];
  brandTheme: BrandTheme;
  users: UserAccount[];
  currentUser: UserAccount;
  onSwitchUser: (userId: string) => void;
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onUpdateVans: (vans: VanVehicle[]) => void;
  onUpdateBrandTheme: (theme: BrandTheme) => void;
  onUpdateDepots: (depots: Depot[]) => void;
  onCreateRoute: (route: DeliveryRoute) => void;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onAssignVanToRoute: (routeId: string, vanId: string) => void;
  onUnassignOrCancelRoute: (routeId: string) => void;
  onMoveOrderBetweenRoutes: (orderId: string, sourceRouteId: string, targetRouteId: string) => void;
  onUpdateOrderDwell: (orderId: string, manualDwell: number) => void;
  onUpdateSkuCatalog: (catalog: SkuDwellSetting[]) => void;
  onSimulateNewOrder: (order: Partial<Order>) => void;
  onSwitchToDriver: (driverId: string) => void;
  onConfirmRouteLoaded: (routeId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  orders,
  drivers,
  vans,
  routes,
  depots,
  skuCatalog,
  brandTheme,
  users,
  currentUser,
  onSwitchUser,
  onUpdateUsers,
  onUpdateDrivers,
  onUpdateVans,
  onUpdateBrandTheme,
  onUpdateDepots,
  onCreateRoute,
  onAssignDriverToRoute,
  onAssignVanToRoute,
  onUnassignOrCancelRoute,
  onMoveOrderBetweenRoutes,
  onUpdateOrderDwell,
  onUpdateSkuCatalog,
  onSwitchToDriver,
  onConfirmRouteLoaded,
}) => {
  const isHeadOfficeAdmin = currentUser.role === 'HEAD_OFFICE_ADMIN';
  
  // If DEPOT_CONTROLLER, assign to their assigned depot; otherwise allow switching
  const [selectedDepotId, setSelectedDepotId] = useState<string>(
    currentUser.assignedDepotId || depots[0]?.id || 'depot-bhm'
  );

  const effectiveDepotId = isHeadOfficeAdmin
    ? selectedDepotId
    : (currentUser.assignedDepotId || depots[0]?.id || 'depot-bhm');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'routes' | 'map' | 'settings'>('dashboard');

  // Scan to Van modal state
  const [loadingRoute, setLoadingRoute] = useState<DeliveryRoute | null>(null);

  // Shift & Traffic Parameters
  const [shiftParams, setShiftParams] = useState<ShiftParameters>(DEFAULT_SHIFT_PARAMS);

  // Filtered strictly to current user's depot
  const activeRoutes = routes.filter((r) => r.depotId === effectiveDepotId);
  const activeOrders = orders.filter((o) => o.depotId === effectiveDepotId);
  const activeDrivers = drivers.filter((d) => d.depotId === effectiveDepotId);
  const currentDepot = depots.find((d) => d.id === effectiveDepotId) || depots[0];

  const handleAutoBatchDepot = () => {
    const maxPerVan = currentDepot.maxOrdersPerVan || 6;

    const pendingOrders = activeOrders.filter((o) => o.status === 'PENDING' && !o.belowRouteCriteria);
    if (pendingOrders.length === 0) return;

    const batches: Order[][] = [];
    for (let i = 0; i < pendingOrders.length; i += maxPerVan) {
      batches.push(pendingOrders.slice(i, i + maxPerVan));
    }

    batches.forEach((batch, idx) => {
      const routeId = `route-local-${Date.now()}-${idx + 1}`;
      const depotCity = currentDepot.city || 'Depot';

      const totalDwell = batch.reduce((acc, o) => acc + (o.manualDwellOverrideMins ?? o.totalDwellMins), 0);
      const totalDrive = 60 + (batch.length * 15);
      const totalEstimated = totalDwell + totalDrive + 45;

      const newRoute: DeliveryRoute = {
        id: routeId,
        routeNumber: `Route ${routes.length + idx + 1} (${depotCity} Van ${idx + 1})`,
        depotId: effectiveDepotId,
        date: new Date().toISOString(),
        status: 'UNASSIGNED',
        totalDwellMins: totalDwell,
        totalDrivingMins: totalDrive,
        breakTimeMins: 45,
        totalEstimatedMins: totalEstimated,
        totalDistanceKm: 25 + (batch.length * 7),
        shiftUtilisationPct: Math.round((totalEstimated / (shiftParams.shiftLengthHours * 60)) * 100),
        isProblemRoute: totalEstimated > (shiftParams.shiftLengthHours * 60),
        problemReason: totalEstimated > (shiftParams.shiftLengthHours * 60) ? `Exceeds ${shiftParams.shiftLengthHours}h limit.` : undefined,
        driverId: undefined,
        orders: batch.map((o) => ({
          ...o,
          routeId,
          status: 'ROUTED' as const,
        })),
      };

      onCreateRoute(newRoute);
    });

    setActiveTab('routes');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Scan to Van Loading Modal */}
      {loadingRoute && (
        <ScanToVanModal
          route={loadingRoute}
          brandTheme={brandTheme}
          isOpen={!!loadingRoute}
          onClose={() => setLoadingRoute(null)}
          onConfirmLoaded={(rId) => {
            onConfirmRouteLoaded(rId);
            setLoadingRoute(null);
          }}
        />
      )}

      {/* Top Header */}
      <header
        className="text-white px-6 py-4 shadow-sm border-b transition-colors duration-300 sticky top-0 z-40"
        style={{ backgroundColor: brandTheme.primaryColour, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div
              className="text-white px-3 py-1.5 rounded-xl shadow font-black text-xl tracking-wider uppercase"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {brandTheme.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">{brandTheme.companyName} Fleet Control</h1>
                {isHeadOfficeAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Head Office Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/40 flex items-center gap-1">
                    <Warehouse className="w-3 h-3" /> {currentDepot.city} Depot
                  </span>
                )}
              </div>
              <p className="text-xs opacity-80">
                {isHeadOfficeAdmin ? 'National Fleet Overview & Operations' : `${currentDepot.name}`}
              </p>
            </div>
          </div>

          {/* Right Top Controls: User Switcher & Depot Selector */}
          <div className="flex items-center space-x-3 flex-wrap">
            
            {/* User Switcher */}
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-300 font-bold uppercase leading-none">Signed in as:</span>
                <select
                  value={currentUser.id}
                  onChange={(e) => onSwitchUser(e.target.value)}
                  className="bg-transparent text-white font-bold border-0 focus:ring-0 cursor-pointer text-xs p-0 pr-4 mt-0.5"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="text-slate-900">
                      {u.name} ({u.role === 'HEAD_OFFICE_ADMIN' ? 'Head Office Admin' : `${depots.find(d => d.id === u.assignedDepotId)?.city || 'Depot'} Controller`})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Depot Selector: ONLY VISIBLE FOR HEAD OFFICE ADMIN */}
            {isHeadOfficeAdmin ? (
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 text-xs">
                <Warehouse className="w-3.5 h-3.5 text-blue-200" />
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="bg-transparent text-white font-bold border-0 focus:ring-0 cursor-pointer text-xs"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id} className="text-slate-900">
                      {d.code} - {d.name} ({d.postcode})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-400/30 flex items-center gap-2 text-xs">
                <Warehouse className="w-3.5 h-3.5 text-blue-300" />
                <span className="font-bold text-white text-xs">
                  {currentDepot.code} - {currentDepot.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'dashboard' ? brandTheme.secondaryColour : undefined }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'orders' ? brandTheme.secondaryColour : undefined }}
            >
              <Package className="w-4 h-4" />
              Orders ({activeOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'routes'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'routes' ? brandTheme.secondaryColour : undefined }}
            >
              <RouteIcon className="w-4 h-4" />
              Routes & Manifests ({activeRoutes.length})
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'map' ? brandTheme.secondaryColour : undefined }}
            >
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Telematics
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'settings' ? brandTheme.secondaryColour : undefined }}
            >
              <Settings className="w-4 h-4 text-amber-500" />
              Settings & Fleet Admin
            </button>
          </div>

          {/* Launch Driver App Direct Workflow */}
          {activeDrivers.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-emerald-900">Launch Driver Mobile App:</span>
              {activeDrivers.slice(0, 3).map((drv) => (
                <button
                  key={drv.id}
                  onClick={() => onSwitchToDriver(drv.id)}
                  className="text-xs bg-white text-slate-800 font-black px-2.5 py-1 rounded-lg shadow-xs hover:bg-emerald-600 hover:text-white border border-gray-200 transition"
                >
                  {drv.name.split(' ')[0]} 📱
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 0: CONTROLLER DISPATCH DASHBOARD */}
        {activeTab === 'dashboard' && (
          <MorningDashboard
            orders={orders}
            routes={routes}
            drivers={drivers}
            depots={depots}
            selectedDepotId={effectiveDepotId}
            brandTheme={brandTheme}
            shiftParams={shiftParams}
            onSelectDepot={setSelectedDepotId}
            onNavigateToTab={(t) => setActiveTab(t as any)}
            onSelectRoute={() => setActiveTab('routes')}
            onAutoBatchDepot={handleAutoBatchDepot}
            onCreateRoute={onCreateRoute}
          />
        )}

        {/* TAB 1: ORDER MANAGEMENT SYSTEM */}
        {activeTab === 'orders' && (
          <OrdersManager
            orders={orders}
            routes={routes}
            drivers={drivers}
            depots={depots}
            brandTheme={brandTheme}
            selectedDepotId={effectiveDepotId}
            onUpdateOrderDwell={onUpdateOrderDwell}
          />
        )}

        {/* TAB 2: ROUTES & MANIFESTS WITH DECOUPLED VANS */}
        {activeTab === 'routes' && (
          <RoutesManager
            routes={routes}
            drivers={drivers}
            vans={vans}
            depots={depots}
            selectedDepotId={effectiveDepotId}
            brandTheme={brandTheme}
            onAssignDriverToRoute={onAssignDriverToRoute}
            onAssignVanToRoute={onAssignVanToRoute}
            onUnassignOrCancelRoute={onUnassignOrCancelRoute}
            onMoveOrderBetweenRoutes={onMoveOrderBetweenRoutes}
            onOpenScanToVan={(r) => setLoadingRoute(r)}
            onSwitchToDriver={onSwitchToDriver}
          />
        )}

        {/* TAB 3: REAL MAP */}
        {activeTab === 'map' && (
          <DriverLiveMap
            drivers={drivers}
            routes={routes}
            onSelectDriverToView={onSwitchToDriver}
          />
        )}

        {/* TAB 4: FULL-PAGE SETTINGS & FLEET ADMIN */}
        {activeTab === 'settings' && (
          <SettingsPage
            brandTheme={brandTheme}
            onUpdateBrandTheme={onUpdateBrandTheme}
            skuCatalog={skuCatalog}
            onUpdateSkuCatalog={onUpdateSkuCatalog}
            depots={depots}
            onUpdateDepots={onUpdateDepots}
            shiftParams={shiftParams}
            onUpdateShiftParams={setShiftParams}
            users={users}
            onUpdateUsers={onUpdateUsers}
            drivers={drivers}
            onUpdateDrivers={onUpdateDrivers}
            vans={vans}
            onUpdateVans={onUpdateVans}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
};
