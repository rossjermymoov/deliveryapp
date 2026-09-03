import React, { useState } from 'react';
import { Depot, Driver, Shipment, DeliveryRoute, ChannelType } from '../types';
import { ChannelBadge } from './ChannelBadge';
import { optimizeRouteStops } from '../utils/routing';
import { 
  Building2, 
  Truck, 
  Package, 
  MapPin, 
  Route as RouteIcon, 
  Sparkles, 
  CheckCircle2, 
  Send,
  FileCheck2,
  Timer
} from 'lucide-react';

interface Props {
  depots: Depot[];
  drivers: Driver[];
  shipments: Shipment[];
  routes: DeliveryRoute[];
  selectedDepotId: string;
  onSelectDepot: (id: string) => void;
  onCreateRoute: (route: DeliveryRoute) => void;
  onSimulateWebhook: (shipment: Partial<Shipment>) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  depots,
  drivers,
  shipments,
  routes,
  selectedDepotId,
  onSelectDepot,
  onCreateRoute,
  onSimulateWebhook,
  onSwitchToDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'bucket' | 'routes' | 'pods' | 'webhook_sim'>('bucket');
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [dwellTimeMins, setDwellTimeMins] = useState<number>(15);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationPreview, setOptimizationPreview] = useState<any>(null);

  // Webhook Simulator Form State
  const [simChannel, setSimChannel] = useState<ChannelType>('B&Q');
  const [simCustomer, setSimCustomer] = useState('Acme Roofing Ltd');
  const [simAddress, setSimAddress] = useState('74 Gravelly Hill, Erdington');
  const [simPostcode, setSimPostcode] = useState('B23 7PF');
  const [simItems, setSimItems] = useState('6x 5m Black Soffit, 4x Gutter Jointers');
  const [simNotes, setSimNotes] = useState('Side alley drop-off');
  const [simDwell, setSimDwell] = useState(15);
  const [simulatedSuccessMsg, setSimulatedSuccessMsg] = useState('');

  const currentDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];
  const depotDrivers = drivers.filter((d) => d.depotId === currentDepot.id);
  const depotPendingShipments = shipments.filter(
    (s) => s.depotId === currentDepot.id && s.status === 'BUCKET_PENDING'
  );
  const depotRoutes = routes.filter((r) => r.depotId === currentDepot.id);
  const completedShipments = shipments.filter(
    (s) => s.depotId === currentDepot.id && s.status === 'DELIVERED' && s.proofOfDelivery
  );

  const handleToggleSelectShipment = (id: string) => {
    setSelectedShipmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectFirst8 = () => {
    const ids = depotPendingShipments.slice(0, 8).map((s) => s.id);
    setSelectedShipmentIds(ids);
  };

  const handleCalculateRoute = () => {
    const selected = depotPendingShipments.filter((s) => selectedShipmentIds.includes(s.id));
    if (selected.length === 0) return;

    setIsOptimizing(true);
    setTimeout(() => {
      const opt = optimizeRouteStops(currentDepot, selected, dwellTimeMins);
      setOptimizationPreview(opt);
      setIsOptimizing(false);
    }, 400);
  };

  const handleConfirmAndDispatch = () => {
    if (!optimizationPreview) return;

    const newRouteId = `route-${Date.now()}`;
    const newRoute: DeliveryRoute = {
      id: newRouteId,
      routeNumber: `RT-${currentDepot.code}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      status: selectedDriverId ? 'ASSIGNED' : 'DRAFT',
      dwellTimePerStop: dwellTimeMins,
      totalEstimatedMins: optimizationPreview.totalDurationMins,
      totalDistanceKm: optimizationPreview.totalDistanceKm,
      depotId: currentDepot.id,
      driverId: selectedDriverId || undefined,
      depot: currentDepot,
      driver: drivers.find((d) => d.id === selectedDriverId),
      shipments: optimizationPreview.orderedStops.map((s: Shipment) => ({
        ...s,
        routeId: newRouteId,
        status: 'ROUTED' as const,
      })),
    };

    onCreateRoute(newRoute);
    setSelectedShipmentIds([]);
    setOptimizationPreview(null);
    setActiveTab('routes');
  };

  const handleTriggerWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingNum = `KAL-${currentDepot.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    const extRef = `${simChannel.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const lat = currentDepot.lat + (Math.random() - 0.5) * 0.08;
    const lng = currentDepot.lng + (Math.random() - 0.5) * 0.08;

    const newShipment: Partial<Shipment> = {
      id: `shp-${Date.now()}`,
      trackingNumber: trackingNum,
      externalOrderId: extRef,
      sourceChannel: simChannel,
      customerName: simCustomer,
      address: simAddress,
      city: currentDepot.name.split(' ')[0],
      postcode: simPostcode,
      lat,
      lng,
      itemsDescription: simItems,
      specialNotes: simNotes,
      dwellTimeMins: simDwell,
      status: 'BUCKET_PENDING',
      depotId: currentDepot.id,
      createdAt: new Date().toISOString(),
    };

    onSimulateWebhook(newShipment);
    setSimulatedSuccessMsg(`⚡ Webhook received! Label "${trackingNum}" generated & dropped into ${currentDepot.name} bucket.`);
    setTimeout(() => setSimulatedSuccessMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#003366] to-[#005696] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FF6B00] text-white p-2.5 rounded-lg shadow font-black text-xl tracking-wider">
              KALSI
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kalsi Plastics UK Logistics Portal</h1>
              <p className="text-xs text-blue-200">22 UK Depots • Webhook Ingestion Engine • Route Dispatch</p>
            </div>
          </div>

          {/* Depot Picker */}
          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <Building2 className="w-5 h-5 text-[#FFB800]" />
            <div className="text-sm">
              <span className="text-blue-200 text-xs block">Active Depot ({depots.length} UK Locations)</span>
              <select
                value={selectedDepotId}
                onChange={(e) => {
                  onSelectDepot(e.target.value);
                  setSelectedShipmentIds([]);
                  setOptimizationPreview(null);
                }}
                className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer pr-4"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id} className="text-gray-900">
                    {d.name} ({d.code}) - {d.postcode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Navigation Tabs & Key Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('bucket')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'bucket'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Depot Order Bucket
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF6B00] text-white">
                {depotPendingShipments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'routes'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <RouteIcon className="w-4 h-4" />
              Active Routes & Manifests ({depotRoutes.length})
            </button>

            <button
              onClick={() => setActiveTab('pods')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'pods'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Delivered & POD Proofs ({completedShipments.length})
            </button>

            <button
              onClick={() => setActiveTab('webhook_sim')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'webhook_sim'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Simulate Label Webhook
            </button>
          </div>

          {/* Quick Driver Launch Switcher */}
          {depotDrivers.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <Truck className="w-4 h-4 text-[#005696]" />
              <span className="text-xs font-semibold text-[#005696]">Driver App View:</span>
              {depotDrivers.map((drv) => (
                <button
                  key={drv.id}
                  onClick={() => onSwitchToDriver(drv.id)}
                  className="text-xs bg-white text-[#005696] font-bold px-2.5 py-1 rounded shadow-sm hover:bg-blue-600 hover:text-white border border-blue-200 transition"
                >
                  {drv.name.split(' ')[0]} 📱
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: DEPOT BUCKET & ROUTE OPTIMIZER */}
        {activeTab === 'bucket' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Pending Bucket Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#005696]" />
                    {currentDepot.name} Order Bucket
                  </h2>
                  <p className="text-xs text-gray-500">
                    Parcels received via label creation webhooks waiting to be routed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectFirst8}
                    disabled={depotPendingShipments.length === 0}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    Select 8 Max Capacity
                  </button>
                  <button
                    onClick={() => setSelectedShipmentIds(depotPendingShipments.map((s) => s.id))}
                    disabled={depotPendingShipments.length === 0}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {depotPendingShipments.length === 0 ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                  <Package className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-600">The order bucket for this depot is empty</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Simulate an incoming webhook from B&Q, Shopify, or eBay using the "Simulate Label Webhook" tab!
                  </p>
                  <button
                    onClick={() => setActiveTab('webhook_sim')}
                    className="mt-4 px-4 py-2 bg-[#FF6B00] text-white text-xs font-bold rounded-lg shadow hover:bg-orange-600 transition"
                  >
                    Simulate Webhook Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[580px] mt-2">
                  {depotPendingShipments.map((shipment) => {
                    const isSelected = selectedShipmentIds.includes(shipment.id);
                    return (
                      <div
                        key={shipment.id}
                        onClick={() => handleToggleSelectShipment(shipment.id)}
                        className={`p-4 rounded-xl transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-1 border ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#005696]/40 shadow-sm'
                            : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4 rounded text-[#005696] focus:ring-[#005696]"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <ChannelBadge channel={shipment.sourceChannel} />
                              <span className="font-mono text-xs font-bold text-gray-600">
                                {shipment.trackingNumber}
                              </span>
                              <span className="text-xs text-gray-400">({shipment.externalOrderId})</span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">
                              {shipment.customerName}
                            </h4>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {shipment.address}, {shipment.postcode}
                            </p>
                            <p className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 mt-1 inline-block">
                              📦 {shipment.itemsDescription}
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:self-center shrink-0">
                          <span className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                            <Timer className="w-3.5 h-3.5 mr-1 text-gray-500" />
                            {shipment.dwellTimeMins} min dwell
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Route Config & Optimization Engine */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="font-bold text-gray-900">Route & Dwell Optimizer</h3>
                </div>

                {/* Form Controls */}
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Selected Orders to Route
                    </label>
                    <div className="text-2xl font-black text-[#005696]">
                      {selectedShipmentIds.length}{' '}
                      <span className="text-xs font-medium text-gray-500">
                        {selectedShipmentIds.length === 8 ? '(Ideal Capacity: 8 Stops)' : 'orders selected'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Dwell Time per Delivery Stop</span>
                      <span className="text-[#FF6B00] font-bold">{dwellTimeMins} Minutes</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="45"
                      step="5"
                      value={dwellTimeMins}
                      onChange={(e) => setDwellTimeMins(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Kalsi plastic items (fascias/soffits) typically take 15-20 mins to unload safely.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Assign Depot Driver
                    </label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-[#005696] focus:ring-[#005696] p-2 border"
                    >
                      <option value="">-- Choose Driver (or assign later) --</option>
                      {depotDrivers.map((drv) => (
                        <option key={drv.id} value={drv.id}>
                          {drv.name} ({drv.vehicleReg})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCalculateRoute}
                    disabled={selectedShipmentIds.length === 0 || isOptimizing}
                    className="w-full py-3 bg-[#005696] hover:bg-[#004070] text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isOptimizing ? (
                      <span>Calculating Shortest Route...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#FFB800]" />
                        Run Route Optimization
                      </>
                    )}
                  </button>
                </div>

                {/* Optimization Results Preview */}
                {optimizationPreview && (
                  <div className="mt-6 p-4 bg-blue-50/70 rounded-xl border border-blue-200 animate-fadeIn">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#005696] mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optimized Sequence Ready
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-white p-2 rounded shadow-xs">
                        <span className="text-gray-500 block">Total Travel:</span>
                        <span className="font-bold text-gray-900">{optimizationPreview.totalDistanceKm} km</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-xs">
                        <span className="text-gray-500 block">Est. Duration:</span>
                        <span className="font-bold text-[#005696]">{Math.floor(optimizationPreview.totalDurationMins / 60)}h {optimizationPreview.totalDurationMins % 60}m</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-xs">
                        <span className="text-gray-500 block">Driving Time:</span>
                        <span className="font-semibold text-gray-700">{optimizationPreview.totalDrivingMins} mins</span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-xs">
                        <span className="text-gray-500 block">Dwell Time:</span>
                        <span className="font-semibold text-amber-700">{optimizationPreview.totalDwellMins} mins</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {optimizationPreview.orderedStops.map((s: Shipment, index: number) => (
                        <div key={s.id} className="text-xs bg-white p-2 rounded border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#005696] text-white font-bold flex items-center justify-center text-[10px]">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-gray-800 truncate max-w-[140px]">{s.customerName}</span>
                          </div>
                          <ChannelBadge channel={s.sourceChannel} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {optimizationPreview && (
                <button
                  onClick={handleConfirmAndDispatch}
                  className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Manifest & Dispatch Route
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE ROUTES & MANIFESTS */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-[#005696]" />
              Active Routes for {currentDepot.name}
            </h2>

            {depotRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No routes created yet for this depot</p>
                <p className="text-xs text-gray-400 mt-1">
                  Go to the Depot Order Bucket, select parcels, and click "Run Route Optimization" to generate a route.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {depotRoutes.map((route) => {
                  const deliveredCount = route.shipments.filter((s) => s.status === 'DELIVERED').length;
                  const totalStops = route.shipments.length;
                  const progressPct = totalStops > 0 ? (deliveredCount / totalStops) * 100 : 0;

                  return (
                    <div key={route.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-mono font-bold text-[#005696]">{route.routeNumber}</span>
                            <h3 className="font-bold text-gray-900 text-sm">{route.driver?.name || 'Unassigned Driver'}</h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            route.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            route.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {route.status}
                          </span>
                        </div>

                        {/* Route Metric Pills */}
                        <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">STOPS</span>
                            <span className="font-bold text-gray-800">{totalStops}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">DISTANCE</span>
                            <span className="font-bold text-gray-800">{route.totalDistanceKm} km</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">EST. TIME</span>
                            <span className="font-bold text-gray-800">{Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="my-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Delivery Progress</span>
                            <span className="font-bold text-gray-800">{deliveredCount} / {totalStops} Delivered</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                          </div>
                        </div>

                        {/* Stops List */}
                        <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                          {route.shipments.map((s, idx) => (
                            <div key={s.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  s.status === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-semibold text-gray-900 block">{s.customerName}</span>
                                  <span className="text-gray-500 text-[11px]">{s.postcode}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChannelBadge channel={s.sourceChannel} />
                                {s.status === 'DELIVERED' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-medium">{s.status}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {route.driverId && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => onSwitchToDriver(route.driverId!)}
                            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#005696] font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Open Driver Mobile View for {route.driver?.name?.split(' ')[0]}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DELIVERED & POD PROOFS */}
        {activeTab === 'pods' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Proof of Delivery (POD) Records - {currentDepot.name}
            </h2>

            {completedShipments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No Proof of Delivery records yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Once a driver completes a delivery on the mobile app, their signature, photos, and GPS coordinates will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedShipments.map((s) => {
                  const pod = s.proofOfDelivery!;
                  return (
                    <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <ChannelBadge channel={s.sourceChannel} />
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            DELIVERED
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="font-mono text-xs font-bold text-gray-500">{s.trackingNumber}</span>
                          <h3 className="font-bold text-gray-900 text-sm">{s.customerName}</h3>
                          <p className="text-xs text-gray-500">{s.address}, {s.postcode}</p>
                          <p className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded mt-2 border border-amber-200">
                            📦 {s.itemsDescription}
                          </p>
                        </div>

                        {/* Customer Signature Box */}
                        <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <span className="text-[11px] font-bold text-gray-600 uppercase block mb-1">
                            Customer Signature ({pod.recipientName})
                          </span>
                          <div className="bg-white rounded border border-gray-300 p-1 flex items-center justify-center min-h-[70px]">
                            {pod.signatureData ? (
                              <img src={pod.signatureData} alt="Signature" className="max-h-16 object-contain" />
                            ) : (
                              <span className="text-xs text-gray-400 italic">Signature recorded</span>
                            )}
                          </div>
                        </div>

                        {/* On Site Photo */}
                        {pod.photoUrl && (
                          <div className="mt-3">
                            <span className="text-[11px] font-bold text-gray-600 uppercase block mb-1">
                              On-Site Photo Proof
                            </span>
                            <img src={pod.photoUrl} alt="POD Photo" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                          </div>
                        )}

                        {pod.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic bg-slate-50 p-2 rounded">
                            "{pod.notes}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>GPS: {pod.deliveredLat?.toFixed(4)}, {pod.deliveredLng?.toFixed(4)}</span>
                        <span>{new Date(pod.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SIMULATE LABEL WEBHOOK */}
        {activeTab === 'webhook_sim' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w-full">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Simulate API Label Creation Webhook</h2>
                <p className="text-xs text-gray-500">
                  Simulate the external API label generator creating a shipment from B&Q, Shopify, or eBay.
                </p>
              </div>
            </div>

            {simulatedSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {simulatedSuccessMsg}
              </div>
            )}

            <form onSubmit={handleTriggerWebhook} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sales Channel</label>
                  <select
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value as ChannelType)}
                    className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                  >
                    <option value="B&Q">B&Q Marketplace</option>
                    <option value="Shopify">Shopify Store</option>
                    <option value="eBay">eBay Channel</option>
                    <option value="Direct">Direct Trade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Depot</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentDepot.name} (${currentDepot.code})`}
                    className="w-full text-sm bg-gray-100 rounded-lg p-2 border border-gray-200 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer / Trade Name</label>
                <input
                  type="text"
                  required
                  value={simCustomer}
                  onChange={(e) => setSimCustomer(e.target.value)}
                  className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={simAddress}
                    onChange={(e) => setSimAddress(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postcode</label>
                  <input
                    type="text"
                    required
                    value={simPostcode}
                    onChange={(e) => setSimPostcode(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Plastic Goods Description (Bulky Items)</label>
                <input
                  type="text"
                  required
                  value={simItems}
                  onChange={(e) => setSimItems(e.target.value)}
                  className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected Dwell Time (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={simDwell}
                    onChange={(e) => setSimDwell(parseInt(e.target.value))}
                    className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Driver Notes / Access Code</label>
                  <input
                    type="text"
                    value={simNotes}
                    onChange={(e) => setSimNotes(e.target.value)}
                    className="w-full text-sm rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                <Sparkles className="w-4 h-4" />
                Trigger Inbound Webhook (Drop into Bucket)
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
