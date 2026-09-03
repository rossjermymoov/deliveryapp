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
  ChevronDown,
  ChevronUp,
  Navigation,
  FileCheck2,
  Calendar,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  depots: Depot[];
  brandTheme: BrandTheme;
  selectedDepotId: string;
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
}) => {
  // Clean 4-State Filter Tabs
  const [filterMode, setFilterMode] = useState<'UNASSIGNED' | 'HELD_CRITERIA' | 'AWAITING_DELIVERY' | 'COMPLETED'>('UNASSIGNED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'status' | 'dwell'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter orders strictly by active depot
  const depotOrders = orders.filter((o) => o.depotId === selectedDepotId);

  const filteredOrders = depotOrders.filter((o) => {
    // 4 Clean Filter Modes
    if (filterMode === 'UNASSIGNED') {
      if (o.status !== 'PENDING' || o.belowRouteCriteria) return false;
    }
    if (filterMode === 'HELD_CRITERIA') {
      if (!o.belowRouteCriteria || o.status !== 'PENDING') return false;
    }
    if (filterMode === 'AWAITING_DELIVERY') {
      // Combines ROUTED, LOADED, and OUT_FOR_DELIVERY (everything assigned to a van currently in motion)
      if (o.status !== 'ROUTED' && o.status !== 'LOADED' && o.status !== 'OUT_FOR_DELIVERY') return false;
    }
    if (filterMode === 'COMPLETED') {
      if (o.status !== 'DELIVERED') return false;
    }

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

  // 4 Core Counts
  const unassignedCount = depotOrders.filter((o) => o.status === 'PENDING' && !o.belowRouteCriteria).length;
  const belowCriteriaCount = depotOrders.filter((o) => o.status === 'PENDING' && o.belowRouteCriteria).length;
  const awaitingDeliveryCount = depotOrders.filter((o) => o.status === 'ROUTED' || o.status === 'LOADED' || o.status === 'OUT_FOR_DELIVERY').length;
  const completedCount = depotOrders.filter((o) => o.status === 'DELIVERED').length;

  const matchedRoute = routes.find((r) => r.id === selectedOrder?.routeId);
  const matchedDriver = drivers.find((d) => d.id === matchedRoute?.driverId);
  const matchedDepot = depots.find((d) => d.id === selectedOrder?.depotId);

  return (
    <div className="space-y-4 animate-fadeIn font-sans">
      {/* 4 Clean Action Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* 4 Simplified Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Unassigned Orders */}
          <button
            onClick={() => setFilterMode('UNASSIGNED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              filterMode === 'UNASSIGNED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Unassigned Orders ({unassignedCount})
          </button>

          {/* 2. Below Criteria */}
          <button
            onClick={() => setFilterMode('HELD_CRITERIA')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              filterMode === 'HELD_CRITERIA'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
            Below Criteria ({belowCriteriaCount})
          </button>

          {/* 3. Awaiting Delivery */}
          <button
            onClick={() => setFilterMode('AWAITING_DELIVERY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              filterMode === 'AWAITING_DELIVERY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Awaiting Delivery ({awaitingDeliveryCount})
          </button>

          {/* 4. Completed Orders */}
          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
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
                    <span>Status</span>
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
                    No orders currently in this status tab.
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

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {isBelowCriteria ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-900 border border-orange-300 inline-flex items-center gap-1" title={ord.criteriaReason}>
                            <AlertCircle className="w-3 h-3 text-orange-700" />
                            Below Criteria
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
                            {isRouted ? 'Awaiting Delivery' : ord.status}
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
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-800 rounded-lg transition shadow-2xs"
                        >
                          {isDelivered ? 'View POD & Audit 📸' : 'Inspect Order ➔'}
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

      {/* WIDE FULL-SCREEN POD & DELIVERY AUDIT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Top Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-amber-400">
                      {selectedOrder.trackingNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-500 text-white'
                          : selectedOrder.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedOrder.customerName} • {selectedOrder.address}, {selectedOrder.city} ({selectedOrder.postcode})
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Left to Right 2-Column Wide Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-slate-50/50">
              
              {/* Left Column (5 Cols): Order Info, Items & Customer */}
              <div className="lg:col-span-5 space-y-4">
                {/* Customer Details Box */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Customer & Destination
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    {selectedOrder.customerPhone}
                  </p>
                  <p className="font-medium text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.customerEmail}
                  </p>
                  <p className="font-bold text-slate-900 flex items-start gap-1.5 pt-1 border-t border-gray-100">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{selectedOrder.address}, {selectedOrder.city} <strong>{selectedOrder.postcode}</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Depot: <strong>{matchedDepot?.name || 'Regional Hub'}</strong>
                  </p>
                </div>

                {/* Products / SKUs List */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-slate-600" />
                    Order Line Items ({selectedOrder.items.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-gray-100 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-[11px] block text-blue-700">
                            {item.sku}
                          </span>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <span className="font-black text-xs bg-white text-slate-900 px-2.5 py-1 rounded border border-gray-300">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver & Assignment Details */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-600" /> Assigned Fleet & Driver
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{matchedDriver?.name || 'Dave Jenkins'}</p>
                      <p className="text-[11px] text-slate-500 font-mono font-bold">
                        Vehicle: {matchedDriver?.vehicleReg || 'KL24 BHM'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-black rounded-lg text-[10px]">
                      {matchedRoute?.routeNumber || 'Route 1'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Large Parcel On-Site Goods Picture, Customer Signature & Telematics */}
              <div className="lg:col-span-7 space-y-4">
                {selectedOrder.status === 'DELIVERED' && selectedOrder.proofOfDelivery ? (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-4 shadow-2xs">
                    {/* Timestamp and Geo-stamp */}
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="font-black text-xs text-emerald-950 uppercase">
                          Verified Delivery Handover Record
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {selectedOrder.proofOfDelivery.timestamp}
                      </span>
                    </div>

                    {/* Left/Right Split for Big Goods Picture & Signature Canvas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Big Parcel / Trade Goods On-Site Picture */}
                      <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-center flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 flex items-center justify-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-emerald-600" /> On-Site Goods Delivery Picture:
                        </span>
                        {selectedOrder.proofOfDelivery.photoUrl ? (
                          <div className="relative group overflow-hidden rounded-xl border border-gray-200">
                            <img
                              src={selectedOrder.proofOfDelivery.photoUrl}
                              alt="On-site delivery parcels"
                              className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-mono py-1">
                              GPS: {selectedOrder.proofOfDelivery.deliveredLat?.toFixed(4)}, {selectedOrder.proofOfDelivery.deliveredLng?.toFixed(4)}
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 text-slate-400 text-xs italic">No photo attached</div>
                        )}
                      </div>

                      {/* Customer Digital Signature & Signee */}
                      <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-center flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 flex items-center justify-center gap-1">
                          <PenTool className="w-3.5 h-3.5 text-emerald-600" /> Customer Digital Signature:
                        </span>
                        
                        <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[110px]">
                          {selectedOrder.proofOfDelivery.signatureData ? (
                            <img
                              src={selectedOrder.proofOfDelivery.signatureData}
                              alt="Customer signature"
                              className="max-h-16 object-contain"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 italic">Signature on Glass</span>
                          )}
                        </div>

                        <div className="pt-2 text-left text-xs border-t border-gray-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Signee Name:</span>
                          <span className="font-black text-slate-900">{selectedOrder.proofOfDelivery.recipientName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Notes & GPS Coordinates */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Driver Notes:</span>
                        <p className="font-medium text-slate-800 italic">"{selectedOrder.proofOfDelivery.notes || 'Goods verified and delivered in good order'}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Geofence Coordinates:</span>
                        <p className="font-mono font-bold text-slate-800 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          {selectedOrder.proofOfDelivery.deliveredLat?.toFixed(4)}, {selectedOrder.proofOfDelivery.deliveredLng?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Order Not Delivered Yet State */
                  <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-slate-400 space-y-2">
                    <Clock className="w-10 h-10 mx-auto text-amber-500" />
                    <h4 className="font-bold text-slate-800 text-sm">Delivery In Progress / Scheduled</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Once the driver reaches the customer, captures the on-site parcel photo, and collects the signature on glass, the verified POD audit will populate here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-100 p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-black text-slate-800 bg-white hover:bg-slate-200 rounded-xl border border-gray-300 shadow-2xs"
              >
                Close Audit Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
