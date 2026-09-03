import React, { useState } from 'react';
import { Order, DeliveryRoute, Driver, BrandTheme } from '../types';
import {
  Search,
  Package,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  brandTheme: BrandTheme;
  onOpenCustomerTracker: (trackingNumber: string) => void;
}

export const CustomerServiceLookup: React.FC<Props> = ({
  orders,
  routes,
  drivers,
  brandTheme,
  onOpenCustomerTracker,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchedRoute = routes.find((r) => r.id === selectedOrder?.routeId);
  const matchedDriver = drivers.find((d) => d.id === matchedRoute?.driverId);

  const handleResendTrackingSms = (order: Order) => {
    setActionSuccessMsg(`📱 Tracking SMS re-sent to ${order.customerPhone} (${order.trackingNumber})`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Search Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
            Customer Service & Historic Order Telematics
          </h2>
          <p className="text-xs text-slate-500">
            Instantly resolve customer inquiries, tracking lookups, POD disputes, and telematics history.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Tracking #, Name, Phone, Postcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-slate-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-2 overflow-y-auto max-h-[680px]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
            Matching Orders ({filteredOrders.length})
          </span>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No orders matched "{searchTerm}"
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const isDelivered = ord.status === 'DELIVERED';
              const isOut = ord.status === 'OUT_FOR_DELIVERY';

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black" style={{ color: brandTheme.secondaryColour }}>
                      {ord.trackingNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOut
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <span className="font-bold text-slate-900 text-xs">{ord.customerName}</span>
                  <span className="text-[11px] text-slate-500 truncate">{ord.address}, {ord.postcode}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Right 2 Columns: Selected Order Telematics & Customer Details */}
        {selectedOrder ? (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            {/* Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black" style={{ color: brandTheme.secondaryColour }}>
                    {selectedOrder.trackingNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    • Inbound Webhook {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedOrder.customerName}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCustomerTracker(selectedOrder.trackingNumber)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5"
                  style={{ color: brandTheme.secondaryColour }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Customer Portal 🌐
                </button>

                <button
                  onClick={() => handleResendTrackingSms(selectedOrder)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  Re-send SMS Link
                </button>
              </div>
            </div>

            {/* Customer Contact & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer & Site Contact:
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">{selectedOrder.customerPhone}</a>
                </p>
                <p className="font-medium text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Destination:
                </span>
                <p className="font-bold text-slate-900 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedOrder.address}, {selectedOrder.city} <strong>{selectedOrder.postcode}</strong></span>
                </p>
                {selectedOrder.specialNotes && (
                  <p className="text-[11px] text-amber-800 italic pt-1 border-t border-gray-200">
                    📍 Note: {selectedOrder.specialNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Package className="w-4 h-4" style={{ color: brandTheme.secondaryColour }} />
                Order Line Items & Dwell Settings:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-[11px] block" style={{ color: brandTheme.secondaryColour }}>
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

            {/* Assigned Route & Driver Telematics */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Live Fleet Telematics & Assignment
                </span>
                <span className="text-[10px] text-slate-400">
                  {matchedRoute ? matchedRoute.routeNumber : 'Unrouted'}
                </span>
              </div>

              {matchedDriver ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black">
                      {matchedDriver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{matchedDriver.name}</h4>
                      <p className="text-slate-400 text-[11px]">
                        Vehicle: <strong className="text-amber-400">{matchedDriver.vehicleReg}</strong> • Phone: {matchedDriver.phone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">CURRENT STATUS</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900 text-blue-200">
                      {matchedDriver.status} (Updated {matchedDriver.lastUpdated})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-1">
                  This order is in the unassigned bucket waiting to be batched into a delivery route.
                </div>
              )}
            </div>

            {/* Historic POD Record */}
            {selectedOrder.status === 'DELIVERED' && selectedOrder.proofOfDelivery && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Verified Proof of Delivery (POD) Record
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    Delivered: {selectedOrder.proofOfDelivery.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Signed By:</span>
                    <p className="font-bold text-slate-900">{selectedOrder.proofOfDelivery.recipientName}</p>
                    {selectedOrder.proofOfDelivery.notes && (
                      <p className="text-slate-600 italic">Notes: {selectedOrder.proofOfDelivery.notes}</p>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer Signature:</span>
                    <img
                      src={selectedOrder.proofOfDelivery.signatureData}
                      alt="POD Signature"
                      className="max-h-12 object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">Select an order from the list to view telematics and history</p>
          </div>
        )}
      </div>
    </div>
  );
};
