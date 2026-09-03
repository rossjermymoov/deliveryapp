import React, { useState } from 'react';
import { Depot, Driver, Shipment, DeliveryRoute, SkuDwellRule, DepotSettings, ChannelType } from '../types';
import { ChannelBadge } from './ChannelBadge';
import { optimizeRouteStops, autoBatchRoutesByVanCapacity } from '../utils/routing';
import { calculateOrderMetrics } from '../utils/dwellCalculator';
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
  Timer,
  Sliders,
  Layers,
  UserCheck,
  Edit3,
  Boxes,
  Plus
} from 'lucide-react';

interface Props {
  depots: Depot[];
  drivers: Driver[];
  shipments: Shipment[];
  routes: DeliveryRoute[];
  skuRules: SkuDwellRule[];
  depotSettings: DepotSettings;
  selectedDepotId: string;
  onSelectDepot: (id: string) => void;
  onCreateRoute: (route: DeliveryRoute) => void;
  onBatchCreateRoutes: (routes: DeliveryRoute[]) => void;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onUpdateShipmentDwell: (shipmentId: string, manualDwell: number) => void;
  onUpdateSkuRules: (rules: SkuDwellRule[]) => void;
  onUpdateSettings: (settings: DepotSettings) => void;
  onSimulateWebhook: (shipment: Partial<Shipment>) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  depots,
  drivers,
  shipments,
  routes,
  skuRules,
  depotSettings,
  selectedDepotId,
  onSelectDepot,
  onCreateRoute,
  onBatchCreateRoutes,
  onAssignDriverToRoute,
  onUpdateShipmentDwell,
  onUpdateSkuRules,
  onUpdateSettings,
  onSimulateWebhook,
  onSwitchToDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'bucket' | 'routes' | 'sku_settings' | 'pods' | 'webhook_sim'>('bucket');
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [editingDwellId, setEditingDwellId] = useState<string | null>(null);
  const [tempDwellVal, setTempDwellVal] = useState<number>(15);

  // SKU Management modal/form state
  const [newSkuCode, setNewSkuCode] = useState('');
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuDwell, setNewSkuDwell] = useState(15);
  const [newSkuUnits, setNewSkuUnits] = useState(2);

  // Single Route Optimization Preview
  const [singleOptimizationPreview, setSingleOptimizationPreview] = useState<any>(null);

  // Webhook Simulator Form State
  const [simChannel, setSimChannel] = useState<ChannelType>('B&Q');
  const [simCustomer, setSimCustomer] = useState('Acme Roofing Supplies');
  const [simAddress, setSimAddress] = useState('74 Gravelly Hill, Erdington');
  const [simPostcode, setSimPostcode] = useState('B23 7PF');
  const [simSelectedSku, setSimSelectedSku] = useState(skuRules[0]?.skuCode || 'FASCIA-5M');
  const [simQty, setSimQty] = useState(4);
  const [simNotes] = useState('Side alley drop-off');
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

  // Automated Batch Wave Logic (E.g. splitting 20 orders into 3 van routes)
  const handleAutoBatchAllBucketOrders = () => {
    if (depotPendingShipments.length === 0) return;

    const { batches } = autoBatchRoutesByVanCapacity(currentDepot, depotPendingShipments, depotSettings);
    const createdWaves: DeliveryRoute[] = [];

    batches.forEach((batchShipments, index) => {
      const opt = optimizeRouteStops(currentDepot, batchShipments);
      const waveId = `route-${Date.now()}-${index + 1}`;
      const waveRoute: DeliveryRoute = {
        id: waveId,
        routeNumber: `WAVE-${currentDepot.code}-${Date.now().toString().slice(-4)}-#${index + 1}`,
        name: `Wave #${index + 1} (${batchShipments.length} Stops)`,
        date: new Date().toISOString(),
        status: 'UNASSIGNED',
        dwellTimeTotalMins: opt.totalDwellMins,
        totalEstimatedMins: opt.totalDurationMins,
        totalDistanceKm: opt.totalDistanceKm,
        totalVanCapacityUsed: opt.totalCapacityUnits,
        maxVanCapacity: depotSettings.maxVanCapacityUnits,
        depotId: currentDepot.id,
        driverId: undefined,
        depot: currentDepot,
        shipments: opt.orderedStops.map((s) => ({
          ...s,
          routeId: waveId,
          status: 'ROUTED' as const,
        })),
      };
      createdWaves.push(waveRoute);
    });

    onBatchCreateRoutes(createdWaves);
    setSelectedShipmentIds([]);
    setActiveTab('routes');
  };

  // Build Single Route from manually selected orders
  const handleCalculateSingleRoute = () => {
    const selected = depotPendingShipments.filter((s) => selectedShipmentIds.includes(s.id));
    if (selected.length === 0) return;

    const opt = optimizeRouteStops(currentDepot, selected);
    setSingleOptimizationPreview(opt);
  };

  const handleConfirmSingleRoute = () => {
    if (!singleOptimizationPreview) return;

    const newRouteId = `route-${Date.now()}`;
    const newRoute: DeliveryRoute = {
      id: newRouteId,
      routeNumber: `RT-${currentDepot.code}-${Date.now().toString().slice(-4)}`,
      name: `Custom Picked Route (${singleOptimizationPreview.orderedStops.length} Stops)`,
      date: new Date().toISOString(),
      status: 'UNASSIGNED',
      dwellTimeTotalMins: singleOptimizationPreview.totalDwellMins,
      totalEstimatedMins: singleOptimizationPreview.totalDurationMins,
      totalDistanceKm: singleOptimizationPreview.totalDistanceKm,
      totalVanCapacityUsed: singleOptimizationPreview.totalCapacityUnits,
      maxVanCapacity: depotSettings.maxVanCapacityUnits,
      depotId: currentDepot.id,
      driverId: undefined,
      depot: currentDepot,
      shipments: singleOptimizationPreview.orderedStops.map((s: Shipment) => ({
        ...s,
        routeId: newRouteId,
        status: 'ROUTED' as const,
      })),
    };

    onCreateRoute(newRoute);
    setSelectedShipmentIds([]);
    setSingleOptimizationPreview(null);
    setActiveTab('routes');
  };

  const handleSaveManualDwell = (shipmentId: string) => {
    onUpdateShipmentDwell(shipmentId, tempDwellVal);
    setEditingDwellId(null);
  };

  const handleAddSkuRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuCode) return;
    const newRule: SkuDwellRule = {
      skuCode: newSkuCode.toUpperCase().trim(),
      name: newSkuName || newSkuCode,
      dwellMins: newSkuDwell,
      vanUnits: newSkuUnits,
    };
    onUpdateSkuRules([...skuRules, newRule]);
    setNewSkuCode('');
    setNewSkuName('');
  };

  const handleTriggerWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingNum = `KAL-${currentDepot.code}-${Math.floor(1000 + Math.random() * 9000)}`;
    const extRef = `${simChannel.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const matchedRule = skuRules.find((r) => r.skuCode === simSelectedSku) || skuRules[0];
    const orderItems = [
      {
        sku: matchedRule.skuCode,
        name: matchedRule.name,
        quantity: simQty,
        individualDwellMins: matchedRule.dwellMins,
        unitSize: matchedRule.vanUnits,
      }
    ];

    const metrics = calculateOrderMetrics(orderItems, skuRules, depotSettings);

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
      itemsDescription: `${simQty}x ${matchedRule.name}`,
      itemsList: orderItems,
      specialNotes: simNotes,
      calculatedDwellMins: metrics.calculatedDwellMins,
      vanCapacityUnits: metrics.vanCapacityUnits,
      status: 'BUCKET_PENDING',
      depotId: currentDepot.id,
      createdAt: new Date().toISOString(),
    };

    onSimulateWebhook(newShipment);
    setSimulatedSuccessMsg(`⚡ Inbound Webhook Processed! Order dropped in ${currentDepot.name} bucket with ${metrics.calculatedDwellMins}m dynamic dwell & ${metrics.vanCapacityUnits} van units.`);
    setTimeout(() => setSimulatedSuccessMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-[#003366] to-[#005696] text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FF6B00] text-white p-2.5 rounded-lg shadow font-black text-xl tracking-wider">
              KALSI
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kalsi Plastics UK Logistics Portal</h1>
              <p className="text-xs text-blue-200">22 Depots • SKU Dwell Calculator • Van Capacity Batcher</p>
            </div>
          </div>

          {/* Depot Picker */}
          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <Building2 className="w-5 h-5 text-[#FFB800]" />
            <div className="text-sm">
              <span className="text-blue-200 text-xs block">Depot Location</span>
              <select
                value={selectedDepotId}
                onChange={(e) => {
                  onSelectDepot(e.target.value);
                  setSelectedShipmentIds([]);
                  setSingleOptimizationPreview(null);
                }}
                className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer pr-4"
              >
                {depots.map((d) => (
                  <option key={d.id} value={d.id} className="text-gray-900">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3">
          <div className="flex space-x-2 flex-wrap gap-y-2">
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
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF6B00] text-white">
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
              Route Waves & Manifests ({depotRoutes.length})
            </button>

            <button
              onClick={() => setActiveTab('sku_settings')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'sku_settings'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#FF6B00]" />
              SKU Dwell Rules & Van Specs
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
              POD Proofs ({completedShipments.length})
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
              Simulate Webhook
            </button>
          </div>

          {/* Quick Launch Driver Views */}
          {depotDrivers.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <Truck className="w-4 h-4 text-[#005696]" />
              <span className="text-xs font-semibold text-[#005696]">Driver App:</span>
              {depotDrivers.map((drv) => (
                <button
                  key={drv.id}
                  onClick={() => onSwitchToDriver(drv.id)}
                  className="text-xs bg-white text-[#005696] font-bold px-2 py-0.5 rounded shadow-xs hover:bg-blue-600 hover:text-white border border-blue-200 transition"
                >
                  {drv.name.split(' ')[0]} 📱
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: ORDER BUCKET & AUTOMATED ROUTE WAVES */}
        {activeTab === 'bucket' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#005696]" />
                    {currentDepot.name} Order Bucket ({depotPendingShipments.length} Unrouted)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Dwell times are auto-calculated from SKU rules. Dispatchers can click on any dwell time to manually override.
                  </p>
                </div>

                <div className="flex items-center gap-2">
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
                  <p className="font-semibold text-gray-600">The order bucket is currently empty</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Simulate an incoming webhook from B&Q, Shopify, or eBay using the "Simulate Webhook" tab!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[580px] mt-2">
                  {depotPendingShipments.map((shipment) => {
                    const isSelected = selectedShipmentIds.includes(shipment.id);
                    const effectiveDwell = shipment.manualDwellOverrideMins !== undefined
                      ? shipment.manualDwellOverrideMins
                      : shipment.calculatedDwellMins;
                    const isOverridden = shipment.manualDwellOverrideMins !== undefined;

                    return (
                      <div
                        key={shipment.id}
                        className={`p-4 rounded-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-1 border ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#005696]/40 shadow-sm'
                            : 'hover:bg-slate-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectShipment(shipment.id)}
                            className="mt-1 h-4 w-4 rounded text-[#005696] focus:ring-[#005696] cursor-pointer"
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

                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Boxes className="w-3 h-3 text-slate-500" />
                            {shipment.vanCapacityUnits} van units
                          </span>

                          {editingDwellId === shipment.id ? (
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#005696] shadow-sm">
                              <input
                                type="number"
                                min="5"
                                max="90"
                                value={tempDwellVal}
                                onChange={(e) => setTempDwellVal(parseInt(e.target.value))}
                                className="w-14 text-xs font-bold p-1 border rounded text-center"
                              />
                              <button
                                onClick={() => handleSaveManualDwell(shipment.id)}
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
                                setEditingDwellId(shipment.id);
                                setTempDwellVal(effectiveDwell);
                              }}
                              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full transition border ${
                                isOverridden
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                              }`}
                              title="Click to manually override dwell time"
                            >
                              <Timer className="w-3.5 h-3.5 mr-1 text-gray-500" />
                              {effectiveDwell}m dwell {isOverridden && '(Override)'}
                              <Edit3 className="w-3 h-3 ml-1.5 opacity-60" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Route Generator & Van Constraint Engine */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="font-bold text-gray-900">Route Wave Dispatcher</h3>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-[#005696]" />
                    <h4 className="font-bold text-sm text-[#005696]">Automated Multi-Van Batcher</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Automatically cluster all <strong>{depotPendingShipments.length} unassigned orders</strong> into optimized van waves (Route #1, Route #2...) adhering to max <strong>{depotSettings.maxVanCapacityUnits} van units</strong> per run.
                  </p>

                  <button
                    onClick={handleAutoBatchAllBucketOrders}
                    disabled={depotPendingShipments.length === 0}
                    className="w-full py-3 bg-[#005696] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Layers className="w-4 h-4 text-[#FFB800]" />
                    Auto-Batch All Orders into Van Waves
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase">Manual Selection</span>
                    <span className="text-xs font-black text-[#005696]">
                      {selectedShipmentIds.length} orders selected
                    </span>
                  </div>

                  <button
                    onClick={handleCalculateSingleRoute}
                    disabled={selectedShipmentIds.length === 0}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    Preview Route for Selected
                  </button>
                </div>

                {singleOptimizationPreview && (
                  <div className="mt-4 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optimized Wave Ready
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">TOTAL TIME</span>
                        <span className="font-bold text-gray-900">{Math.floor(singleOptimizationPreview.totalDurationMins / 60)}h {singleOptimizationPreview.totalDurationMins % 60}m</span>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">VAN LOAD</span>
                        <span className="font-bold text-[#005696]">{singleOptimizationPreview.totalCapacityUnits} / {depotSettings.maxVanCapacityUnits} units</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmSingleRoute}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Create Route Wave (Assign Driver Later)
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 mt-4 bg-slate-50 p-2.5 rounded-lg">
                💡 <strong>Warehouse Logic:</strong> Routes are created first. Dispatchers can assign or re-assign any driver right before departure.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTE WAVES & DRIVER ASSIGNMENT */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-[#005696]" />
                  Created Route Waves for {currentDepot.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Routes created from the bucket. Assign any available depot driver when ready.
                </p>
              </div>

              <button
                onClick={handleAutoBatchAllBucketOrders}
                disabled={depotPendingShipments.length === 0}
                className="px-3.5 py-2 bg-[#005696] text-white font-bold text-xs rounded-xl shadow hover:bg-blue-800 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Layers className="w-4 h-4 text-[#FFB800]" />
                Auto-Batch Remaining Bucket ({depotPendingShipments.length})
              </button>
            </div>

            {depotRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No route waves generated yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Go to the Depot Order Bucket and click "Auto-Batch All Orders into Van Waves".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {depotRoutes.map((route) => {
                  const totalStops = route.shipments.length;
                  const isAssigned = !!route.driverId;

                  return (
                    <div key={route.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-mono font-bold text-[#005696]">{route.routeNumber}</span>
                            <h3 className="font-bold text-gray-900 text-sm">{route.name || 'Delivery Wave'}</h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            route.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            route.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            isAssigned ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {isAssigned ? `Driver: ${route.driver?.name.split(' ')[0]}` : 'UNASSIGNED (Ready to pick)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 my-3 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">STOPS</span>
                            <span className="font-bold text-gray-800">{totalStops}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">VAN LOAD</span>
                            <span className="font-bold text-[#005696]">{route.totalVanCapacityUsed || 6} / {route.maxVanCapacity || 16}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">DISTANCE</span>
                            <span className="font-bold text-gray-800">{route.totalDistanceKm} km</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-400 block text-[10px]">TIME</span>
                            <span className="font-bold text-gray-800">{Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m</span>
                          </div>
                        </div>

                        <div className="space-y-2 mt-3 max-h-40 overflow-y-auto pr-1">
                          {route.shipments.map((s, idx) => (
                            <div key={s.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-semibold text-gray-900 block">{s.customerName}</span>
                                  <span className="text-gray-500 text-[11px]">{s.postcode} • {s.itemsDescription.substring(0, 24)}...</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChannelBadge channel={s.sourceChannel} />
                                <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                                  {s.manualDwellOverrideMins || s.calculatedDwellMins}m
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[#005696]" />
                            Assign Depot Driver:
                          </label>
                          <select
                            value={route.driverId || ''}
                            onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                          >
                            <option value="">-- Unassigned (Select Driver) --</option>
                            {depotDrivers.map((drv) => (
                              <option key={drv.id} value={drv.id}>
                                {drv.name} ({drv.vehicleReg})
                              </option>
                            ))}
                          </select>
                        </div>

                        {route.driverId && (
                          <button
                            onClick={() => onSwitchToDriver(route.driverId!)}
                            className="mt-4 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#005696] font-bold text-xs rounded-lg transition shrink-0"
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

        {/* TAB 3: SKU DWELL RULES & VAN CONSTRAINTS CONFIG */}
        {activeTab === 'sku_settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#FF6B00]" />
                    SKU Dwell Time & Volume Rules
                  </h3>
                  <p className="text-xs text-gray-500">
                    Define how long each product SKU takes to offload and its volume unit consumption in a van.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <tr>
                      <th className="p-3">SKU Code</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Dwell Time</th>
                      <th className="p-3 text-center">Van Units</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skuRules.map((r, index) => (
                      <tr key={r.skuCode} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#005696]">{r.skuCode}</td>
                        <td className="p-3 font-semibold text-gray-800">{r.name}</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded font-bold">
                            {r.dwellMins} mins
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {r.vanUnits} units
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              const updated = skuRules.filter((_, i) => i !== index);
                              onUpdateSkuRules(updated);
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

              <form onSubmit={handleAddSkuRule} className="mt-6 p-4 bg-slate-50 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-[#005696]" />
                  Add New Product SKU Rule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="SKU Code (e.g. GUTTER-5M)"
                      value={newSkuCode}
                      onChange={(e) => setNewSkuCode(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Product Description"
                      value={newSkuName}
                      onChange={(e) => setNewSkuName(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Dwell Mins"
                      value={newSkuDwell}
                      onChange={(e) => setNewSkuDwell(parseInt(e.target.value))}
                      className="w-full text-xs p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Van Space Units"
                      value={newSkuUnits}
                      onChange={(e) => setNewSkuUnits(parseInt(e.target.value))}
                      className="w-full text-xs p-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-3 px-4 py-2 bg-[#005696] hover:bg-[#004070] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Add SKU Rule
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#005696]" />
                Van Capacity & Formula Logic
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Max Van Capacity (Volume Units)
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={depotSettings.maxVanCapacityUnits}
                  onChange={(e) =>
                    onUpdateSettings({ ...depotSettings, maxVanCapacityUnits: parseInt(e.target.value) })
                  }
                  className="w-full text-sm p-2 border rounded-lg"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Standard LWB Sprinter holds ~16 units of bulky plastics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Max Stops Allowed per Run
                </label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={depotSettings.maxStopsPerRun}
                  onChange={(e) =>
                    onUpdateSettings({ ...depotSettings, maxStopsPerRun: parseInt(e.target.value) })
                  }
                  className="w-full text-sm p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Multi-Item Dwell Calculation Logic
                </label>
                <select
                  value={depotSettings.dwellCalculationMode}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...depotSettings,
                      dwellCalculationMode: e.target.value as any,
                    })
                  }
                  className="w-full text-xs p-2 border rounded-lg"
                >
                  <option value="MAX_PLUS_BUFFER">Max Item Dwell + Buffer per extra line (Recommended)</option>
                  <option value="SUM">Exact Sum of all Item Dwells</option>
                  <option value="AVERAGE">Average Dwell Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: POD RECORDS */}
        {activeTab === 'pods' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Delivered Proofs (POD)
            </h2>
            {completedShipments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedShipments.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200">
                    <ChannelBadge channel={s.sourceChannel} />
                    <h3 className="font-bold text-gray-900 text-sm mt-2">{s.customerName}</h3>
                    <p className="text-xs text-gray-500">{s.address}</p>
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Signature:</span>
                      <img src={s.proofOfDelivery?.signatureData} alt="Signature" className="max-h-14 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEBHOOK SIMULATOR */}
        {activeTab === 'webhook_sim' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w-full">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
              Inbound Label API Webhook Simulator
            </h2>

            {simulatedSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {simulatedSuccessMsg}
              </div>
            )}

            <form onSubmit={handleTriggerWebhook} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Channel Origin</label>
                  <select
                    value={simChannel}
                    onChange={(e) => setSimChannel(e.target.value as ChannelType)}
                    className="w-full text-sm p-2 border rounded-lg"
                  >
                    <option value="B&Q">B&Q Marketplace</option>
                    <option value="Shopify">Shopify Direct</option>
                    <option value="eBay">eBay Channel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product SKU</label>
                  <select
                    value={simSelectedSku}
                    onChange={(e) => setSimSelectedSku(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  >
                    {skuRules.map((r) => (
                      <option key={r.skuCode} value={r.skuCode}>
                        {r.skuCode} ({r.dwellMins}m dwell)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={simCustomer}
                    onChange={(e) => setSimCustomer(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={simQty}
                    onChange={(e) => setSimQty(parseInt(e.target.value))}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={simAddress}
                    onChange={(e) => setSimAddress(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Postcode</label>
                  <input
                    type="text"
                    required
                    value={simPostcode}
                    onChange={(e) => setSimPostcode(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition mt-3"
              >
                Send Mock Webhook & Compute Dwell Dynamically
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
