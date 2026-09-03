import React, { useState } from 'react';
import { Order, DeliveryRoute, Driver, BrandTheme, Depot } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Camera,
  PenTool,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Navigation,
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  depots: Depot[];
  brandTheme: BrandTheme;
  selectedDepotId: string;
  onOpenCustomerTracker: (trackingNumber: string) => void;
  onUpdateOrderDwell: (orderId: string, dwell: number) => void;
  onSelectOrdersForRouting?: (orderIds: string[]) => void;
}

export const OrdersManager: React.FC<Props> = ({
  orders,
  routes,
  drivers,
  depots,
  brandTheme,
  selectedDepotId,
  onOpenCustomerTracker,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNASSIGNED' | 'HELD_CRITERIA' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'status' | 'dwell'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter orders by active depot & status
  const depotOrders = selectedDepotId === 'depot-all'
    ? orders
    : orders.filter((o) => o.depotId === selectedDepotId);

  const filteredOrders = depotOrders.filter((o) => {
    // Status filter
    if (filterMode === 'UNASSIGNED' && (o.status !== 'PENDING' || o.belowRouteCriteria)) return false;
    if (filterMode === 'HELD_CRITERIA' && (!o.belowRouteCriteria || o.status !== 'PENDING')) return false;
    if (filterMode === 'ROUTED' && o.status !== 'ROUTED' && o.status !== 'LOADED') return false;
    if (filterMode === 'OUT_FOR_DELIVERY' && o.status !== 'OUT_FOR_DELIVERY') return false;
    if (filterMode === 'COMPLETED' && o.status !== 'DELIVERED') return false;

    // Search query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.trackingNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.postcode.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.items.some((item) => item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'createdAt') {
      return sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortField === 'customerName') {
      return sortAsc ? a.customerName.localeCompare(b.customerName) : b.customerName.localeCompare(a.customerName);
    }
    if (sortField === 'status') {
      return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
    }
    if (sortField === 'dwell') {
      const dwellA = a.manualDwellOverrideMins ?? a.totalDwellMins;
      const dwellB = b.manualDwellOverrideMins ?? b.totalDwellMins;
      return sortAsc ? dwellA - dwellB : dwellB - dwellA;
    }
    return 0;
  });

  const unassignedReadyCount = depotOrders.filter((o) => o.status === 'PENDING' && !o.belowRouteCriteria).length;
  const heldCriteriaCount = depotOrders.filter((o) => o.status === 'PENDING' && o.belowRouteCriteria).length;
  const routedCount = depotOrders.filter((o) => o.status === 'ROUTED' || o.status === 'LOADED').length;
  const transitCount = depotOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const completedCount = depotOrders.filter((o) => o.status === 'DELIVERED').length;

  const matchedRoute = routes.find((r) => r.id === selectedOrder?.routeId);
  const matchedDriver = drivers.find((d) => d.id === matchedRoute?.driverId);
  const matchedDepot = depots.find((d) => d.id === selectedOrder?.depotId);

  return (
    <div className="space-y-4 animate-fadeIn font-sans">
      {/* Top Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Orders ({depotOrders.length})
          </button>

          <button
            onClick={() => setFilterMode('UNASSIGNED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === 'UNASSIGNED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Unassigned Orders ({unassignedReadyCount})
          </button>

          <button
            onClick={() => setFilterMode('HELD_CRITERIA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === 'HELD_CRITERIA'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            Below Criteria ({heldCriteriaCount})
          </button>

          <button
            onClick={() => setFilterMode('ROUTED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'ROUTED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
          >
            Assigned to Route ({routedCount})
          </button>

          <button
            onClick={() => setFilterMode('OUT_FOR_DELIVERY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'OUT_FOR_DELIVERY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
            }`}
          >
            Out for Delivery ({transitCount})
          </button>

          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterMode === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed Orders ({completedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tracking, name, postcode, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-slate-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* OMS FULL-WIDTH TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-black uppercase text-[11px] border-b border-gray-200 tracking-wider">
              <tr>
                <th
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => {
                    setSortField('createdAt');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Tracking / Date</span>
                    {sortField === 'createdAt' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => {
                    setSortField('customerName');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Customer & Address</span>
                    {sortField === 'customerName' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3.5">Products / SKUs</th>
                <th
                  className="p-3.5 text-center cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => {
                    setSortField('dwell');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Dwell</span>
                    {sortField === 'dwell' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  className="p-3.5 text-center cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => {
                    setSortField('status');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status & Routing Feasibility</span>
                    {sortField === 'status' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="p-3.5 text-right">Details & POD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((ord) => {
                  const isDelivered = ord.status === 'DELIVERED';
                  const isTransit = ord.status === 'OUT_FOR_DELIVERY';
                  const isRouted = ord.status === 'ROUTED' || ord.status === 'LOADED';
                  const isBelowCriteria = ord.belowRouteCriteria;

                  const effectiveDwell = ord.manualDwellOverrideMins ?? ord.totalDwellMins;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-blue-50/40 transition cursor-pointer group"
                    >
                      {/* Tracking Number & Date */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span
                            className="font-mono font-black text-xs group-hover:underline"
                            style={{ color: brandTheme.secondaryColour }}
                          >
                            {ord.trackingNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Customer & Destination */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">{ord.customerName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            {ord.address}, <strong className="text-slate-800">{ord.postcode}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Products / SKUs */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ord.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-800"
                            >
                              {item.quantity}x {item.sku}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Dwell Time */}
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200 inline-block">
                          {effectiveDwell} mins
                        </span>
                      </td>

                      {/* Status & Criteria */}
                      <td className="p-3.5 text-center">
                        {isBelowCriteria ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-900 border border-orange-300 inline-flex items-center gap-1" title={ord.criteriaReason}>
                            <AlertCircle className="w-3 h-3 text-orange-700" />
                            Below Route Criteria
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isTransit
                                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                                : isRouted
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-800 rounded-lg transition"
                        >
                          {isDelivered ? 'View Delivery & POD 📸' : 'Inspect Order ➔'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER INSPECTION / COMPLETED ORDER POD MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black" style={{ color: brandTheme.secondaryColour }}>
                    {selectedOrder.trackingNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.belowRouteCriteria
                        ? 'bg-orange-100 text-orange-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedOrder.customerName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCustomerTracker(selectedOrder.trackingNumber)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-xs font-bold text-[#0072CE] border border-blue-200 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Portal
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedOrder.belowRouteCriteria && selectedOrder.criteriaReason && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-xs text-orange-900 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span><strong>Routing Criteria Note:</strong> {selectedOrder.criteriaReason}</span>
              </div>
            )}

            {/* Customer & Delivery Coordinates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Contact & Site:
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  {selectedOrder.customerPhone}
                </p>
                <p className="font-medium text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Destination Address & Depot:
                </span>
                <p className="font-bold text-slate-900 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedOrder.address}, {selectedOrder.city} <strong>{selectedOrder.postcode}</strong></span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Depot: <strong>{matchedDepot?.name || 'Regional Hub'}</strong>
                </p>
              </div>
            </div>

            {/* Order Items List */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Order Line Items:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-[11px] block" style={{ color: brandTheme.secondaryColour }}>
                        {item.sku}
                      </span>
                      <span className="font-medium text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-black text-xs px-2.5 py-1 bg-white border border-gray-200 rounded">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COMPLETED ORDER DELIVERY AUDIT TRAIL: DRIVER, GEO, PHOTO, SIGNATURE */}
            {selectedOrder.status === 'DELIVERED' && selectedOrder.proofOfDelivery ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <span className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Completed Order Delivery Audit Trail
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Delivered: {selectedOrder.proofOfDelivery.timestamp}
                  </span>
                </div>

                {/* Driver & Telematics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Driver & Van:</span>
                    <p className="font-bold text-slate-900">
                      {matchedDriver?.name || 'Dave Jenkins'} ({matchedDriver?.vehicleReg || 'KL24 BHM'})
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block pt-1">Signee Name:</span>
                    <p className="font-bold text-slate-900">{selectedOrder.proofOfDelivery.recipientName}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">GPS Delivery Coordinates:</span>
                    <p className="font-mono font-bold text-slate-900 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      {selectedOrder.proofOfDelivery.deliveredLat?.toFixed(4)}, {selectedOrder.proofOfDelivery.deliveredLng?.toFixed(4)}
                    </p>
                    {selectedOrder.proofOfDelivery.notes && (
                      <p className="text-[11px] text-slate-600 italic pt-1">
                        Notes: "{selectedOrder.proofOfDelivery.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Proof Photos & Signature Canvas Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo of goods on site */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center justify-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-600" /> On-Site Goods Picture:
                    </span>
                    {selectedOrder.proofOfDelivery.photoUrl ? (
                      <img
                        src={selectedOrder.proofOfDelivery.photoUrl}
                        alt="Goods on site"
                        className="rounded-lg max-h-36 object-cover mx-auto border border-gray-200 mt-1"
                      />
                    ) : (
                      <div className="p-4 text-slate-400 text-xs italic">No photo recorded</div>
                    )}
                  </div>

                  {/* Customer Signature */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1 text-center flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center justify-center gap-1">
                      <PenTool className="w-3 h-3 text-emerald-600" /> Customer Signature:
                    </span>
                    {selectedOrder.proofOfDelivery.signatureData ? (
                      <img
                        src={selectedOrder.proofOfDelivery.signatureData}
                        alt="Customer signature"
                        className="max-h-20 object-contain mx-auto mt-2"
                      />
                    ) : (
                      <div className="p-4 text-slate-400 text-xs italic">No signature recorded</div>
                    )}
                    <span className="text-[10px] text-emerald-800 font-bold">Verified Direct Handover</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
