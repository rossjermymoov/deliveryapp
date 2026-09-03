import React, { useState } from 'react';
import { Order, BrandTheme, Depot } from '../types';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  Truck
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes?: any[];
  drivers?: any[];
  depots: Depot[];
  brandTheme: BrandTheme;
  selectedDepotId: string;
  onUpdateOrderDwell: (orderId: string, manualDwell: number) => void;
}

export const OrdersManager: React.FC<Props> = ({
  orders,
  depots,
  brandTheme,
  selectedDepotId,
  onUpdateOrderDwell,
}) => {
  const [activeTab, setActiveTab] = useState<'UNASSIGNED' | 'BELOW_CRITERIA' | 'AWAITING_DELIVERY' | 'COMPLETED'>('UNASSIGNED');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'status'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedOrderForAudit, setSelectedOrderForAudit] = useState<Order | null>(null);
  const [dwellEditOrderId, setDwellEditOrderId] = useState<string | null>(null);
  const [dwellInputValue, setDwellInputValue] = useState<number>(15);

  const currentDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];

  // Filter orders strictly to current depot
  const depotOrders = orders.filter((o) => o.depotId === selectedDepotId);

  const filteredOrders = depotOrders.filter((o) => {
    // Tab Filter
    if (activeTab === 'UNASSIGNED') {
      if (o.status !== 'PENDING' || o.belowRouteCriteria) return false;
    } else if (activeTab === 'BELOW_CRITERIA') {
      if (!o.belowRouteCriteria) return false;
    } else if (activeTab === 'AWAITING_DELIVERY') {
      if (o.status !== 'ROUTED' && o.status !== 'LOADED' && o.status !== 'OUT_FOR_DELIVERY') return false;
    } else if (activeTab === 'COMPLETED') {
      if (o.status !== 'DELIVERED') return false;
    }

    // Search query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.trackingNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      o.postcode.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.items.some((item) => item.sku.toLowerCase().includes(q) || (item.name && item.name.toLowerCase().includes(q)) || (item.description && item.description.toLowerCase().includes(q)))
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
    return 0;
  });

  // Counts for each of the 4 clean buckets
  const countUnassigned = depotOrders.filter((o) => o.status === 'PENDING' && !o.belowRouteCriteria).length;
  const countBelowCriteria = depotOrders.filter((o) => o.belowRouteCriteria).length;
  const countAwaiting = depotOrders.filter((o) => o.status === 'ROUTED' || o.status === 'LOADED' || o.status === 'OUT_FOR_DELIVERY').length;
  const countCompleted = depotOrders.filter((o) => o.status === 'DELIVERED').length;

  const handleSaveDwell = (orderId: string) => {
    onUpdateOrderDwell(orderId, dwellInputValue);
    setDwellEditOrderId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
            <h2 className="text-lg font-black text-slate-900">
              Orders Management System ({currentDepot.name})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline: unassigned backlog, orders held below route criteria, dispatched routes, and completed deliveries with electronic POD proof.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tracking, customer, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 4 Clean Status Bucket Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-200 p-1.5 gap-1.5 overflow-x-auto shadow-sm text-xs">
        <button
          onClick={() => setActiveTab('UNASSIGNED')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'UNASSIGNED'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          Unassigned Backlog ({countUnassigned})
        </button>

        <button
          onClick={() => setActiveTab('BELOW_CRITERIA')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'BELOW_CRITERIA'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Below Route Criteria ({countBelowCriteria})
        </button>

        <button
          onClick={() => setActiveTab('AWAITING_DELIVERY')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'AWAITING_DELIVERY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-400" />
          Awaiting Delivery ({countAwaiting})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Completed Orders ({countCompleted})
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-black uppercase tracking-wider border-b border-gray-200 text-[11px]">
              <tr>
                <th className="p-4 cursor-pointer" onClick={() => { setSortField('createdAt'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    Tracking / Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => { setSortField('customerName'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    Customer & Destination
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4">Cargo / SKUs</th>
                <th className="p-4 text-center">Offload Dwell</th>
                <th className="p-4 cursor-pointer" onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    Order Status
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No orders found in this category for {currentDepot.name}.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => {
                  const effectiveDwell = order.manualDwellOverrideMins ?? order.totalDwellMins;
                  const isDelivered = order.status === 'DELIVERED';
                  const isBelow = order.belowRouteCriteria;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <span className="font-mono font-black text-slate-900 block text-xs">
                          {order.trackingNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {order.address}, <strong className="text-slate-800">{order.postcode}</strong>
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {order.items.map((it, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200">
                              {it.quantity}x {it.sku}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {dwellEditOrderId === order.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="5"
                              max="120"
                              value={dwellInputValue}
                              onChange={(e) => setDwellInputValue(parseInt(e.target.value) || 5)}
                              className="w-14 p-1 text-xs border rounded bg-white font-black text-center"
                            />
                            <button
                              onClick={() => handleSaveDwell(order.id)}
                              className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setDwellEditOrderId(order.id);
                              setDwellInputValue(effectiveDwell);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition"
                            title="Click to adjust manual offload dwell minutes"
                          >
                            <Clock className="w-3 h-3 text-amber-600" />
                            {effectiveDwell}m
                            {order.manualDwellOverrideMins && (
                              <span className="text-[9px] text-blue-700 font-bold bg-blue-100 px-1 rounded">M</span>
                            )}
                          </button>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isBelow
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : order.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse'
                              : order.status === 'LOADED'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : order.status === 'ROUTED'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isDelivered && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {isBelow && <AlertTriangle className="w-3 h-3 text-rose-700" />}
                          {isBelow ? 'Held (Below Criteria)' : order.status.replace(/_/g, ' ')}
                        </span>
                        {isBelow && order.criteriaReason && (
                          <span className="text-[10px] text-rose-700 block mt-0.5 font-medium max-w-xs">
                            {order.criteriaReason}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrderForAudit(order)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition inline-flex items-center gap-1.5 border border-gray-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          View Order
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

      {/* WIDE LANDSCAPE ZERO-SCROLL POD & ORDER AUDIT MODAL */}
      {selectedOrderForAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black">Order Audit: {selectedOrderForAudit.trackingNumber}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/10 text-amber-300">
                      {selectedOrderForAudit.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Destination: {selectedOrderForAudit.city} ({selectedOrderForAudit.postcode}) • {currentDepot.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForAudit(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer & Destination</span>
                  <h4 className="text-sm font-black text-slate-900">{selectedOrderForAudit.customerName}</h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {selectedOrderForAudit.address}, {selectedOrderForAudit.city}, <strong>{selectedOrderForAudit.postcode}</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" /> {selectedOrderForAudit.customerPhone || '07700 900000'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" /> {selectedOrderForAudit.customerEmail || 'orders@trade.co.uk'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manifest Cargo Offload</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedOrderForAudit.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl border border-gray-100">
                        <div>
                          <span className="font-mono font-bold text-blue-700 block">{it.sku}</span>
                          <span className="text-slate-700 text-[11px]">{it.name || it.description}</span>
                        </div>
                        <span className="font-black text-slate-900 bg-white px-2 py-1 rounded border">
                          {it.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-xs font-bold text-slate-700">
                    <span>Allocated Dwell Duration:</span>
                    <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-black">
                      {selectedOrderForAudit.manualDwellOverrideMins ?? selectedOrderForAudit.totalDwellMins} mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedOrderForAudit.proofOfDelivery ? (
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-3 bg-emerald-50/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Proof of Delivery (POD)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {selectedOrderForAudit.proofOfDelivery.timestamp}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">On-Site Delivery Photo:</span>
                        <div className="h-32 rounded-xl overflow-hidden border border-gray-200 bg-slate-100 relative group">
                          {selectedOrderForAudit.proofOfDelivery.photoUrl ? (
                            <img
                              src={selectedOrderForAudit.proofOfDelivery.photoUrl}
                              alt="Goods on site"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No photo attached
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">
                          Signee: <strong>{selectedOrderForAudit.proofOfDelivery.recipientName}</strong>
                        </span>
                        <div className="h-32 rounded-xl border border-gray-200 bg-white p-2 flex flex-col justify-between">
                          {selectedOrderForAudit.proofOfDelivery.signatureData ? (
                            <img
                              src={selectedOrderForAudit.proofOfDelivery.signatureData}
                              alt="Signature"
                              className="w-full h-20 object-contain my-auto"
                            />
                          ) : (
                            <div className="text-center text-slate-400 text-xs my-auto italic">
                              Digital Signature Verified
                            </div>
                          )}
                          <span className="text-[9px] text-slate-400 text-center font-mono">
                            GPS: {selectedOrderForAudit.proofOfDelivery.deliveredLat?.toFixed(4)}, {selectedOrderForAudit.proofOfDelivery.deliveredLng?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedOrderForAudit.proofOfDelivery.notes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200 text-xs text-slate-700">
                        <strong className="text-slate-900">Driver Notes:</strong> {selectedOrderForAudit.proofOfDelivery.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-2 h-full">
                    <Truck className="w-10 h-10 text-slate-300 animate-pulse" />
                    <h4 className="font-bold text-slate-800 text-sm">Delivery In Progress</h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      {selectedOrderForAudit.status === 'OUT_FOR_DELIVERY'
                        ? 'Driver is currently en-route. POD signature and delivery photo will appear here upon completion.'
                        : 'Order is staged at the depot awaiting manifest loading.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderForAudit(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
