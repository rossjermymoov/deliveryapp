import React, { useState } from 'react';
import { Order, BrandTheme, DeliveryRoute, Driver } from '../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  ArrowLeft,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  brandTheme: BrandTheme;
  initialTrackingNumber?: string;
  onBackToPortal: () => void;
}

export const CustomerTrackingPortal: React.FC<Props> = ({
  orders,
  routes,
  drivers,
  brandTheme,
  initialTrackingNumber,
  onBackToPortal,
}) => {
  const [searchTracking, setSearchTracking] = useState<string>(initialTrackingNumber || orders[0]?.trackingNumber || 'KAL-889101');
  const [activeTracking, setActiveTracking] = useState<string>(initialTrackingNumber || orders[0]?.trackingNumber || 'KAL-889101');

  const order = orders.find((o) => o.trackingNumber.toUpperCase() === activeTracking.toUpperCase()) || orders[0];
  const route = routes.find((r) => r.id === order?.routeId);
  const driver = drivers.find((d) => d.id === route?.driverId);

  // Status mapping
  const isDelivered = order?.status === 'DELIVERED';
  const isOutForDelivery = order?.status === 'OUT_FOR_DELIVERY';
  const isLoaded = order?.status === 'LOADED' || isOutForDelivery || isDelivered;
  const isScheduled = order?.status === 'ROUTED' || isLoaded;

  // Real OpenStreetMap view for live delivery tracking
  const targetLat = order ? (isDelivered && order.proofOfDelivery?.deliveredLat ? order.proofOfDelivery.deliveredLat : driver?.currentLat || order.lat) : 52.4862;
  const targetLng = order ? (isDelivered && order.proofOfDelivery?.deliveredLng ? order.proofOfDelivery.deliveredLng : driver?.currentLng || order.lng) : -1.8904;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${targetLng - 0.04}%2C${targetLat - 0.03}%2C${targetLng + 0.04}%2C${targetLat + 0.03}&layer=mapnik&marker=${targetLat}%2C${targetLng}`;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-0 sm:py-6 animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-slate-50 min-h-screen sm:min-h-[850px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-slate-800">
        
        {/* Customer Portal Header */}
        <header
          className="text-white px-5 pt-6 pb-4 shadow transition-colors"
          style={{ backgroundColor: brandTheme.primaryColour }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToPortal}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Admin
            </button>
            <span
              className="text-white px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              Live Order Tracker
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">{brandTheme.companyName}</h2>
              <p className="text-xs opacity-80">Direct-to-Consumer & Trade Live Tracking</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {brandTheme.logoText.slice(0, 3)}
            </div>
          </div>
        </header>

        {/* Tracking Search Input */}
        <div className="p-3.5 bg-white border-b border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveTracking(searchTracking.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Enter Tracking # (e.g. KAL-889101)"
              value={searchTracking}
              onChange={(e) => setSearchTracking(e.target.value)}
              className="flex-1 text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow transition"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              Track
            </button>
          </form>
        </div>

        {order ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {/* Status Hero Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tracking Number
                  </span>
                  <span className="font-mono font-black text-base" style={{ color: brandTheme.secondaryColour }}>
                    {order.trackingNumber}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                    isDelivered
                      ? 'bg-emerald-100 text-emerald-800'
                      : isOutForDelivery
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isOutForDelivery && <Truck className="w-3.5 h-3.5" />}
                  {isDelivered ? 'Delivered' : isOutForDelivery ? 'Out for Delivery' : 'Scheduled for Delivery'}
                </span>
              </div>

              {/* Delivery Window / ETA Banner */}
              <div
                className="p-3.5 rounded-xl text-white flex items-center justify-between"
                style={{ backgroundColor: isDelivered ? '#16A34A' : brandTheme.primaryColour }}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 block">
                    {isDelivered ? 'Delivery Completed At' : 'Estimated Delivery Window'}
                  </span>
                  <span className="text-base font-black tracking-tight">
                    {isDelivered ? order.proofOfDelivery?.timestamp || 'Today' : order.estimatedDeliveryWindow || 'Today: 09:30 AM - 11:30 AM'}
                  </span>
                </div>
                <Clock className="w-6 h-6 text-white/70" />
              </div>

              {/* Customer 4-Step Progress Stepper */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-1 relative">
                  <div className="text-center">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs text-white ${
                        isScheduled ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 block mt-1">Confirmed</span>
                  </div>

                  <div className="text-center">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs text-white ${
                        isLoaded ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      {isLoaded ? '✓' : '2'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 block mt-1">Loaded on Van</span>
                  </div>

                  <div className="text-center">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs text-white ${
                        isOutForDelivery || isDelivered ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                      }`}
                    >
                      {isDelivered ? '✓' : '3'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 block mt-1">Out for Delivery</span>
                  </div>

                  <div className="text-center">
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs text-white ${
                        isDelivered ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      {isDelivered ? '✓' : '4'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 block mt-1">Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Driver GPS Map Viewport */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live GPS Driver Telemetry
                </span>
                <span className="text-[11px] text-slate-500">
                  {isDelivered ? 'Verified Drop Location' : 'Live Van Tracker'}
                </span>
              </div>

              <div className="h-48 w-full relative">
                <iframe
                  title="Customer Live Van Tracking"
                  src={osmUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>

              {driver && (
                <div className="p-3 bg-white flex items-center justify-between border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{driver.name}</h4>
                      <p className="text-[11px] text-slate-500">{driver.vehicleReg} • Fleet Van</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${driver.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1 hover:bg-blue-100 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Driver
                  </a>
                </div>
              )}
            </div>

            {/* Order Items Manifest */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4" style={{ color: brandTheme.secondaryColour }} />
                Your Delivery Items ({order.items.length} Product Lines)
              </h4>

              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-2.5 rounded-xl border border-gray-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-[11px] block" style={{ color: brandTheme.secondaryColour }}>
                        {item.sku}
                      </span>
                      <span className="font-medium text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-black text-xs bg-white text-slate-900 px-2 py-0.5 rounded border border-gray-300">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {order.specialNotes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  📍 <strong>Delivery Note:</strong> {order.specialNotes}
                </div>
              )}
            </div>

            {/* POD Verified Proof (if delivered) */}
            {isDelivered && order.proofOfDelivery && (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Proof of Delivery Verified
                </div>
                <p className="text-xs text-emerald-800">
                  Signed for by: <strong>{order.proofOfDelivery.recipientName}</strong> at {order.proofOfDelivery.timestamp}
                </p>
                {order.proofOfDelivery.signatureData && (
                  <div className="bg-white p-2 rounded-xl border border-emerald-200 inline-block">
                    <img src={order.proofOfDelivery.signatureData} alt="Signature" className="h-10 object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
            <p className="font-bold text-slate-800">No order found with that tracking number</p>
            <p className="text-xs mt-1">Please verify your tracking number and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};
