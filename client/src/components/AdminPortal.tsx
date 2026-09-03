import React, { useState } from 'react';
import { Order, Driver, DeliveryRoute, SkuDwellSetting, ShiftParameters, BrandTheme, Depot } from '../types';
import { DEFAULT_SHIFT_PARAMS } from '../utils/routing';
import { DriverLiveMap } from './DriverLiveMap';
import { MorningDashboard } from './MorningDashboard';
import { ScanToVanModal } from './ScanToVanModal';
import { CustomerServiceLookup } from './CustomerServiceLookup';
import { OrdersManager } from './OrdersManager';
import { SettingsModal } from './SettingsModal';
import { 
  Package, 
  Route as RouteIcon, 
  CheckCircle2, 
  UserCheck, 
  Radio, 
  Truck, 
  LayoutDashboard,
  Warehouse,
  Barcode,
  Headphones,
  Settings
} from 'lucide-react';

interface Props {
  orders: Order[];
  drivers: Driver[];
  routes: DeliveryRoute[];
  depots: Depot[];
  skuCatalog: SkuDwellSetting[];
  brandTheme: BrandTheme;
  onUpdateBrandTheme: (theme: BrandTheme) => void;
  onUpdateDepots: (depots: Depot[]) => void;
  onCreateRoute: (route: DeliveryRoute) => void;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onUpdateOrderDwell: (orderId: string, manualDwell: number) => void;
  onUpdateSkuCatalog: (catalog: SkuDwellSetting[]) => void;
  onSimulateNewOrder: (order: Partial<Order>) => void;
  onSwitchToDriver: (driverId: string) => void;
  onOpenCustomerTracker?: (trackingNumber: string) => void;
  onConfirmRouteLoaded: (routeId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  orders,
  drivers,
  routes,
  depots,
  skuCatalog,
  brandTheme,
  onUpdateBrandTheme,
  onUpdateDepots,
  onCreateRoute,
  onAssignDriverToRoute,
  onUpdateOrderDwell,
  onUpdateSkuCatalog,
  onSwitchToDriver,
  onConfirmRouteLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'routes' | 'map' | 'cs_lookup'>('dashboard');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('depot-all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Scan to Van modal state
  const [loadingRoute, setLoadingRoute] = useState<DeliveryRoute | null>(null);

  // Shift & Traffic Parameters
  const [shiftParams, setShiftParams] = useState<ShiftParameters>(DEFAULT_SHIFT_PARAMS);

  // Filtered lists by selected depot
  const activeRoutes = selectedDepotId === 'depot-all'
    ? routes
    : routes.filter((r) => r.depotId === selectedDepotId);

  const activeOrders = selectedDepotId === 'depot-all'
    ? orders
    : orders.filter((o) => o.depotId === selectedDepotId);

  const handleAutoBatchDepot = () => {
    const currentDepot = depots.find(d => d.id === selectedDepotId) || depots[0];
    const maxPerVan = currentDepot.maxOrdersPerVan || 6;

    // Filter to only qualifying unassigned orders
    const pendingOrders = activeOrders.filter((o) => o.status === 'PENDING' && !o.belowRouteCriteria);
    if (pendingOrders.length === 0) return;

    const batches: Order[][] = [];
    for (let i = 0; i < pendingOrders.length; i += maxPerVan) {
      batches.push(pendingOrders.slice(i, i + maxPerVan));
    }

    batches.forEach((batch, idx) => {
      const routeId = `route-auto-${Date.now()}-${idx + 1}`;
      const depotName = currentDepot.city || 'Depot';

      const totalDwell = batch.reduce((acc, o) => acc + (o.manualDwellOverrideMins ?? o.totalDwellMins), 0);
      const totalDrive = 75 + (batch.length * 15);
      const totalEstimated = totalDwell + totalDrive + 45;

      const newRoute: DeliveryRoute = {
        id: routeId,
        routeNumber: `Route ${routes.length + idx + 1} (${depotName} Wave ${idx + 1})`,
        depotId: selectedDepotId === 'depot-all' ? 'depot-bhm' : selectedDepotId,
        date: new Date().toISOString(),
        status: 'UNASSIGNED',
        totalDwellMins: totalDwell,
        totalDrivingMins: totalDrive,
        breakTimeMins: 45,
        totalEstimatedMins: totalEstimated,
        totalDistanceKm: 28 + (batch.length * 7),
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

      {/* Unified Settings Modal (Editable Van Capacities, Dwell Times, Radius, Shifts, Branding) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        brandTheme={brandTheme}
        onUpdateBrandTheme={onUpdateBrandTheme}
        skuCatalog={skuCatalog}
        onUpdateSkuCatalog={onUpdateSkuCatalog}
        depots={depots}
        onUpdateDepots={onUpdateDepots}
        shiftParams={shiftParams}
        onUpdateShiftParams={setShiftParams}
      />

      {/* Top Header */}
      <header
        className="text-white px-6 py-4 shadow-sm border-b transition-colors duration-300 sticky top-0 z-40"
        style={{ backgroundColor: brandTheme.primaryColour, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className="text-white px-3 py-1.5 rounded-xl shadow font-black text-xl tracking-wider uppercase"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {brandTheme.logoText}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{brandTheme.companyName} Fleet Control</h1>
              <p className="text-xs opacity-80">Order Management, Routing Engine & Telematics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Depot Selector */}
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

            {/* TOP SETTINGS BUTTON */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Settings
            </button>
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
              Orders & Completed Deliveries ({activeOrders.length})
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
              onClick={() => setActiveTab('cs_lookup')}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
                activeTab === 'cs_lookup'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'cs_lookup' ? brandTheme.secondaryColour : undefined }}
            >
              <Headphones className="w-4 h-4 text-emerald-500" />
              Customer Service
            </button>
          </div>

          {/* Launch Driver App Direct Workflow */}
          {drivers.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-emerald-900">Launch Driver Mobile App:</span>
              {drivers.slice(0, 3).map((drv) => (
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
            selectedDepotId={selectedDepotId}
            brandTheme={brandTheme}
            shiftParams={shiftParams}
            onSelectDepot={setSelectedDepotId}
            onNavigateToTab={(t) => setActiveTab(t as any)}
            onSelectRoute={() => setActiveTab('routes')}
            onAutoBatchDepot={handleAutoBatchDepot}
            onCreateRoute={onCreateRoute}
          />
        )}

        {/* TAB 1: ORDER MANAGEMENT SYSTEM (UNASSIGNED & COMPLETED PODS) */}
        {activeTab === 'orders' && (
          <OrdersManager
            orders={orders}
            routes={routes}
            drivers={drivers}
            depots={depots}
            brandTheme={brandTheme}
            selectedDepotId={selectedDepotId}
            onUpdateOrderDwell={onUpdateOrderDwell}
          />
        )}

        {/* TAB 2: ROUTES & MANIFESTS */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
                  Delivery Routes & Manifests ({activeRoutes.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Verify scan-to-van loading, check shift feasibility, and assign fleet drivers.
                </p>
              </div>
            </div>

            {activeRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No delivery routes created yet for this depot</p>
                <p className="text-xs text-gray-400 mt-1">
                  Go to Dashboard and select unassigned orders to calculate routes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRoutes.map((route) => {
                  const isAssigned = !!route.driverId;
                  const isProblem = route.isProblemRoute || route.totalEstimatedMins > 480;

                  return (
                    <div
                      key={route.id}
                      className={`bg-white rounded-2xl p-5 shadow-sm border flex flex-col justify-between ${
                        isProblem ? 'border-rose-300 ring-1 ring-rose-200' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-mono font-black" style={{ color: brandTheme.secondaryColour }}>
                              {route.routeNumber}
                            </span>
                            <h3 className="font-bold text-gray-900 text-sm">Delivery Manifest</h3>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {route.allLoaded && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Van Loaded
                              </span>
                            )}
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isProblem ? 'bg-rose-100 text-rose-800' :
                              route.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              route.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                              isAssigned ? 'bg-indigo-100 text-indigo-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {isProblem ? '⚠️ Problem: Over 8h Shift' : isAssigned ? `Driver: ${route.driver?.name}` : 'UNASSIGNED'}
                            </span>
                          </div>
                        </div>

                        {/* Shift Breakdown Pills */}
                        <div className="grid grid-cols-4 gap-2 my-3 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-400 block text-[10px] font-bold">STOPS</span>
                            <span className="font-black text-gray-800">{route.orders.length}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-400 block text-[10px] font-bold">DRIVE TIME</span>
                            <span className="font-black text-gray-800">{Math.floor(route.totalDrivingMins / 60)}h {route.totalDrivingMins % 60}m</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-400 block text-[10px] font-bold">DWELL TIME</span>
                            <span className="font-black" style={{ color: brandTheme.secondaryColour }}>{Math.floor(route.totalDwellMins / 60)}h {route.totalDwellMins % 60}m</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-400 block text-[10px] font-bold">TOTAL SHIFT</span>
                            <span className={`font-black ${isProblem ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m
                            </span>
                          </div>
                        </div>

                        {isProblem && route.problemReason && (
                          <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 font-bold mb-2">
                            🚨 {route.problemReason}
                          </div>
                        )}

                        {/* Staging Scan-to-Van Button */}
                        <div className="my-2">
                          <button
                            onClick={() => setLoadingRoute(route)}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-gray-200"
                          >
                            <Barcode className="w-4 h-4 text-blue-600" />
                            {route.allLoaded ? 'Review Loaded Van Items' : 'Scan-to-Van Loading Verification (LIFO)'}
                          </button>
                        </div>

                        {/* Route Stops */}
                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
                          {route.orders.map((ord, idx) => (
                            <div key={ord.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-semibold text-gray-900 block">{ord.customerName}</span>
                                  <span className="text-gray-500 text-[11px]">{ord.postcode} • {ord.items.map((i) => `${i.quantity}x ${i.sku}`).join(', ')}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded border">
                                {ord.manualDwellOverrideMins || ord.totalDwellMins}m dwell
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Driver Assignment Dropdown */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" style={{ color: brandTheme.secondaryColour }} />
                            Assign Driver to Route:
                          </label>
                          <select
                            value={route.driverId || ''}
                            onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border-gray-300 p-2 border focus:ring-blue-500"
                          >
                            <option value="">-- Unassigned (Choose Driver) --</option>
                            {drivers.map((drv) => (
                              <option key={drv.id} value={drv.id}>
                                {drv.name} ({drv.vehicleReg})
                              </option>
                            ))}
                          </select>
                        </div>

                        {route.driverId && (
                          <button
                            onClick={() => onSwitchToDriver(route.driverId!)}
                            className="mt-4 py-2 px-3 bg-blue-50 hover:bg-blue-100 font-bold text-xs rounded-lg transition shrink-0"
                            style={{ color: brandTheme.secondaryColour }}
                          >
                            Open Driver View 📱
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REAL MAP */}
        {activeTab === 'map' && (
          <DriverLiveMap
            drivers={drivers}
            routes={routes}
            onSelectDriverToView={onSwitchToDriver}
          />
        )}

        {/* TAB 4: CUSTOMER SERVICE LOOKUP */}
        {activeTab === 'cs_lookup' && (
          <CustomerServiceLookup
            orders={orders}
            routes={routes}
            drivers={drivers}
            brandTheme={brandTheme}
          />
        )}
      </main>
    </div>
  );
};
