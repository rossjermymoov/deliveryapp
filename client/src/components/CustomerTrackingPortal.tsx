import React, { useState } from 'react';
import { Order, BrandTheme, Depot, LeaveSafePreference } from '../types';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Home,
  CheckCircle2,
  Mail,
  AlertTriangle,
  X
} from 'lucide-react';

interface Props {
  order: Order;
  depots: Depot[];
  brandTheme: BrandTheme;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderLeaveSafe: (orderId: string, preference: LeaveSafePreference) => void;
  onRescheduleOrder: (orderId: string, targetDate: string, reason?: string) => void;
}

export const CustomerTrackingPortal: React.FC<Props> = ({
  order,
  depots,
  brandTheme,
  isOpen,
  onClose,
  onUpdateOrderLeaveSafe,
  onRescheduleOrder,
}) => {
  if (!isOpen) return null;

  const currentDepot = depots.find((d) => d.id === order.depotId) || depots[0];
  const policy = currentDepot.policySettings || {
    allowSameDayReschedule: true,
    sameDayCutoffTime: '09:00',
    allowInFlightSafePlace: true,
  };

  const isAlreadyDelivered = order.status === 'DELIVERED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isRescheduled = order.status === 'RESCHEDULED';

  // Check if same-day reschedule is permitted by depot policy
  const canReschedule = !isAlreadyDelivered && (order.status !== 'OUT_FOR_DELIVERY' || policy.allowSameDayReschedule);

  // Leave safe permission (generic SKU rule)
  const orderAllowsLeaveSafe = order.allowLeaveSafe !== false;

  const [activeTab, setActiveTab] = useState<'status' | 'leave_safe' | 'reschedule' | 'email_view'>('status');

  // Leave Safe form
  const [safeLocation, setSafeLocation] = useState<LeaveSafePreference['locationType']>(
    order.leaveSafePreference?.locationType || 'BEHIND_SIDE_GATE'
  );
  const [neighbourNum, setNeighbourNum] = useState<string>(order.leaveSafePreference?.neighbourHouseNumber || '');
  const [instructions, setInstructions] = useState<string>(order.leaveSafePreference?.accessInstructions || '');
  const [saveBanner, setSaveBanner] = useState<string>('');

  // Reschedule form
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minRescheduleDate = tomorrow.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(minRescheduleDate);
  const [rescheduleReason, setRescheduleReason] = useState<string>('Not available on site today');

  const handleSaveLeaveSafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderAllowsLeaveSafe) return;

    const pref: LeaveSafePreference = {
      requested: true,
      locationType: safeLocation,
      neighbourHouseNumber: safeLocation === 'NEIGHBOUR' ? neighbourNum : undefined,
      accessInstructions: instructions,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inFlightUpdate: isOutForDelivery,
    };

    onUpdateOrderLeaveSafe(order.id, pref);
    setSaveBanner('✓ Safe place request saved! The driver has been notified.');
    setTimeout(() => {
      setSaveBanner('');
      setActiveTab('status');
    }, 2000);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReschedule) return;

    onRescheduleOrder(order.id, selectedDate, rescheduleReason);
    setSaveBanner(`✓ Delivery rescheduled for ${selectedDate}. Order updated on dispatch manifest.`);
    setTimeout(() => {
      setSaveBanner('');
      setActiveTab('status');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
        
        {/* Email / Portal Top Simulation Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Customer In-Flight Portal
                </span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  {order.trackingNumber}
                </span>
              </div>
              <h3 className="text-sm font-black">{order.customerName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Sub-tabs */}
        <div className="flex bg-slate-100 p-1.5 border-b border-gray-200 text-xs gap-1">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-blue-600" /> Live Tracking
          </button>

          <button
            onClick={() => setActiveTab('leave_safe')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'leave_safe' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" /> Leave in Safe Place
          </button>

          <button
            onClick={() => setActiveTab('reschedule')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'reschedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Reschedule Date
          </button>

          <button
            onClick={() => setActiveTab('email_view')}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1 text-[11px] ${
              activeTab === 'email_view' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="View Simulated Customer Notification Email"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Preview
          </button>
        </div>

        {saveBanner && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold border-b border-emerald-200 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveBanner}</span>
          </div>
        )}

        {/* TAB 1: LIVE TRACKING & STATUS */}
        {activeTab === 'status' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* Delivery Window & Status Banner */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-900">Estimated Delivery Time</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isAlreadyDelivered ? 'bg-emerald-100 text-emerald-800' :
                  isOutForDelivery ? 'bg-blue-600 text-white animate-pulse' :
                  isRescheduled ? 'bg-purple-100 text-purple-900' : 'bg-slate-200 text-slate-800'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-900">
                {isAlreadyDelivered ? '✓ Delivered' : isRescheduled ? `Rescheduled for ${order.rescheduledTargetDate || 'Next Day'}` : 'Today between 08:00 - 12:00'}
              </h4>
              <p className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {order.address}, {order.postcode}
              </p>
            </div>

            {/* Age Verification Notification (If applicable) */}
            {order.requiresAgeVerification && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Age-Restricted Goods (18+ Verification Required)</span>
                </div>
                <p className="text-[11px] text-amber-900">
                  This delivery contains chemical solvent products. A valid photo ID confirming 18+ (Passport, UK Driving Licence, or PASS Card) must be inspected by the driver upon arrival. <em>(No copies of ID are retained to protect GDPR privacy).</em>
                </p>
              </div>
            )}

            {/* Active Safe Place Preference Notification */}
            {order.leaveSafePreference?.requested && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-emerald-900 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-emerald-600" /> Safe Place Instructions Active
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Updated {order.leaveSafePreference.requestedAt}</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Location: {order.leaveSafePreference.locationType.replace(/_/g, ' ')} {order.leaveSafePreference.neighbourHouseNumber ? `(#${order.leaveSafePreference.neighbourHouseNumber})` : ''}
                </p>
                {order.leaveSafePreference.accessInstructions && (
                  <p className="text-[11px] text-slate-600 italic">"{order.leaveSafePreference.accessInstructions}"</p>
                )}
              </div>
            )}

            {/* Cargo Items List with Leave-Safe & Age Verification badges */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Consignment Items ({order.items.length})
              </span>
              <div className="divide-y divide-gray-100 border rounded-2xl overflow-hidden bg-slate-50/50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name || item.sku}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">{item.sku}</span>
                        {item.requiresAgeVerification && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                            18+ Required
                          </span>
                        )}
                        {!item.allowLeaveSafe && (
                          <span className="text-[9px] font-black bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.2 rounded">
                            Signature Only (No Safe Place)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {!isAlreadyDelivered && (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => setActiveTab('leave_safe')}
                  disabled={!orderAllowsLeaveSafe}
                  className="p-3 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold flex flex-col items-start gap-1 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Request Safe Place</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {orderAllowsLeaveSafe ? 'Porch, gate, or neighbour' : 'Locked by product rule'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('reschedule')}
                  disabled={!canReschedule}
                  className="p-3 rounded-xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold flex flex-col items-start gap-1 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Reschedule Date</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {canReschedule ? 'Pick another delivery day' : 'Reschedule cutoff passed'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LEAVE IN SAFE PLACE */}
        {activeTab === 'leave_safe' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {!orderAllowsLeaveSafe ? (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-1.5 font-black text-sm text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Leave-Safe Not Permitted for This Order</span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">
                  One or more items in this order (e.g. bespoke extrusions, polycarbonate sheets, or hazardous products) have been designated by Kalsi Logistics as non-leave-safe. A physical recipient must sign for goods on site.
                </p>
                <button
                  onClick={() => setActiveTab('status')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs mt-1"
                >
                  Back to Tracking
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveLeaveSafe} className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Where can the driver safely leave your goods?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select an accessible, sheltered location on your property or with an immediate neighbour.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BEHIND_SIDE_GATE', label: 'Behind Side Gate' },
                    { id: 'FRONT_PORCH', label: 'Inside Front Porch' },
                    { id: 'SHED_GARAGE', label: 'Inside Shed / Garage' },
                    { id: 'OUTBUILDING', label: 'Outbuilding / Lean-To' },
                    { id: 'NEIGHBOUR', label: 'Leave with Neighbour' },
                    { id: 'OTHER', label: 'Other Specific Location' },
                  ].map((loc) => (
                    <button
                      type="button"
                      key={loc.id}
                      onClick={() => setSafeLocation(loc.id as any)}
                      className={`p-3 rounded-xl border text-left font-bold transition flex items-center justify-between ${
                        safeLocation === loc.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-800'
                      }`}
                    >
                      <span>{loc.label}</span>
                      {safeLocation === loc.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                {safeLocation === 'NEIGHBOUR' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Neighbour House Number / Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. #44 (Next door) or The Cedars"
                      value={neighbourNum}
                      onChange={(e) => setNeighbourNum(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Special Access Notes / Gate Codes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Gate latch is on top right. Please place behind green recycling bins out of street view."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white text-xs font-medium"
                  />
                </div>

                {isOutForDelivery && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-[11px] font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>In-flight update: The driver is currently out for delivery and will receive this alert instantly on their handheld device.</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Safe Place
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: RESCHEDULE DELIVERY DATE */}
        {activeTab === 'reschedule' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {!canReschedule ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-2">
                <div className="flex items-center gap-1.5 font-black text-sm text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Same-Day Reschedule Window Closed</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Depot policy does not permit same-day cancellation after {policy.sameDayCutoffTime} once the van has departed. If you are not on site, please submit a "Leave in Safe Place" request instead.
                </p>
                <button
                  onClick={() => setActiveTab('leave_safe')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs mt-1"
                >
                  Choose Safe Place Instead
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmReschedule} className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Reschedule Your Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a new preferred working day for your consignment.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Select New Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    min={minRescheduleDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Reason for Reschedule
                  </label>
                  <select
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                  >
                    <option value="Not available on site today">Not available on site today</option>
                    <option value="Site not ready for materials">Site not ready for materials</option>
                    <option value="Severe weather / roofing delay">Severe weather / roofing delay</option>
                    <option value="Tradesperson schedule change">Tradesperson schedule change</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                {isOutForDelivery && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-[11px] space-y-1">
                    <span className="font-black block text-amber-900">⚠️ Same-Day Manifest Reroute:</span>
                    <p>
                      Your consignment is currently loaded on the van. Submitting this request will automatically remove the stop from the driver's active route and return the goods to the {currentDepot.city} depot at the end of the shift.
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> Confirm Reschedule
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: SIMULATED EMAIL NOTIFICATION PREVIEW */}
        {activeTab === 'email_view' && (
          <div className="p-5 overflow-y-auto space-y-3 text-xs bg-slate-100/50">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">From: dispatch@{brandTheme.companyName.toLowerCase().replace(/\s+/g, '')}.co.uk</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">To: {order.customerEmail || 'customer@site.co.uk'}</span>
                  <span className="text-xs font-black text-blue-900 mt-1 block">
                    Your {brandTheme.companyName} Delivery has been scheduled for Today (08:00 - 12:00)
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  K
                </div>
              </div>

              <div className="space-y-2 text-slate-700 leading-relaxed text-xs">
                <p>Hello <strong>{order.customerName}</strong>,</p>
                <p>
                  Your building materials order (<strong>{order.trackingNumber}</strong>) is scheduled for delivery today from our <strong>{currentDepot.name}</strong>.
                </p>
                
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-bold text-slate-900">{order.address}, {order.postcode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Slot:</span>
                    <span className="font-bold text-slate-900">08:00 AM – 12:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Leave-Safe Permitted:</span>
                    <span className={`font-black ${orderAllowsLeaveSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {orderAllowsLeaveSafe ? '✓ Yes (Porch, Gate, Neighbour)' : '⛔ No (Signature Required)'}
                    </span>
                  </div>
                  {order.requiresAgeVerification && (
                    <div className="flex justify-between">
                      <span className="text-amber-700 font-bold">Age Verification:</span>
                      <span className="font-black text-amber-900">18+ Photo ID Inspection Required</span>
                    </div>
                  )}
                </div>

                <p className="font-bold text-slate-800">Need to make a change before delivery?</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab('leave_safe')}
                    disabled={!orderAllowsLeaveSafe}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition disabled:opacity-50"
                  >
                    Specify Safe Place
                  </button>
                  <button
                    onClick={() => setActiveTab('reschedule')}
                    disabled={!canReschedule}
                    className="py-2 px-3 bg-slate-900 hover:bg-black text-white font-bold text-[11px] rounded-xl transition disabled:opacity-50"
                  >
                    Reschedule Delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
