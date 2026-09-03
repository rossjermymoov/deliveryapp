import React, { useState } from 'react';
import { Order, Driver, DeliveryRoute, SkuDwellSetting, ShiftParameters, BrandTheme, Depot } from '../types';
import { optimizeRouteStops, DEFAULT_SHIFT_PARAMS } from '../utils/routing';
import { DriverLiveMap } from './DriverLiveMap';
import { MorningDashboard } from './MorningDashboard';
import { ScanToVanModal } from './ScanToVanModal';
import { CustomerServiceLookup } from './CustomerServiceLookup';
import { DepotRadiusManager } from './DepotRadiusManager';
import { PRESET_THEMES } from '../data/initialData';
import { 
  Package, 
  MapPin,
  Route as RouteIcon, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  FileCheck2, 
  Timer, 
  Sliders, 
  UserCheck, 
  Edit3, 
  Plus, 
  Search, 
  Radio, 
  Truck, 
  Phone, 
  Mail, 
  ListOrdered, 
  Coffee, 
  Car, 
  AlertTriangle,
  Clock,
  Palette,
  Check,
  LayoutDashboard,
  Warehouse,
  Barcode,
  ExternalLink,
  Headphones,
  Compass
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
  onOpenCustomerTracker: (trackingNumber: string) => void;
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
  onOpenCustomerTracker,
  onConfirmRouteLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'routes' | 'depots' | 'map' | 'cs_lookup' | 'sku_dwell' | 'pods' | 'branding'>('dashboard');
  const [selectedDepotId, setSelectedDepotId] = useState<string>('depot-all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [editingDwellId, setEditingDwellId] = useState<string | null>(null);
  const [tempDwellVal, setTempDwellVal] = useState<number>(15);
  const [searchFilter, setSearchFilter] = useState('');

  // Scan to Van modal state
  const [loadingRoute, setLoadingRoute] = useState<DeliveryRoute | null>(null);

  // Shift & Traffic Parameters
  const [shiftParams, setShiftParams] = useState<ShiftParameters>(DEFAULT_SHIFT_PARAMS);

  // Route Preview
  const [routePreview, setRoutePreview] = useState<any>(null);

  // SKU Management modal state
  const [newSkuCode, setNewSkuCode] = useState('');
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuDwell, setNewSkuDwell] = useState(15);

  // Filtered lists by selected depot
  const activeOrders = selectedDepotId === 'depot-all'
    ? orders
    : orders.filter((o) => o.depotId === selectedDepotId);

  const activeRoutes = selectedDepotId === 'depot-all'
    ? routes
    : routes.filter((r) => r.depotId === selectedDepotId);

  const pendingOrders = activeOrders.filter((o) => o.status === 'PENDING');
  const completedOrders = activeOrders.filter((o) => o.status === 'DELIVERED' && o.proofOfDelivery);

  const filteredOrders = pendingOrders.filter(
    (o) =>
      o.trackingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.postcode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.items.some((i) => i.sku.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCalculateRoute = () => {
    const selected = pendingOrders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    const opt = optimizeRouteStops(selected, shiftParams);
    setRoutePreview(opt);
  };

  const handleConfirmRoute = () => {
    if (!routePreview) return;

    const isProblem = !routePreview.shiftAnalysis.fitsInShift;
    const currentDepot = depots.find(d => d.id === selectedDepotId);
    const routeNumber = `Route ${routes.length + 1} (${selectedDepotId === 'depot-all' ? 'Midlands Hub' : currentDepot?.city || 'Regional'})`;
    
    const newRoute: DeliveryRoute = {
      id: `route-${Date.now()}`,
      routeNumber,
      depotId: selectedDepotId === 'depot-all' ? 'depot-bhm' : selectedDepotId,
      date: new Date().toISOString(),
      status: 'UNASSIGNED',
      totalDwellMins: routePreview.totalDwellMins,
      totalDrivingMins: routePreview.totalDrivingMins,
      breakTimeMins: routePreview.breakTimeMins,
      totalEstimatedMins: routePreview.totalDurationMins,
      totalDistanceKm: routePreview.totalDistanceKm,
      shiftUtilisationPct: routePreview.shiftAnalysis.utilisationPct,
      isProblemRoute: isProblem,
      problemReason: isProblem
        ? `Exceeds ${shiftParams.shiftLengthHours}h Shift Limit (${Math.floor(routePreview.totalDurationMins / 60)}h ${routePreview.totalDurationMins % 60}m total). Split stops across vans.`
        : undefined,
      driverId: undefined,
      orders: routePreview.orderedStops.map((o: Order) => ({
        ...o,
        routeId: `route-${Date.now()}`,
        status: 'ROUTED' as const,
      })),
    };

    onCreateRoute(newRoute);
    setSelectedOrderIds([]);
    setRoutePreview(null);
    setActiveTab('routes');
  };

  const handleAutoBatchDepot = () => {
    if (pendingOrders.length === 0) return;

    const chunkSize = 4;
    const batches: Order[][] = [];
    for (let i = 0; i < pendingOrders.length; i += chunkSize) {
      batches.push(pendingOrders.slice(i, i + chunkSize));
    }

    batches.forEach((batch, idx) => {
      const opt = optimizeRouteStops(batch, shiftParams);
      const isProblem = !opt.shiftAnalysis.fitsInShift;
      const routeId = `route-auto-${Date.now()}-${idx + 1}`;
      const depotName = depots.find(d => d.id === selectedDepotId)?.city || 'Depot';

      const newRoute: DeliveryRoute = {
        id: routeId,
        routeNumber: `Route ${routes.length + idx + 1} (${depotName} Wave ${idx + 1})`,
        depotId: selectedDepotId === 'depot-all' ? 'depot-bhm' : selectedDepotId,
        date: new Date().toISOString(),
        status: 'UNASSIGNED',
        totalDwellMins: opt.totalDwellMins,
        totalDrivingMins: opt.totalDrivingMins,
        breakTimeMins: opt.breakTimeMins,
        totalEstimatedMins: opt.totalDurationMins,
        totalDistanceKm: opt.totalDistanceKm,
        shiftUtilisationPct: opt.shiftAnalysis.utilisationPct,
        isProblemRoute: isProblem,
        problemReason: isProblem ? `Exceeds ${shiftParams.shiftLengthHours}h limit.` : undefined,
        driverId: undefined,
        orders: opt.orderedStops.map((o) => ({
          ...o,
          routeId,
          status: 'ROUTED' as const,
        })),
      };

      onCreateRoute(newRoute);
    });

    setSelectedOrderIds([]);
    setActiveTab('routes');
  };

  const handleSaveManualDwell = (orderId: string) => {
    onUpdateOrderDwell(orderId, tempDwellVal);
    setEditingDwellId(null);
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuCode) return;
    const newSku: SkuDwellSetting = {
      sku: newSkuCode.toUpperCase().trim(),
      name: newSkuName || newSkuCode,
      defaultDwellMins: newSkuDwell,
    };
    onUpdateSkuCatalog([...skuCatalog, newSku]);
    setNewSkuCode('');
    setNewSkuName('');
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
        className="text-white px-6 py-4 shadow-sm border-b transition-colors duration-300"
        style={{ backgroundColor: brandTheme.primaryColour, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className="text-white px-3 py-1.5 rounded-lg shadow font-black text-xl tracking-wider uppercase transition-colors"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {brandTheme.logoText}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{brandTheme.companyName} Operations Hub</h1>
              <p className="text-xs opacity-80">Planning, Depots, Telematics & Customer Service Backend</p>
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

            <button
              onClick={() => onOpenCustomerTracker(orders[0]?.trackingNumber || 'KAL-889101')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              Customer Tracking 🌐
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Palette className="w-4 h-4 text-emerald-400" />
              White-Label
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Telematics Map
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
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'dashboard' ? brandTheme.secondaryColour : undefined }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Morning Dashboard
            </button>

            <button
              onClick={() => setActiveTab('depots')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'depots'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'depots' ? brandTheme.secondaryColour : undefined }}
            >
              <Compass className="w-4 h-4 text-blue-500" />
              Depots & Radius ({depots.filter(d => d.id !== 'depot-all').length})
            </button>

            <button
              onClick={() => setActiveTab('cs_lookup')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'cs_lookup'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'cs_lookup' ? brandTheme.secondaryColour : undefined }}
            >
              <Headphones className="w-4 h-4 text-emerald-500" />
              Customer Service & Telematics
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'orders' ? brandTheme.secondaryColour : undefined }}
            >
              <Package className="w-4 h-4" />
              Orders ({pendingOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
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
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'map' ? brandTheme.secondaryColour : undefined }}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              Live Telematics
            </button>

            <button
              onClick={() => setActiveTab('sku_dwell')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'sku_dwell'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'sku_dwell' ? brandTheme.secondaryColour : undefined }}
            >
              <Sliders className="w-4 h-4 text-amber-500" />
              Dwell Times
            </button>

            <button
              onClick={() => setActiveTab('pods')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'pods'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'pods' ? brandTheme.secondaryColour : undefined }}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              POD Archive ({completedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'branding'
                  ? 'text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ backgroundColor: activeTab === 'branding' ? brandTheme.secondaryColour : undefined }}
            >
              <Palette className="w-4 h-4 text-indigo-500" />
              White-Label
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

        {/* TAB 0: MORNING LIVE DISPATCH DASHBOARD */}
        {activeTab === 'dashboard' && (
          <MorningDashboard
            orders={orders}
            routes={routes}
            drivers={drivers}
            depots={depots}
            selectedDepotId={selectedDepotId}
            brandTheme={brandTheme}
            onSelectDepot={setSelectedDepotId}
            onNavigateToTab={(t) => setActiveTab(t as any)}
            onSelectRoute={() => setActiveTab('routes')}
            onAutoBatchDepot={handleAutoBatchDepot}
          />
        )}

        {/* TAB 1: DEPOT RADIUS & CATCHMENT CONFIGURATION */}
        {activeTab === 'depots' && (
          <DepotRadiusManager
            depots={depots}
            brandTheme={brandTheme}
            onUpdateDepots={onUpdateDepots}
          />
        )}

        {/* TAB 2: CUSTOMER SERVICE & TELEMATICS LOOKUP */}
        {activeTab === 'cs_lookup' && (
          <CustomerServiceLookup
            orders={orders}
            routes={routes}
            drivers={drivers}
            brandTheme={brandTheme}
            onOpenCustomerTracker={onOpenCustomerTracker}
          />
        )}

        {/* TAB 3: ORDER MANAGEMENT SYSTEM */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
                    Unassigned Orders ({pendingOrders.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Select orders to calculate optimal route based on dwell times, live traffic & breaks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-blue-500 w-44"
                    />
                  </div>
                  <button
                    onClick={() => setSelectedOrderIds(pendingOrders.map((o) => o.id))}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                  <Package className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-600">No unassigned orders found for this depot</p>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto max-h-[640px] mt-3 pr-1">
                  {filteredOrders.map((order, idx) => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    const effectiveDwell = order.manualDwellOverrideMins !== undefined
                      ? order.manualDwellOverrideMins
                      : order.totalDwellMins;
                    const isOverridden = order.manualDwellOverrideMins !== undefined;

                    const borderColours = [
                      'border-l-[#0072CE]',
                      'border-l-[#16A34A]',
                      'border-l-[#D97706]',
                      'border-l-[#6366F1]',
                      'border-l-[#0F1E36]',
                    ];
                    const activeBorderColour = borderColours[idx % borderColours.length];

                    return (
                      <div
                        key={order.id}
                        className={`p-4 rounded-xl transition border border-gray-200 border-l-[6px] shadow-sm ${activeBorderColour} ${
                          isSelected
                            ? 'bg-blue-50/60 ring-2 ring-blue-600'
                            : 'bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Order Header & Contact Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2.5 border-b border-gray-100">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOrder(order.id)}
                              className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onOpenCustomerTracker(order.trackingNumber)}
                                  className="font-mono text-xs font-black px-2 py-0.5 rounded border hover:underline flex items-center gap-1"
                                  style={{ color: brandTheme.secondaryColour, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
                                  title="Open live customer tracking portal"
                                >
                                  {order.trackingNumber}
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-gray-900 text-sm">{order.customerName}</span>
                              </div>
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                {order.address}, {order.city} <strong className="text-gray-900">{order.postcode}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Contact Info & Dwell Time */}
                          <div className="flex sm:flex-col items-end gap-1.5 shrink-0 self-end sm:self-center">
                            <div className="text-[11px] text-gray-600 flex items-center gap-3">
                              <span className="flex items-center gap-1 font-medium">
                                <Phone className="w-3 h-3 text-blue-600" /> {order.customerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" /> {order.customerEmail}
                              </span>
                            </div>

                            {/* Dwell Time Badge */}
                            {editingDwellId === order.id ? (
                              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-600 shadow-sm mt-1">
                                <input
                                  type="number"
                                  min="5"
                                  max="90"
                                  value={tempDwellVal}
                                  onChange={(e) => setTempDwellVal(parseInt(e.target.value))}
                                  className="w-14 text-xs font-bold p-1 border rounded-center"
                                />
                                <button
                                  onClick={() => handleSaveManualDwell(order.id)}
                                  className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingDwellId(null)}
                                  className="px-1.5 py-1 text-gray-400 text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingDwellId(order.id);
                                  setTempDwellVal(effectiveDwell);
                                }}
                                className={`inline-flex items-center text-xs px-3 py-1 rounded-full transition border mt-1 ${
                                  isOverridden
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                    : 'bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 border-gray-300'
                                }`}
                                title="Click to override dwell time"
                              >
                                <Timer className="w-3.5 h-3.5 mr-1 text-gray-600" />
                                {effectiveDwell}m dwell {isOverridden && '(Override)'}
                                <Edit3 className="w-3 h-3 ml-1.5 opacity-60" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order Product Lines */}
                        <div className="pt-3">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <ListOrdered className="w-3.5 h-3.5" style={{ color: brandTheme.secondaryColour }} />
                            Order Items:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="bg-slate-50 p-2.5 rounded-lg border border-gray-200 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span
                                    className="font-mono font-black text-[11px] block"
                                    style={{ color: brandTheme.secondaryColour }}
                                  >
                                    {item.sku}
                                  </span>
                                  <span className="font-medium text-gray-800">{item.name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-xs bg-white text-slate-900 px-2.5 py-1 rounded-md border border-gray-300 shadow-2xs">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Traffic, Dwell & Driver Break Shift Feasibility Engine */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-gray-900">Shift & Route Optimiser</h3>
                </div>

                {/* Shift & Traffic Settings */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                    <span>Driver Shift Parameters</span>
                    <span className="font-black" style={{ color: brandTheme.secondaryColour }}>
                      {shiftParams.shiftLengthHours}h Max Shift
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-gray-500 font-bold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" style={{ color: brandTheme.secondaryColour }} /> Max Shift (Hours)
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="12"
                        step="0.5"
                        value={shiftParams.shiftLengthHours}
                        onChange={(e) => setShiftParams({ ...shiftParams, shiftLengthHours: parseFloat(e.target.value) || 8 })}
                        className="w-full text-xs font-bold p-1.5 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 font-bold mb-1 flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-600" /> Break Time (Mins)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        step="15"
                        value={shiftParams.mandatoryBreakMins}
                        onChange={(e) => setShiftParams({ ...shiftParams, mandatoryBreakMins: parseInt(e.target.value) || 45 })}
                        className="w-full text-xs font-bold p-1.5 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-blue-600" /> Traffic Buffer (Google Maps)
                      </span>
                      <span className="font-black" style={{ color: brandTheme.secondaryColour }}>
                        +{Math.round((shiftParams.trafficBufferMultiplier - 1) * 100)}% Traffic
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="1.6"
                      step="0.05"
                      value={shiftParams.trafficBufferMultiplier}
                      onChange={(e) => setShiftParams({ ...shiftParams, trafficBufferMultiplier: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculate Route Trigger */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="text-xs font-bold text-gray-700 uppercase">Selected Orders</span>
                    <span className="text-sm font-black" style={{ color: brandTheme.secondaryColour }}>
                      {selectedOrderIds.length} orders
                    </span>
                  </div>

                  <button
                    onClick={handleCalculateRoute}
                    disabled={selectedOrderIds.length === 0}
                    className="w-full py-3 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: brandTheme.primaryColour }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Calculate Route & Evaluate Feasibility
                  </button>
                </div>

                {/* Optimised Route & Shift Breakdown Preview */}
                {routePreview && (
                  <div className={`mt-5 p-4 rounded-xl border animate-fadeIn ${
                    routePreview.shiftAnalysis.fitsInShift
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-rose-50/70 border-rose-300'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-gray-900">
                        {routePreview.shiftAnalysis.fitsInShift ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Feasible ({routePreview.shiftAnalysis.utilisationPct}% of {shiftParams.shiftLengthHours}h Shift)
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Exceeds {shiftParams.shiftLengthHours}h Shift Limit!
                          </>
                        )}
                      </h5>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-white p-2 rounded shadow-2xs text-center border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">DRIVING TIME</span>
                        <span className="font-black text-gray-800">
                          {Math.floor(routePreview.totalDrivingMins / 60)}h {routePreview.totalDrivingMins % 60}m
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-2xs text-center border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">DWELL TIME</span>
                        <span className="font-black" style={{ color: brandTheme.secondaryColour }}>
                          {Math.floor(routePreview.totalDwellMins / 60)}h {routePreview.totalDwellMins % 60}m
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-2xs text-center border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">MANDATORY BREAK</span>
                        <span className="font-black text-amber-700">
                          {routePreview.breakTimeMins} mins
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs mb-3 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Total Shift Duration:</span>
                      <span className="font-black text-base" style={{ color: brandTheme.secondaryColour }}>
                        {Math.floor(routePreview.totalDurationMins / 60)}h {routePreview.totalDurationMins % 60}m
                        <span className="text-xs text-gray-400 font-normal ml-1">({routePreview.totalDistanceKm} km)</span>
                      </span>
                    </div>

                    <button
                      onClick={handleConfirmRoute}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Save & Create Route (Assign Driver Later)
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 mt-4 bg-slate-50 p-2.5 rounded-lg border border-gray-200">
                💡 <strong>Shift Calculation:</strong> Total Shift = Live Traffic Driving Time + Total Customer Dwells + Mandatory 45m Rest Break.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ROUTES & MANIFESTS */}
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
                  Go to the Morning Dashboard or Orders tab and click "Auto-Batch".
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

        {/* TAB 5: REAL MAP */}
        {activeTab === 'map' && (
          <DriverLiveMap
            drivers={drivers}
            routes={routes}
            onSelectDriverToView={onSwitchToDriver}
          />
        )}

        {/* TAB 6: DWELL TIMES PER PRODUCT */}
        {activeTab === 'sku_dwell' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                Dwell Times per Product SKU
              </h3>
              <p className="text-xs text-gray-500">
                Set the delivery dwell time in minutes for each product SKU.
              </p>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Dwell Time (Mins)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skuCatalog.map((item, index) => (
                    <tr key={item.sku} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold" style={{ color: brandTheme.secondaryColour }}>{item.sku}</td>
                      <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="p-3 text-center">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded font-bold">
                          {item.defaultDwellMins} minutes
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const updated = skuCatalog.filter((_, i) => i !== index);
                            onUpdateSkuCatalog(updated);
                          }}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New SKU Form */}
            <form onSubmit={handleAddSku} className="mt-6 p-4 bg-slate-50 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1">
                <Plus className="w-4 h-4" style={{ color: brandTheme.secondaryColour }} />
                Add Product SKU & Dwell Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="SKU (e.g. FAS-5M-OAK)"
                    value={newSkuCode}
                    onChange={(e) => setNewSkuCode(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newSkuName}
                    onChange={(e) => setNewSkuName(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Dwell Time (Mins)"
                    value={newSkuDwell}
                    onChange={(e) => setNewSkuDwell(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-3 px-4 py-2 text-white text-xs font-bold rounded-lg shadow"
                style={{ backgroundColor: brandTheme.primaryColour }}
              >
                Save Product Dwell Time
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: WHITE-LABEL BRANDING & CUSTOMISATION SETTINGS */}
        {activeTab === 'branding' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  White-Label Branding & Company Customisation
                </h3>
                <p className="text-xs text-gray-500">
                  Instantly rebrand the entire application for Kalsi Plastics or customise it to sell to other enterprise clients.
                </p>
              </div>
            </div>

            {/* Presets Grid */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">1-Click Brand Presets:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(PRESET_THEMES).map(([key, preset]) => {
                  const isActive = brandTheme.companyName === preset.companyName;
                  return (
                    <button
                      key={key}
                      onClick={() => onUpdateBrandTheme(preset)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isActive
                          ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50/40 shadow-sm'
                          : 'hover:bg-slate-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-gray-900">{preset.companyName}</span>
                          {isActive && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2">{preset.tagline}</p>
                      </div>

                      <div className="flex gap-1.5 mt-3">
                        <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.primaryColour }}></span>
                        <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.secondaryColour }}></span>
                        <span className="w-4 h-4 rounded-full border shadow-2xs" style={{ backgroundColor: preset.accentColour }}></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Branding Controls */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Custom Theme & Colour Pickers:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    value={brandTheme.companyName}
                    onChange={(e) => onUpdateBrandTheme({ ...brandTheme, companyName: e.target.value })}
                    className="w-full text-xs font-semibold p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Logo Badge Text</label>
                  <input
                    type="text"
                    value={brandTheme.logoText}
                    onChange={(e) => onUpdateBrandTheme({ ...brandTheme, logoText: e.target.value })}
                    className="w-full text-xs font-semibold p-2 border rounded-lg bg-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">System Tagline</label>
                  <input
                    type="text"
                    value={brandTheme.tagline}
                    onChange={(e) => onUpdateBrandTheme({ ...brandTheme, tagline: e.target.value })}
                    className="w-full text-xs font-semibold p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Primary Header Colour</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandTheme.primaryColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, primaryColour: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.primaryColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, primaryColour: e.target.value })}
                      className="flex-1 text-xs font-mono p-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Brand Accent Colour (Buttons & Badges)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandTheme.secondaryColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, secondaryColour: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.secondaryColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, secondaryColour: e.target.value })}
                      className="flex-1 text-xs font-mono p-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Status / Secondary Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandTheme.accentColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, accentColour: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.accentColour}
                      onChange={(e) => onUpdateBrandTheme({ ...brandTheme, accentColour: e.target.value })}
                      className="flex-1 text-xs font-mono p-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: POD RECORDS */}
        {activeTab === 'pods' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Completed Proof of Delivery Records ({completedOrders.length})
            </h2>
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {ord.trackingNumber}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {ord.proofOfDelivery?.timestamp}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm">{ord.customerName}</h3>
                    <p className="text-xs text-gray-500">{ord.address}, {ord.postcode}</p>

                    {ord.proofOfDelivery?.hasItemExceptions && (
                      <div className="p-2 bg-rose-50 text-rose-800 font-bold text-xs rounded-lg border border-rose-200">
                        ⚠️ Exception: {ord.proofOfDelivery.itemExceptionNotes}
                      </div>
                    )}

                    <div className="mt-2 bg-gray-50 p-3 rounded-xl border">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Signed by: {ord.proofOfDelivery?.recipientName}</span>
                      <img src={ord.proofOfDelivery?.signatureData} alt="Signature" className="max-h-12 mt-1 object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
