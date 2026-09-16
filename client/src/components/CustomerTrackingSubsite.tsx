import React, { useState } from 'react';
import { Order, BrandTheme, Depot, LeaveSafePreference, Driver, DeliveryRoute } from '../types';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Home,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Phone,
  HelpCircle,
  Lock,
  Navigation
} from 'lucide-react';

interface Props {
  order: Order;
  depots: Depot[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  brandTheme: BrandTheme;
  onUpdateOrderLeaveSafe: (orderId: string, preference: LeaveSafePreference) => void;
  onRescheduleOrder: (orderId: string, targetDate: string, reason?: string) => void;
  onBackToEmailInbox?: () => void;
  onBackToAdmin?: () => void;
}

export const CustomerTrackingSubsite: React.FC<Props> = ({
  order,
  depots,
  routes,
  drivers,
  brandTheme,
  onUpdateOrderLeaveSafe,
  onRescheduleOrder,
  onBackToEmailInbox,
  onBackToAdmin,
}) => {
  const currentDepot = depots.find((d) => d.id === order.depotId) || depots[0];
  const assignedRoute = routes.find((r) => r.id === order.routeId);
  const assignedDriver = assignedRoute?.driverId
    ? drivers.find((d) => d.id === assignedRoute.driverId) || assignedRoute.driver
    : undefined;

  const policy = currentDepot.policySettings || {
    allowSameDayReschedule: true,
    sameDayCutoffTime: '09:00',
    allowInFlightSafePlace: true,
  };

  const isAlreadyDelivered = order.status === 'DELIVERED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isRescheduled = order.status === 'RESCHEDULED';
  const isLoaded = order.status === 'LOADED' || order.status === 'ROUTED';

  const canReschedule = !isAlreadyDelivered && (order.status !== 'OUT_FOR_DELIVERY' || policy.allowSameDayReschedule);
  const orderAllowsLeaveSafe = order.allowLeaveSafe !== false;

  // Active Tab for In-Flight actions
  const [activeActionTab, setActiveActionTab] = useState<'overview' | 'safe_place' | 'reschedule'>('overview');

  // Leave safe form state
  const [safeLocation, setSafeLocation] = useState<LeaveSafePreference['locationType']>(
    order.leaveSafePreference?.locationType || 'BEHIND_SIDE_GATE'
  );
  const [neighbourNum, setNeighbourNum] = useState<string>(order.leaveSafePreference?.neighbourHouseNumber || '');
  const [instructions, setInstructions] = useState<string>(order.leaveSafePreference?.accessInstructions || '');
  const [saveBanner, setSaveBanner] = useState<string>('');

  // Reschedule form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minRescheduleDate = tomorrow.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(minRescheduleDate);
  const [rescheduleReason, setRescheduleReason] = useState<string>('Site not accessible today');

  // Dynamic drop calculation
  const orderIndexInRoute = assignedRoute
    ? assignedRoute.orders.findIndex((o) => o.id === order.id) + 1
    : (order.stopSequence || 2);
  
  const currentDriverStop = assignedRoute
    ? Math.min(orderIndexInRoute, Math.max(1, assignedRoute.orders.filter(o => o.status === 'DELIVERED').length + 1))
    : 1;

  const dropsAway = Math.max(0, orderIndexInRoute - currentDriverStop);

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
    setSaveBanner('✓ Safe place request confirmed! The driver’s handheld manifest has been updated.');
    setTimeout(() => {
      setSaveBanner('');
      setActiveActionTab('overview');
    }, 2500);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReschedule) return;

    onRescheduleOrder(order.id, selectedDate, rescheduleReason);
    setSaveBanner(`✓ Delivery rescheduled for ${selectedDate}. Order updated on dispatch manifest.`);
    setTimeout(() => {
      setSaveBanner('');
      setActiveActionTab('overview');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* SIMULATED BROWSER CHROME TOP BAR */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 ml-2 hidden sm:inline">
            Customer Live Tracking Subsite View
          </span>
        </div>

        {/* Browser URL Bar */}
        <div className="bg-slate-800 text-slate-200 px-4 py-1 rounded-xl flex items-center gap-2 w-full max-w-md border border-slate-700 mx-2 text-[11px] font-mono truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-slate-400">https://</span>
          <span className="text-white font-bold">track.{brandTheme.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.uk</span>
          <span className="text-blue-400 font-bold">/order/{order.trackingNumber}</span>
        </div>

        {/* Top View Return Buttons */}
        <div className="flex items-center gap-2">
          {onBackToEmailInbox && (
            <button
              onClick={onBackToEmailInbox}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Email Inbox ✉️
            </button>
          )}
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition hidden sm:inline-block"
            >
              Dispatch Hub 🏢
            </button>
          )}
        </div>
      </div>

      {/* SUBSITE HEADER */}
      <header
        className="text-white px-6 py-4 shadow-md transition-colors"
        style={{ backgroundColor: brandTheme.primaryColour }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className="text-white px-3 py-1.5 rounded-xl shadow font-black text-lg tracking-wider uppercase"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {brandTheme.logoText}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">{brandTheme.companyName} Tracking</h1>
              <p className="text-xs text-slate-300">Live Delivery Portal & In-Flight Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">Consignment Reference</span>
              <span className="font-mono font-black text-sm text-amber-300">{order.trackingNumber}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* SUBSITE MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        
        {/* Banner Alert if Action Saved */}
        {saveBanner && (
          <div className="p-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 animate-fadeIn text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{saveBanner}</span>
          </div>
        )}

        {/* HERO STATUS CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Delivery For: <strong className="text-slate-900">{order.customerName}</strong>
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                {isAlreadyDelivered
                  ? '✓ Consignment Delivered'
                  : isRescheduled
                  ? `Rescheduled for ${order.rescheduledTargetDate || 'Next Day'}`
                  : isOutForDelivery
                  ? 'Out for Delivery Today'
                  : isLoaded
                  ? 'Loaded & Staged for Dispatch'
                  : 'Order Scheduled for Delivery'}
              </h2>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                {order.address}, {order.city}, <strong>{order.postcode}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs ${
                isAlreadyDelivered
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isOutForDelivery
                  ? 'bg-blue-600 text-white animate-pulse'
                  : isRescheduled
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {isAlreadyDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                {isAlreadyDelivered ? 'Delivered' : isRescheduled ? 'Rescheduled' : isOutForDelivery ? 'On The Road' : 'Staged at Depot'}
              </span>
              <span className="text-xs text-slate-500 font-bold mt-1.5">
                {isAlreadyDelivered
                  ? `Delivered at ${order.proofOfDelivery?.timestamp || '11:30 AM'}`
                  : isRescheduled
                  ? `Target: ${order.rescheduledTargetDate}`
                  : 'Expected Arrival: 08:30 AM – 12:00 PM'}
              </span>
            </div>
          </div>

          {/* REAL-TIME PROGRESS STEPPER */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { label: 'Order Staged', done: true, current: order.status === 'PENDING' },
              { label: 'Loaded on Van', done: isLoaded || isOutForDelivery || isAlreadyDelivered, current: order.status === 'LOADED' },
              { label: 'Out for Delivery', done: isOutForDelivery || isAlreadyDelivered, current: isOutForDelivery },
              { label: 'Delivered', done: isAlreadyDelivered, current: isAlreadyDelivered },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                  step.done
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 text-slate-400 border border-gray-200'
                } ${step.current ? 'ring-4 ring-blue-100' : ''}`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span className={`text-[11px] font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* LIVE TELEMATICS & DROP COUNTDOWN BANNER */}
          {isOutForDelivery && (
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">
                      {dropsAway === 0 ? 'Driver is arriving at your property next!' : `You are Drop #${orderIndexInRoute} • Van is currently on Drop #${currentDriverStop}`}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Vehicle: <strong className="text-white font-mono">{assignedRoute?.vanRegistration || 'KV72 BHM'}</strong>
                    {assignedDriver && ` • Driver: ${assignedDriver.name}`}
                    {dropsAway > 0 && ` (${dropsAway} stop${dropsAway > 1 ? 's' : ''} away)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-black border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live GPS Active
                </span>
              </div>
            </div>
          )}

          {/* SIMULATED TELEMATICS MAP CANVAS */}
          <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden border border-gray-200 flex flex-col justify-between p-4 shadow-inner">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 border border-white/10">
                <Navigation className="w-3 h-3 text-blue-400" /> Live Vehicle Route Telematics
              </span>
              <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded font-mono">
                Depot: {currentDepot.name}
              </span>
            </div>

            {/* Radar / Distance Graphic */}
            <div className="relative z-10 flex items-center justify-between px-6">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 border border-blue-500 flex items-center justify-center font-bold text-xs">
                  🏭
                </div>
                <span className="text-[9px] text-slate-300 font-bold mt-1">{currentDepot.city} Depot</span>
              </div>

              <div className="flex-1 mx-4 h-1.5 bg-slate-700 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-500"
                  style={{ width: isAlreadyDelivered ? '100%' : isOutForDelivery ? '65%' : '20%' }}
                ></div>
                {isOutForDelivery && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-[65%] -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-md animate-bounce"></div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  isAlreadyDelivered ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-slate-800 text-emerald-400 border-emerald-500'
                }`}>
                  🏠
                </div>
                <span className="text-[9px] text-slate-300 font-bold mt-1">Your Delivery Address</span>
              </div>
            </div>

            <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-400">
              <span>GPS: {order.lat.toFixed(4)}, {order.lng.toFixed(4)}</span>
              <span>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* AGE RESTRICTION NOTIFICATION IF SOLVENTS PRESENT */}
        {order.requiresAgeVerification && (
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-300 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-200 text-amber-950 shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-800" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-950">
                Age Verification Required (18+ Solvents & Hazardous Materials)
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                This consignment contains chemical solvent products governed by UK age-restriction laws. A valid photo ID confirming 18+ (*UK Driving Licence, Passport, PASS Card*) will be visually inspected by the driver upon delivery.
              </p>
              <p className="text-[11px] text-amber-800 font-semibold pt-0.5">
                🔒 <strong>GDPR Compliance:</strong> The driver will verify your date of birth visually. No photographic copies of your ID will ever be taken or stored.
              </p>
            </div>
          </div>
        )}

        {/* IN-FLIGHT CONTROLS & LEAVE SAFE TABS */}
        {!isAlreadyDelivered && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5 text-xs">
              <button
                onClick={() => setActiveActionTab('overview')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-blue-600" /> Consignment Summary
              </button>

              <button
                onClick={() => setActiveActionTab('safe_place')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'safe_place' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-emerald-600" /> Leave in Safe Place
              </button>

              <button
                onClick={() => setActiveActionTab('reschedule')}
                className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  activeActionTab === 'reschedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Reschedule Date
              </button>
            </div>

            {/* TAB 1: CONSIGNMENT SUMMARY */}
            {activeActionTab === 'overview' && (
              <div className="space-y-4 text-xs pt-1">
                {order.leaveSafePreference?.requested && (
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-emerald-900 flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-emerald-600" /> Safe Place Instructions Active
                      </span>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Location: <strong>{order.leaveSafePreference.locationType.replace(/_/g, ' ')}</strong>
                        {order.leaveSafePreference.neighbourHouseNumber && ` (#${order.leaveSafePreference.neighbourHouseNumber})`}
                      </p>
                      {order.leaveSafePreference.accessInstructions && (
                        <p className="text-[11px] text-slate-500 italic">"{order.leaveSafePreference.accessInstructions}"</p>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveActionTab('safe_place')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow"
                    >
                      Edit Safe Place
                    </button>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                    Materials & Bulky SKUs in this Consignment ({order.items.length})
                  </span>

                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="p-3.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{it.name || it.sku}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-500 font-bold">{it.sku}</span>
                            {it.requiresAgeVerification && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                                18+ ID Required
                              </span>
                            )}
                            {!it.allowLeaveSafe && (
                              <span className="text-[9px] font-black bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.2 rounded">
                                Signature Only
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                          x{it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActiveActionTab('safe_place')}
                    disabled={!orderAllowsLeaveSafe}
                    className="p-4 rounded-2xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold flex flex-col items-start gap-1 transition disabled:opacity-50"
                  >
                    <Home className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black">Specify Safe Place</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {orderAllowsLeaveSafe ? 'Porch, side gate, or neighbour' : 'Locked by product rule'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveActionTab('reschedule')}
                    disabled={!canReschedule}
                    className="p-4 rounded-2xl border border-gray-200 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold flex flex-col items-start gap-1 transition disabled:opacity-50"
                  >
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-black">Reschedule Delivery</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {canReschedule ? 'Pick another delivery day' : 'Reschedule cutoff passed'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LEAVE IN SAFE PLACE FORM */}
            {activeActionTab === 'safe_place' && (
              <div className="space-y-4 text-xs pt-1">
                {!orderAllowsLeaveSafe ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 text-rose-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-sm text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Leave-Safe Not Permitted for This Order</span>
                    </div>
                    <p className="text-xs text-rose-900 leading-relaxed">
                      One or more products in this order have been flagged as non-leave-safe (such as bespoke extrusions, polycarbonate sheets, or chemical solvents). A physical signature on site is required.
                    </p>
                    <button
                      onClick={() => setActiveActionTab('overview')}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
                    >
                      Back to Overview
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveLeaveSafe} className="space-y-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Where should the driver safely leave your materials?</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please choose a sheltered, accessible spot on your property or with an immediate neighbour.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'BEHIND_SIDE_GATE', label: 'Behind Side Gate', icon: '🚪' },
                        { id: 'FRONT_PORCH', label: 'Inside Front Porch', icon: '🏠' },
                        { id: 'SHED_GARAGE', label: 'Inside Shed / Garage', icon: '🛖' },
                        { id: 'OUTBUILDING', label: 'Outbuilding / Lean-To', icon: '🏗️' },
                        { id: 'NEIGHBOUR', label: 'Leave with Neighbour', icon: '👥' },
                        { id: 'OTHER', label: 'Other Specific Location', icon: '📍' },
                      ].map((loc) => (
                        <button
                          type="button"
                          key={loc.id}
                          onClick={() => setSafeLocation(loc.id as any)}
                          className={`p-3.5 rounded-2xl border text-left font-bold transition flex flex-col justify-between gap-1.5 ${
                            safeLocation === loc.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                              : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-800'
                          }`}
                        >
                          <span className="text-lg">{loc.icon}</span>
                          <span className="text-xs font-black">{loc.label}</span>
                          {safeLocation === loc.id && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              ✓ Selected
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {safeLocation === 'NEIGHBOUR' && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Neighbour House Number / Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. #44 (Next door) or Oak Lodge"
                          value={neighbourNum}
                          onChange={(e) => setNeighbourNum(e.target.value)}
                          className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Specific Access Notes / Gate Code Instructions
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Gate latch is accessible over top. Please place boards along side fence sheltered under tarp."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full p-3 border rounded-2xl bg-white text-xs font-medium"
                      />
                    </div>

                    {isOutForDelivery && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>In-flight update: Van is currently on the road. The driver will receive this safe place alert instantly on their handheld device.</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveActionTab('overview')}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Save Safe Place Instructions
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: RESCHEDULE FORM */}
            {activeActionTab === 'reschedule' && (
              <div className="space-y-4 text-xs pt-1">
                {!canReschedule ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-sm text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Same-Day Reschedule Cut-off Passed</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Depot policy for {currentDepot.name} does not permit same-day route removal after {policy.sameDayCutoffTime} once the vehicle is dispatched. Please specify a safe place instead.
                    </p>
                    <button
                      onClick={() => setActiveActionTab('safe_place')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                    >
                      Choose Safe Place
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmReschedule} className="space-y-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Reschedule Your Delivery</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose a new preferred working day for materials delivery.
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
                        className="w-full p-3 border rounded-2xl bg-white font-mono font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Reason for Reschedule
                      </label>
                      <select
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        className="w-full p-3 border rounded-2xl bg-white font-bold text-xs"
                      >
                        <option value="Site not accessible today">Site not accessible today</option>
                        <option value="Tradesperson schedule change">Tradesperson schedule change</option>
                        <option value="Severe weather / roofing delay">Severe weather / roofing delay</option>
                        <option value="Materials site storage not ready">Materials site storage not ready</option>
                        <option value="Other">Other reason</option>
                      </select>
                    </div>

                    {isOutForDelivery && (
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 text-[11px] space-y-1">
                        <span className="font-black block text-amber-900">⚠️ Dynamic Route Manifest Adjustment:</span>
                        <p>
                          Submitting this will immediately remove your drop from driver's active route on van {assignedRoute?.vanRegistration || 'KV72 BHM'} and hold the goods safely at {currentDepot.city} depot for {selectedDate}.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveActionTab('overview')}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" /> Confirm New Delivery Date
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* DELIVERED STATE: PROOF OF DELIVERY CARD */}
        {isAlreadyDelivered && order.proofOfDelivery && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Electronic Proof of Delivery (ePOD)
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {order.proofOfDelivery.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  On-Site Delivery Photo
                </span>
                <div className="h-44 rounded-2xl overflow-hidden border border-gray-200 bg-slate-100">
                  {order.proofOfDelivery.safePlacePhotoUrl || order.proofOfDelivery.photoUrl ? (
                    <img
                      src={order.proofOfDelivery.safePlacePhotoUrl || order.proofOfDelivery.photoUrl || ''}
                      alt="Delivery Proof"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Photo Captured
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Signee / Handover</span>
                  <span className="text-sm font-black text-slate-900 block">{order.proofOfDelivery.recipientName}</span>
                  {order.proofOfDelivery.leftInSafePlace && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                      Unattended Safe Place Drop
                    </span>
                  )}
                </div>

                {order.proofOfDelivery.ageVerification?.verified && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-950">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Age Verification Verified
                    </span>
                    <p className="text-[10px] mt-0.5 text-amber-800">
                      ID Inspected: {order.proofOfDelivery.ageVerification.idType.replace(/_/g, ' ')} • Year of Birth: {order.proofOfDelivery.ageVerification.recipientYearOfBirth}
                    </p>
                  </div>
                )}

                {order.proofOfDelivery.notes && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 text-xs text-slate-700">
                    <strong className="text-slate-900">Driver Notes:</strong> {order.proofOfDelivery.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER SUPPORT FOOTER */}
        <div className="p-4 bg-white rounded-3xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Questions regarding your delivery? Contact our <strong>{currentDepot.name}</strong> customer desk.</span>
          </div>
          <div className="flex items-center gap-1 text-slate-800 font-bold">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>0800 123 4567</span>
          </div>
        </div>
      </main>
    </div>
  );
};
