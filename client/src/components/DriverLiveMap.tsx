import React, { useState } from 'react';
import { Driver, DeliveryRoute } from '../types';
import {
  Truck,
  Phone,
  AlertTriangle,
  Navigation,
  Send,
  Mail,
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  routes: DeliveryRoute[];
  onSelectDriverToView: (driverId: string) => void;
}

export const DriverLiveMap: React.FC<Props> = ({
  drivers,
  routes,
  onSelectDriverToView,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [delayNoticeSent, setDelayNoticeSent] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [customDelayMins, setCustomDelayMins] = useState<number>(25);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const matchedRoute = routes.find(
    (r) => r.driverId === selectedDriver?.id && r.status !== 'COMPLETED'
  ) || routes.find((r) => r.driverId === selectedDriver?.id);

  // Remaining orders breakdown
  const routeOrders = matchedRoute ? matchedRoute.orders : [];
  const completedOrders = routeOrders.filter((o) => o.status === 'DELIVERED');
  const remainingOrders = routeOrders.filter((o) => o.status !== 'DELIVERED');
  const nextOrder = remainingOrders[0];

  // Schedule Variance / Delay Calculation
  const isDelayed = selectedDriver?.status === 'DELIVERING' || (selectedDriver?.id === 'drv-2');
  const delayMinutes = isDelayed ? customDelayMins : 0;
  const scheduleStatus = isDelayed ? 'BEHIND_SCHEDULE' : 'ON_SCHEDULE';

  const handleBroadcastDelayNotification = (channel: 'SMS_AND_EMAIL' | 'SMS_ONLY' | 'EMAIL_ONLY') => {
    if (!remainingOrders.length) return;
    setIsBroadcasting(true);

    setTimeout(() => {
      setIsBroadcasting(false);
      setDelayNoticeSent(
        `✓ Dispatched schedule update via ${channel.replace(/_/g, ' ')} to all ${remainingOrders.length} remaining customers on ${selectedDriver.name}'s route (+${delayMinutes}m traffic delay alert).`
      );
      setTimeout(() => setDelayNoticeSent(''), 6000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200">
              Live Fleet Telematics & Dynamic Schedule Tracking
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Real-Time Vehicle Status & ETA Variance Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor driver drop progress, live schedule timing vs SLA windows, and dispatch proactive customer delay alerts.
          </p>
        </div>

        {/* Global Broadcast Status */}
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl border border-gray-200 text-xs">
          <Truck className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-700">
            Active Vans on Road: <strong>{drivers.filter(d => d.status !== 'IDLE').length} / {drivers.length}</strong>
          </span>
        </div>
      </div>

      {delayNoticeSent && (
        <div className="p-4 bg-emerald-50 text-emerald-950 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{delayNoticeSent}</span>
        </div>
      )}

      {/* Main Telematics Grid: Left Driver Selector | Right Live Telematics Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Driver Fleet List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 shadow-sm border border-gray-200 space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
            Fleet Drivers ({drivers.length})
          </span>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {drivers.map((drv) => {
              const isSelected = selectedDriver?.id === drv.id;
              const r = routes.find((rt) => rt.driverId === drv.id && rt.status !== 'COMPLETED');
              const totalStops = r ? r.orders.length : 0;
              const remainingStops = r ? r.orders.filter((o) => o.status !== 'DELIVERED').length : 0;
              const drvDelayed = drv.id === 'drv-2' || (drv.status === 'DELIVERING' && remainingStops > 0);

              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(drv.id)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                        drv.status === 'DELIVERING' ? 'bg-amber-600' :
                        drv.status === 'ON_ROUTE' ? 'bg-blue-600' : 'bg-slate-600'
                      }`}>
                        {drv.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{drv.name}</h4>
                        <span className="font-mono text-[10px] text-slate-500 font-bold">{drv.vehicleReg}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      drv.status === 'DELIVERING' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      drv.status === 'ON_ROUTE' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {drv.status}
                    </span>
                  </div>

                  {/* Orders Remaining & Timing Pills */}
                  {r ? (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 text-center">
                      <div className="bg-white p-1.5 rounded-xl border border-gray-200">
                        <span className="text-[9px] text-slate-400 block font-bold">DROPS LEFT</span>
                        <span className="font-black text-slate-900 text-xs">
                          {remainingStops} / {totalStops}
                        </span>
                      </div>

                      <div className={`p-1.5 rounded-xl border ${
                        drvDelayed ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <span className="text-[9px] block font-bold">SCHEDULE</span>
                        <span className="font-black text-xs">
                          {drvDelayed ? `+${customDelayMins}m Late` : 'On Time ✓'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic pt-1 border-t border-gray-100">
                      No active route assigned (Stationed at depot)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Selected Driver In-Depth Telematics */}
        {selectedDriver ? (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Driver Telematics Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-base shadow">
                    {selectedDriver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{selectedDriver.name}</h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black border border-amber-300">
                        {selectedDriver.vehicleReg}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> {selectedDriver.phone} • GPS Telematics Last Heartbeat: <strong>{selectedDriver.lastUpdated}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDriverToView(selectedDriver.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  Open Driver View 📱
                </button>
              </div>

              {/* 4 Telematics Status Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {/* 1. Remaining Drops */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Drops</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {remainingOrders.length} <span className="text-xs text-slate-400 font-normal">/ {routeOrders.length}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{completedOrders.length} drops completed</span>
                </div>

                {/* 2. Schedule Timing vs Anticipated SLA */}
                <div className={`p-3.5 rounded-2xl border ${
                  scheduleStatus === 'BEHIND_SCHEDULE'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Timing Variance</span>
                  <span className="text-2xl font-black mt-1 block">
                    {scheduleStatus === 'BEHIND_SCHEDULE' ? `+${delayMinutes}m` : 'On Time'}
                  </span>
                  <span className="text-[10px] font-bold block">
                    {scheduleStatus === 'BEHIND_SCHEDULE' ? '⚠️ Running Behind' : '✓ Tracking to Schedule'}
                  </span>
                </div>

                {/* 3. Next Customer Stop */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Scheduled Stop</span>
                  {nextOrder ? (
                    <>
                      <span className="text-xs font-black text-slate-900 block truncate mt-1">
                        {nextOrder.customerName}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">{nextOrder.postcode}</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic mt-1 block">Depot Return</span>
                  )}
                </div>

                {/* 4. Live GPS Coordinates */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Van Coordinates</span>
                  <span className="font-mono text-xs font-black text-slate-900 mt-1 block">
                    {selectedDriver.currentLat.toFixed(4)}, {selectedDriver.currentLng.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Live Telematics
                  </span>
                </div>
              </div>

              {/* SIMULATED MAP RADAR DISPLAY */}
              <div className="relative h-60 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                
                {/* Animated Vehicle Pulse */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping" />
                    <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
                      <Truck className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-slate-900/90 text-white px-3 py-1 rounded-xl text-xs font-bold border border-slate-700 shadow mt-2 text-center">
                    <span className="text-amber-400 font-black">{selectedDriver.name}</span> ({selectedDriver.vehicleReg})
                    <span className="text-[10px] text-slate-400 block">
                      En route: {remainingOrders.length} stops left {isDelayed && `(Running ${delayMinutes} mins behind)`}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 bg-black/70 text-slate-300 px-3 py-1 rounded-lg text-[10px] font-mono">
                  GPS: {selectedDriver.currentLat.toFixed(4)}, {selectedDriver.currentLng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* SCHEDULE DELAY CONTROL & PROACTIVE CUSTOMER ALERT STATION */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-black text-slate-900">
                      Schedule Variance & Proactive Customer Notification Control
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Triggered by head office dispatchers, depot controllers, or automatically via telematics when a van falls behind schedule.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border">
                  <span className="text-[10px] font-bold text-slate-600 pl-1">Delay:</span>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    value={customDelayMins}
                    onChange={(e) => setCustomDelayMins(parseInt(e.target.value) || 20)}
                    className="w-16 text-xs font-black p-1 border rounded-lg bg-white text-center text-rose-700"
                  />
                  <span className="text-[10px] font-bold text-slate-500 pr-1">mins</span>
                </div>
              </div>

              {/* Notification Strategy Explanation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" /> Automated Multi-Channel Broadcast
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    {remainingOrders.length} Waiting Customer(s)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Dispatching an alert recalculates the live delivery windows for all <strong>{remainingOrders.length} remaining stops</strong> on {selectedDriver.name}'s route and instantly sends an updated tracking SMS and Email notification with the revised ETA.
                </p>
              </div>

              {/* Action Buttons to Broadcast Delay Alerts */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  disabled={isBroadcasting || remainingOrders.length === 0}
                  onClick={() => handleBroadcastDelayNotification('SMS_AND_EMAIL')}
                  className="px-5 py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  {isBroadcasting ? 'Broadcasting...' : `Notify All ${remainingOrders.length} Waiting Customers (SMS + Email)`}
                </button>

                <button
                  disabled={isBroadcasting || remainingOrders.length === 0}
                  onClick={() => handleBroadcastDelayNotification('SMS_ONLY')}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-gray-200 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" /> SMS Only
                </button>

                <button
                  disabled={isBroadcasting || remainingOrders.length === 0}
                  onClick={() => handleBroadcastDelayNotification('EMAIL_ONLY')}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-gray-200 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-indigo-600" /> Email Only
                </button>
              </div>

              {/* Remaining Stops List */}
              <div className="space-y-2 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Upcoming Customers to be Notified on this Route:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {remainingOrders.map((ord, idx) => (
                    <div key={ord.id} className="p-2.5 bg-slate-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                          {completedOrders.length + idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[140px]">{ord.customerName}</span>
                          <span className="text-[10px] text-slate-500">{ord.postcode}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        +{delayMinutes}m ETA
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
