import React, { useState } from 'react';
import { Order, Driver, DeliveryRoute, SkuDwellSetting, GlobalSettings } from '../types';
import { optimizeRouteStops, autoBatchOrdersByVanCapacity } from '../utils/routing';
import { calculateOrderDwellAndUnits } from '../utils/dwellCalculator';
import { DriverLiveMap } from './DriverLiveMap';
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
  Layers, 
  UserCheck, 
  Edit3, 
  Boxes, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Radio,
  Truck
} from 'lucide-react';

interface Props {
  orders: Order[];
  drivers: Driver[];
  routes: DeliveryRoute[];
  skuCatalog: SkuDwellSetting[];
  settings: GlobalSettings;
  onCreateRoute: (route: DeliveryRoute) => void;
  onBatchCreateRoutes: (routes: DeliveryRoute[]) => void;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onUpdateOrderDwell: (orderId: string, manualDwell: number) => void;
  onUpdateSkuCatalog: (catalog: SkuDwellSetting[]) => void;
  onUpdateSettings: (settings: GlobalSettings) => void;
  onSimulateNewOrder: (order: Partial<Order>) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  orders,
  drivers,
  routes,
  skuCatalog,
  settings,
  onCreateRoute,
  onBatchCreateRoutes,
  onAssignDriverToRoute,
  onUpdateOrderDwell,
  onUpdateSkuCatalog,
  onUpdateSettings,
  onSimulateNewOrder,
  onSwitchToDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'routes' | 'map' | 'sku_dwell' | 'pods' | 'new_order_sim'>('orders');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingDwellId, setEditingDwellId] = useState<string | null>(null);
  const [tempDwellVal, setTempDwellVal] = useState<number>(15);
  const [searchFilter, setSearchFilter] = useState('');

  // Single Route Preview State
  const [singleOptimizationPreview, setSingleOptimizationPreview] = useState<any>(null);

  // SKU Management modal state
  const [newSkuCode, setNewSkuCode] = useState('');
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuCategory, setNewSkuCategory] = useState<string>('Aquacel Roofline');
  const [newSkuDim, setNewSkuDim] = useState('5m length');
  const [newSkuDwell, setNewSkuDwell] = useState(15);
  const [newSkuUnits, setNewSkuUnits] = useState(3);

  // New Inbound Order Simulator Form State
  const [simCustomer, setSimCustomer] = useState('Central Midlands Roofing Supplies');
  const [simAddress, setSimAddress] = useState('24 Aston Expressway, Birmingham');
  const [simPostcode, setSimPostcode] = useState('B6 4DD');
  const [simSelectedSku, setSimSelectedSku] = useState(skuCatalog[0]?.sku || 'AQUACEL-FASCIA-5M-W');
  const [simQty, setSimQty] = useState(4);
  const [simNotes, setSimNotes] = useState('Bulky 5m fascias. Unload at yard entrance.');
  const [simulatedSuccessMsg, setSimulatedSuccessMsg] = useState('');

  const pendingOrders = orders.filter((o) => o.status === 'PENDING_DISPATCH');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED' && o.proofOfDelivery);

  const filteredOrders = pendingOrders.filter(
    (o) =>
      o.trackingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.postcode.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAutoBatchAllOrders = () => {
    if (pendingOrders.length === 0) return;

    const { batches } = autoBatchOrdersByVanCapacity(pendingOrders, settings);
    const createdRoutes: DeliveryRoute[] = [];

    batches.forEach((batch, index) => {
      const opt = optimizeRouteStops(batch);
      const routeId = `route-${Date.now()}-${index + 1}`;
      const newRoute: DeliveryRoute = {
        id: routeId,
        routeNumber: `ROUTE-0${index + 1}`,
        date: new Date().toISOString(),
        status: 'UNASSIGNED',
        dwellTimeTotalMins: opt.totalDwellMins,
        totalEstimatedMins: opt.totalDurationMins,
        totalDistanceKm: opt.totalDistanceKm,
        totalVanUnitsUsed: opt.totalCapacityUnits,
        maxVanCapacity: settings.maxVanCapacityUnits,
        driverId: undefined,
        orders: opt.orderedStops.map((o) => ({
          ...o,
          routeId,
          status: 'ROUTED' as const,
        })),
      };
      createdRoutes.push(newRoute);
    });

    onBatchCreateRoutes(createdRoutes);
    setSelectedOrderIds([]);
    setActiveTab('routes');
  };

  const handleCalculateSingleRoute = () => {
    const selected = pendingOrders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    const opt = optimizeRouteStops(selected);
    setSingleOptimizationPreview(opt);
  };

  const handleConfirmSingleRoute = () => {
    if (!singleOptimizationPreview) return;

    const routeId = `route-${Date.now()}`;
    const newRoute: DeliveryRoute = {
      id: routeId,
      routeNumber: `ROUTE-0${routes.length + 1}`,
      date: new Date().toISOString(),
      status: 'UNASSIGNED',
      dwellTimeTotalMins: singleOptimizationPreview.totalDwellMins,
      totalEstimatedMins: singleOptimizationPreview.totalDurationMins,
      totalDistanceKm: singleOptimizationPreview.totalDistanceKm,
      totalVanUnitsUsed: singleOptimizationPreview.totalCapacityUnits,
      maxVanCapacity: settings.maxVanCapacityUnits,
      driverId: undefined,
      orders: singleOptimizationPreview.orderedStops.map((o: Order) => ({
        ...o,
        routeId,
        status: 'ROUTED' as const,
      })),
    };

    onCreateRoute(newRoute);
    setSelectedOrderIds([]);
    setSingleOptimizationPreview(null);
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
      category: newSkuCategory,
      dimensions: newSkuDim,
      defaultDwellMins: newSkuDwell,
      vanSpaceUnits: newSkuUnits,
    };
    onUpdateSkuCatalog([...skuCatalog, newSku]);
    setNewSkuCode('');
    setNewSkuName('');
  };

  const handleCreateSimulatedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const tracking = `KAL-${Math.floor(880000 + Math.random() * 90000)}`;
    const matchedProduct = skuCatalog.find((s) => s.sku === simSelectedSku) || skuCatalog[0];

    const orderItems = [
      {
        sku: matchedProduct.sku,
        category: matchedProduct.category as any,
        name: matchedProduct.name,
        dimensions: matchedProduct.dimensions,
        quantity: simQty,
        individualDwellMins: matchedProduct.defaultDwellMins,
        vanSpaceUnits: matchedProduct.vanSpaceUnits,
      },
    ];

    const metrics = calculateOrderDwellAndUnits(orderItems, skuCatalog);

    const lat = 52.4862 + (Math.random() - 0.5) * 0.09;
    const lng = -1.8904 + (Math.random() - 0.5) * 0.09;

    const newOrder: Partial<Order> = {
      id: `ord-${Date.now()}`,
      trackingNumber: tracking,
      customerName: simCustomer,
      address: simAddress,
      city: 'Birmingham',
      postcode: simPostcode,
      lat,
      lng,
      items: orderItems,
      totalItemCount: metrics.totalItemCount,
      totalVanUnits: metrics.totalVanUnits,
      calculatedDwellMins: metrics.calculatedDwellMins,
      specialNotes: simNotes,
      status: 'PENDING_DISPATCH',
      createdAt: new Date().toISOString(),
    };

    onSimulateNewOrder(newOrder);
    setSimulatedSuccessMsg(`⚡ Inbound Webhook Received! Tracking #${tracking} loaded into Order Management with ${metrics.calculatedDwellMins}m dynamic dwell.`);
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
              <h1 className="text-xl font-bold tracking-tight">Kalsi Plastics Delivery & Fleet Management</h1>
              <p className="text-xs text-blue-200">Order Management • Dwell Logic • Fleet Dispatch • Live Telematics</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('map')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Driver Map ({drivers.length} Vans)
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
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Orders & Line Items
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6B00] text-white">
                {pendingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'routes'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <RouteIcon className="w-4 h-4" />
              Routes & Manifests ({routes.length})
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              Driver Live GPS Map
            </button>

            <button
              onClick={() => setActiveTab('sku_dwell')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'sku_dwell'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-[#FF6B00]" />
              Dwell Time Settings & Catalog
            </button>

            <button
              onClick={() => setActiveTab('pods')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'pods'
                  ? 'bg-[#005696] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Proof of Delivery ({completedOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('new_order_sim')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'new_order_sim'
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Simulate Inbound Webhook
            </button>
          </div>

          {/* Quick Launch Driver Views */}
          {drivers.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <Truck className="w-4 h-4 text-[#005696]" />
              <span className="text-xs font-semibold text-[#005696]">Driver App:</span>
              {drivers.map((drv) => (
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

        {/* TAB 1: ORDER MANAGEMENT SYSTEM (OMS) & DWELL CONTROLS */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#005696]" />
                    Order Management ({pendingOrders.length} Pending Orders)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Click an order to inspect all plastic units & dimensions. Click dwell time to override.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search tracking, customer..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-[#005696] w-48"
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
                  <p className="font-semibold text-gray-600">No pending orders found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[620px] mt-2">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    const isExpanded = expandedOrderId === order.id;
                    const effectiveDwell = order.manualDwellOverrideMins !== undefined
                      ? order.manualDwellOverrideMins
                      : order.calculatedDwellMins;
                    const isOverridden = order.manualDwellOverrideMins !== undefined;

                    return (
                      <div
                        key={order.id}
                        className={`rounded-xl transition my-1 border ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#005696]/40 shadow-sm'
                            : 'hover:bg-slate-50 border-gray-100'
                        }`}
                      >
                        {/* Order Summary Row */}
                        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOrder(order.id)}
                              className="mt-1 h-4 w-4 rounded text-[#005696] focus:ring-[#005696] cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-[#005696] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {order.trackingNumber}
                                </span>
                                <span className="text-xs text-gray-400">{order.items.length} Product Lines ({order.totalItemCount} Total Items)</span>
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm mt-1">
                                {order.customerName}
                              </h4>
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                {order.address}, {order.postcode}
                              </p>
                            </div>
                          </div>

                          {/* Dwell, Van Units & Line Details Toggle */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                              <Boxes className="w-3.5 h-3.5 text-slate-500" />
                              {order.totalVanUnits} Van Units
                            </span>

                            {editingDwellId === order.id ? (
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

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                              title="View units & items"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Order Items View */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-slate-50/80 border-t border-gray-100 rounded-b-xl">
                            <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                              Ordered Products & Specifications:
                            </h5>
                            <div className="space-y-1.5">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-2.5 rounded-lg border border-gray-200 text-xs flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#005696] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                                      {item.quantity}x
                                    </span>
                                    <div>
                                      <span className="font-bold text-gray-800">{item.name}</span>
                                      <span className="text-[11px] text-gray-500 block">
                                        Category: {item.category} • Dimensions: {item.dimensions}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[11px] font-semibold text-gray-600">
                                      {item.individualDwellMins}m dwell ({item.vanSpaceUnits} van units)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {order.specialNotes && (
                              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 italic">
                                ⚠️ <strong>Driver Note:</strong> {order.specialNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Route Generator & Van Wave Optimizer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="font-bold text-gray-900">Van Routing Engine</h3>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-5 h-5 text-[#005696]" />
                    <h4 className="font-bold text-sm text-[#005696]">Automated Multi-Van Batcher</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Automatically partition all <strong>{pendingOrders.length} pending orders</strong> into optimized van routes (Route 1, Route 2...) strictly respecting the <strong>{settings.maxVanCapacityUnits} van units</strong> capacity.
                  </p>

                  <button
                    onClick={handleAutoBatchAllOrders}
                    disabled={pendingOrders.length === 0}
                    className="w-full py-3 bg-[#005696] hover:bg-[#003d6d] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Layers className="w-4 h-4 text-[#FFB800]" />
                    Auto-Batch Orders into Van Routes
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase">Selected Orders</span>
                    <span className="text-xs font-black text-[#005696]">
                      {selectedOrderIds.length} orders selected
                    </span>
                  </div>

                  <button
                    onClick={handleCalculateSingleRoute}
                    disabled={selectedOrderIds.length === 0}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    Preview Route for Selected
                  </button>
                </div>

                {singleOptimizationPreview && (
                  <div className="mt-4 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 animate-fadeIn">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Optimized Route Ready
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">TOTAL TIME</span>
                        <span className="font-bold text-gray-900">{Math.floor(singleOptimizationPreview.totalDurationMins / 60)}h {singleOptimizationPreview.totalDurationMins % 60}m</span>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">VAN LOAD</span>
                        <span className="font-bold text-[#005696]">{singleOptimizationPreview.totalCapacityUnits} / {settings.maxVanCapacityUnits} units</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmSingleRoute}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Create Route (Assign Driver Later)
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 mt-4 bg-slate-50 p-2.5 rounded-lg">
                💡 <strong>Dispatch Workflow:</strong> Route 1 and Route 2 are generated first without driver dependencies. Drivers are assigned directly when loading the van.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTE WAVES & LATE DRIVER ASSIGNMENT */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-[#005696]" />
                  Generated Delivery Routes
                </h2>
                <p className="text-xs text-gray-500">
                  Pick and assign any driver to any route when ready for vehicle departure.
                </p>
              </div>

              <button
                onClick={handleAutoBatchAllOrders}
                disabled={pendingOrders.length === 0}
                className="px-3.5 py-2 bg-[#005696] text-white font-bold text-xs rounded-xl shadow hover:bg-blue-800 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Layers className="w-4 h-4 text-[#FFB800]" />
                Auto-Batch Remaining ({pendingOrders.length})
              </button>
            </div>

            {routes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No delivery routes generated yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Go to Orders tab and click "Auto-Batch Orders into Van Routes".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((route) => {
                  const totalStops = route.orders.length;
                  const isAssigned = !!route.driverId;

                  return (
                    <div key={route.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-mono font-black text-[#005696]">{route.routeNumber}</span>
                            <h3 className="font-bold text-gray-900 text-sm">Delivery Manifest</h3>
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
                            <span className="font-bold text-[#005696]">{route.totalVanUnitsUsed} / {route.maxVanCapacity}</span>
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

                        <div className="space-y-2 mt-3 max-h-44 overflow-y-auto pr-1">
                          {route.orders.map((ord, idx) => (
                            <div key={ord.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-semibold text-gray-900 block">{ord.customerName}</span>
                                  <span className="text-gray-500 text-[11px]">{ord.postcode} • {ord.totalItemCount} items</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded border">
                                {ord.manualDwellOverrideMins || ord.calculatedDwellMins}m dwell
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-[#005696]" />
                            Assign Driver to Route:
                          </label>
                          <select
                            value={route.driverId || ''}
                            onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
                          >
                            <option value="">-- Unassigned (Select Driver) --</option>
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

        {/* TAB 3: DRIVER LIVE GPS MAP & TELEMATICS */}
        {activeTab === 'map' && (
          <DriverLiveMap
            drivers={drivers}
            routes={routes}
            onSelectDriverToView={onSwitchToDriver}
          />
        )}

        {/* TAB 4: SKU DWELL SETTINGS & CATALOG */}
        {activeTab === 'sku_dwell' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#FF6B00]" />
                  Product Catalog & Dwell Times
                </h3>
                <p className="text-xs text-gray-500">
                  Configure offload dwell times and van volume units for Kalsi Aquacel, Duraklad & Aquaflow products.
                </p>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name & Dimensions</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Dwell Time</th>
                      <th className="p-3 text-center">Van Units</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skuCatalog.map((item, index) => (
                      <tr key={item.sku} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#005696]">{item.sku}</td>
                        <td className="p-3">
                          <span className="font-bold text-gray-900 block">{item.name}</span>
                          <span className="text-[11px] text-gray-500">{item.dimensions}</span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">{item.category}</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded font-bold">
                            {item.defaultDwellMins} mins
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">
                          {item.vanSpaceUnits} units
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

              {/* Add SKU */}
              <form onSubmit={handleAddSku} className="mt-6 p-4 bg-slate-50 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-[#005696]" />
                  Add Kalsi Product to Dwell Registry
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="SKU Code"
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
                    <select
                      value={newSkuCategory}
                      onChange={(e) => setNewSkuCategory(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg"
                    >
                      <option value="Aquacel Roofline">Aquacel Roofline</option>
                      <option value="Duraklad Cladding">Duraklad Cladding</option>
                      <option value="Aquaflow Drainage">Aquaflow Drainage</option>
                      <option value="Underground Soil/Waste">Underground Soil/Waste</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dimensions (e.g. 5m length)"
                      value={newSkuDim}
                      onChange={(e) => setNewSkuDim(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg"
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
                  className="mt-3 px-4 py-2 bg-[#005696] text-white text-xs font-bold rounded-lg shadow"
                >
                  Save Product Dwell Rule
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#005696]" />
                Van Capacity Settings
              </h3>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Maximum Van Capacity (Volume Units)
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={settings.maxVanCapacityUnits}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, maxVanCapacityUnits: parseInt(e.target.value) })
                  }
                  className="w-full text-sm p-2 border rounded-lg"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Standard 3.5t LWB Sprinter carries ~16 volume units of bulky plastic lengths.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Max Stops per Van Run
                </label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={settings.maxStopsPerVan}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, maxStopsPerVan: parseInt(e.target.value) })
                  }
                  className="w-full text-sm p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: POD RECORDS */}
        {activeTab === 'pods' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              Completed Proof of Delivery Records
            </h2>
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {ord.trackingNumber}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-2">{ord.customerName}</h3>
                    <p className="text-xs text-gray-500">{ord.address}, {ord.postcode}</p>
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Customer Signature:</span>
                      <img src={ord.proofOfDelivery?.signatureData} alt="Signature" className="max-h-14 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: WEBHOOK SIMULATOR */}
        {activeTab === 'new_order_sim' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w-full">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
              Inbound Webhook Receiver Simulator
            </h2>

            {simulatedSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {simulatedSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateSimulatedOrder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Selection</label>
                <select
                  value={simSelectedSku}
                  onChange={(e) => setSimSelectedSku(e.target.value)}
                  className="w-full text-sm p-2 border rounded-lg"
                >
                  {skuCatalog.map((s) => (
                    <option key={s.sku} value={s.sku}>
                      {s.name} ({s.dimensions}) - {s.defaultDwellMins}m dwell
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer / Merchant Name</label>
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
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

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Special Handling Notes</label>
                <input
                  type="text"
                  value={simNotes}
                  onChange={(e) => setSimNotes(e.target.value)}
                  className="w-full text-sm p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition mt-3"
              >
                Trigger Inbound Webhook (Load into Orders)
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
