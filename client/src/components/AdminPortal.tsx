import React, { useState } from 'react';
import { Order, Driver, DeliveryRoute, SkuDwellSetting, ShiftParameters } from '../types';
import { optimizeRouteStops, DEFAULT_SHIFT_PARAMS } from '../utils/routing';
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
  Clock
} from 'lucide-react';

interface Props {
  orders: Order[];
  drivers: Driver[];
  routes: DeliveryRoute[];
  skuCatalog: SkuDwellSetting[];
  onCreateRoute: (route: DeliveryRoute) => void;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onUpdateOrderDwell: (orderId: string, manualDwell: number) => void;
  onUpdateSkuCatalog: (catalog: SkuDwellSetting[]) => void;
  onSimulateNewOrder: (order: Partial<Order>) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const AdminPortal: React.FC<Props> = ({
  orders,
  drivers,
  routes,
  skuCatalog,
  onCreateRoute,
  onAssignDriverToRoute,
  onUpdateOrderDwell,
  onUpdateSkuCatalog,
  onSimulateNewOrder,
  onSwitchToDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'routes' | 'map' | 'sku_dwell' | 'pods' | 'new_order_sim'>('orders');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [editingDwellId, setEditingDwellId] = useState<string | null>(null);
  const [tempDwellVal, setTempDwellVal] = useState<number>(15);
  const [searchFilter, setSearchFilter] = useState('');

  // Shift & Traffic Parameters
  const [shiftParams, setShiftParams] = useState<ShiftParameters>(DEFAULT_SHIFT_PARAMS);

  // Route Preview
  const [routePreview, setRoutePreview] = useState<any>(null);

  // SKU Management modal state
  const [newSkuCode, setNewSkuCode] = useState('');
  const [newSkuName, setNewSkuName] = useState('');
  const [newSkuDwell, setNewSkuDwell] = useState(15);

  // New Inbound Order Simulator Form State
  const [simName, setSimName] = useState('Mark Richardson (Apex Roofing)');
  const [simPhone, setSimPhone] = useState('07711 998877');
  const [simEmail, setSimEmail] = useState('mark@apexroof.co.uk');
  const [simAddress, setSimAddress] = useState('24 Aston Expressway, Birmingham');
  const [simPostcode, setSimPostcode] = useState('B6 4DD');
  const [simSku, setSimSku] = useState(skuCatalog[0]?.sku || 'FAS-5M-WHT');
  const [simQty, setSimQty] = useState(4);
  const [simNotes, setSimNotes] = useState('Deliver to front trade gate');
  const [simSuccess, setSimSuccess] = useState('');

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED' && o.proofOfDelivery);

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

    const routeNumber = `Route ${routes.length + 1}`;
    const newRoute: DeliveryRoute = {
      id: `route-${Date.now()}`,
      routeNumber,
      date: new Date().toISOString(),
      status: 'UNASSIGNED',
      totalDwellMins: routePreview.totalDwellMins,
      totalDrivingMins: routePreview.totalDrivingMins,
      breakTimeMins: routePreview.breakTimeMins,
      totalEstimatedMins: routePreview.totalDurationMins,
      totalDistanceKm: routePreview.totalDistanceKm,
      shiftUtilizationPct: routePreview.shiftAnalysis.utilizationPct,
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

  const handleCreateSimulatedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const tracking = `KAL-${Math.floor(880000 + Math.random() * 90000)}`;
    const matchedProduct = skuCatalog.find((s) => s.sku === simSku) || skuCatalog[0];

    const orderItems = [
      {
        sku: matchedProduct.sku,
        name: matchedProduct.name,
        quantity: simQty,
        dwellMinsPerUnit: matchedProduct.defaultDwellMins,
      },
    ];

    const newOrder: Partial<Order> = {
      id: `ord-${Date.now()}`,
      trackingNumber: tracking,
      customerName: simName,
      customerPhone: simPhone,
      customerEmail: simEmail,
      address: simAddress,
      city: 'Birmingham',
      postcode: simPostcode,
      lat: 52.4862 + (Math.random() - 0.5) * 0.08,
      lng: -1.8904 + (Math.random() - 0.5) * 0.08,
      items: orderItems,
      totalDwellMins: matchedProduct.defaultDwellMins,
      specialNotes: simNotes,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    onSimulateNewOrder(newOrder);
    setSimSuccess(`⚡ Order created! Tracking #${tracking} loaded.`);
    setTimeout(() => setSimSuccess(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#003366] text-white px-6 py-4 shadow-sm border-b border-blue-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg shadow font-black text-xl tracking-wider">
              KALSI
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kalsi Plastics Delivery & Fleet Management</h1>
              <p className="text-xs text-blue-200">Order Management • Traffic & Dwell Routing • Live Fleet Map</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('map')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Fleet Map
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
              Orders ({pendingOrders.length})
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
              Routes ({routes.length})
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
              Live Driver Map
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
              Dwell Times per Product
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
              <span className="text-xs font-semibold text-[#005696]">Driver View:</span>
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

        {/* TAB 1: ORDER MANAGEMENT SYSTEM */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders with Distinct High-Contrast Left Borders */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#005696]" />
                    Orders ({pendingOrders.length})
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
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-[#005696] w-44"
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
                  <p className="font-semibold text-gray-600">No pending orders</p>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto max-h-[640px] mt-3 pr-1">
                  {filteredOrders.map((order, idx) => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    const effectiveDwell = order.manualDwellOverrideMins !== undefined
                      ? order.manualDwellOverrideMins
                      : order.totalDwellMins;
                    const isOverridden = order.manualDwellOverrideMins !== undefined;

                    // Alternating distinctive high-contrast border colors
                    const borderColors = [
                      'border-l-[#005696]', // Kalsi Deep Blue
                      'border-l-[#FF6B00]', // Kalsi Safety Orange
                      'border-l-emerald-600', // Emerald Green
                      'border-l-indigo-600', // Royal Indigo
                      'border-l-amber-500', // Amber
                      'border-l-purple-600', // Purple
                    ];
                    const activeBorderColor = borderColors[idx % borderColors.length];

                    return (
                      <div
                        key={order.id}
                        className={`p-4 rounded-xl transition border border-gray-200 border-l-[6px] shadow-sm ${activeBorderColor} ${
                          isSelected
                            ? 'bg-blue-50/60 ring-2 ring-[#005696]'
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
                              className="mt-1 h-4 w-4 rounded text-[#005696] focus:ring-[#005696] cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-[#005696] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {order.trackingNumber}
                                </span>
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
                                <Phone className="w-3 h-3 text-[#005696]" /> {order.customerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-400" /> {order.customerEmail}
                              </span>
                            </div>

                            {/* Dwell Time Badge / Override */}
                            {editingDwellId === order.id ? (
                              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#005696] shadow-sm mt-1">
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

                        {/* Order Product Lines (SKU & Quantity) */}
                        <div className="pt-3">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <ListOrdered className="w-3.5 h-3.5 text-[#005696]" />
                            Order Items:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="bg-slate-50 p-2.5 rounded-lg border border-gray-200 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-mono font-black text-[#005696] text-[11px] block">
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
                  <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="font-bold text-gray-900">Shift & Route Optimizer</h3>
                </div>

                {/* Shift & Traffic Settings */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="text-xs font-bold text-gray-700 uppercase flex items-center justify-between">
                    <span>Driver Shift Parameters</span>
                    <span className="text-[#005696] font-black">{shiftParams.shiftLengthHours}h Max Shift</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-gray-500 font-bold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#005696]" /> Max Shift (Hours)
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
                        <Car className="w-3 h-3 text-blue-600" /> Google Maps Traffic Buffer
                      </span>
                      <span className="font-black text-[#005696]">+{Math.round((shiftParams.trafficBufferMultiplier - 1) * 100)}% Traffic</span>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="1.6"
                      step="0.05"
                      value={shiftParams.trafficBufferMultiplier}
                      onChange={(e) => setShiftParams({ ...shiftParams, trafficBufferMultiplier: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005696]"
                    />
                  </div>
                </div>

                {/* Calculate Route Trigger */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <span className="text-xs font-bold text-gray-700 uppercase">Selected Orders</span>
                    <span className="text-sm font-black text-[#005696]">
                      {selectedOrderIds.length} orders
                    </span>
                  </div>

                  <button
                    onClick={handleCalculateRoute}
                    disabled={selectedOrderIds.length === 0}
                    className="w-full py-3 bg-[#005696] hover:bg-[#004070] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFB800]" />
                    Calculate Route & Evaluate Feasibility
                  </button>
                </div>

                {/* Optimized Route & Shift Breakdown Preview */}
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
                            Feasible ({routePreview.shiftAnalysis.utilizationPct}% of {shiftParams.shiftLengthHours}h Shift)
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Exceeds {shiftParams.shiftLengthHours}h Shift Limit!
                          </>
                        )}
                      </h5>
                    </div>

                    {/* Detailed Duration Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-white p-2 rounded shadow-2xs text-center border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">DRIVING TIME</span>
                        <span className="font-black text-gray-800">
                          {Math.floor(routePreview.totalDrivingMins / 60)}h {routePreview.totalDrivingMins % 60}m
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded shadow-2xs text-center border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">DWELL TIME</span>
                        <span className="font-black text-[#FF6B00]">
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
                      <span className="font-black text-base text-[#005696]">
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

        {/* TAB 2: ROUTES & DRIVER ASSIGNMENT */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5 text-[#005696]" />
                  Delivery Routes ({routes.length})
                </h2>
                <p className="text-xs text-gray-500">
                  Assign any available driver to a route when ready for departure.
                </p>
              </div>
            </div>

            {routes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">No delivery routes created yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Select orders in the Orders tab and click "Calculate Route".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((route) => {
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
                            {isAssigned ? `Driver: ${route.driver?.name}` : 'UNASSIGNED'}
                          </span>
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
                            <span className="font-black text-[#FF6B00]">{Math.floor(route.totalDwellMins / 60)}h {route.totalDwellMins % 60}m</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-400 block text-[10px] font-bold">TOTAL SHIFT</span>
                            <span className="font-black text-[#005696]">{Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m</span>
                          </div>
                        </div>

                        {/* Route Stops */}
                        <div className="space-y-2 mt-3 max-h-44 overflow-y-auto pr-1">
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
                            <UserCheck className="w-3 h-3 text-[#005696]" />
                            Assign Driver to Route:
                          </label>
                          <select
                            value={route.driverId || ''}
                            onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border-gray-300 p-2 border focus:ring-[#005696]"
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

        {/* TAB 3: REAL MAP */}
        {activeTab === 'map' && (
          <DriverLiveMap
            drivers={drivers}
            routes={routes}
            onSelectDriverToView={onSwitchToDriver}
          />
        )}

        {/* TAB 4: DWELL TIMES PER PRODUCT */}
        {activeTab === 'sku_dwell' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FF6B00]" />
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
                      <td className="p-3 font-mono font-bold text-[#005696]">{item.sku}</td>
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
                <Plus className="w-4 h-4 text-[#005696]" />
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
                className="mt-3 px-4 py-2 bg-[#005696] text-white text-xs font-bold rounded-lg shadow"
              >
                Save Product Dwell Time
              </button>
            </form>
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
              Inbound Webhook Simulator
            </h2>

            {simSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {simSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSimulatedOrder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer / Trade Name</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full text-sm p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product SKU</label>
                  <select
                    value={simSku}
                    onChange={(e) => setSimSku(e.target.value)}
                    className="w-full text-sm p-2 border rounded-lg"
                  >
                    {skuCatalog.map((s) => (
                      <option key={s.sku} value={s.sku}>
                        {s.sku} - {s.name} ({s.defaultDwellMins}m dwell)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={simQty}
                    onChange={(e) => setSimQty(parseInt(e.target.value))}
                    className="w-full text-sm p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Driver Notes</label>
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
                Simulate Inbound Order Webhook
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
