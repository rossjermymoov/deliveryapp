import React, { useState } from 'react';
import { Driver, DeliveryRoute } from '../types';
import { Truck, Radio, ShieldCheck } from 'lucide-react';

interface Props {
  drivers: Driver[];
  routes: DeliveryRoute[];
  onSelectDriverToView: (driverId: string) => void;
}

export const DriverLiveMap: React.FC<Props> = ({ drivers, routes, onSelectDriverToView }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(drivers[0]?.id || null);

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverRoute = routes.find((r) => r.driverId === selectedDriver?.id && r.status !== 'COMPLETED');

  // Birmingham base region projection
  const getMapX = (lng: number) => {
    const pct = ((lng - (-2.02)) / 0.30) * 100;
    return Math.max(5, Math.min(95, pct));
  };
  const getMapY = (lat: number) => {
    const pct = ((52.55 - lat) / 0.17) * 100;
    return Math.max(5, Math.min(95, pct));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Map Display Viewport */}
      <div className="flex-1 bg-slate-900 relative p-4 flex flex-col justify-between overflow-hidden min-h-[420px]">
        {/* Map Top Status Bar */}
        <div className="z-10 flex items-center justify-between bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 text-white text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold">Live GPS Fleet Telematics (Active Device Polling)</span>
          </div>
          <span className="text-slate-400 text-[11px]">Region: Birmingham Central & West Midlands Works</span>
        </div>

        {/* Vector Grid Canvas */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Depot Base Marker */}
        <div
          className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${getMapX(-1.8687)}%`, top: `${getMapY(52.4938)}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-[#005696] border-2 border-white flex items-center justify-center text-white shadow-lg">
            🏢
          </div>
          <span className="text-[10px] font-bold text-white bg-[#003366] px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
            Kalsi Main Works (Depot)
          </span>
        </div>

        {/* Driver Live Pins */}
        {drivers.map((drv) => {
          const isSelected = selectedDriver?.id === drv.id;
          const posX = getMapX(drv.currentLng);
          const posY = getMapY(drv.currentLat);

          return (
            <div
              key={drv.id}
              onClick={() => setSelectedDriverId(drv.id)}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform hover:scale-110"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <div
                className={`relative w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border-2 transition ${
                  isSelected
                    ? 'bg-[#FF6B00] border-white ring-4 ring-[#FF6B00]/40 scale-110'
                    : 'bg-emerald-600 border-white hover:bg-emerald-500'
                }`}
              >
                <Truck className="w-5 h-5 text-white" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              </div>
              <div className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mt-1 border border-slate-700 whitespace-nowrap">
                {drv.name.split(' ')[0]} ({drv.vehicleReg})
              </div>
            </div>
          );
        })}

        {/* Active Route Waypoints */}
        {driverRoute &&
          driverRoute.orders.map((ord, idx) => {
            const posX = getMapX(ord.lng);
            const posY = getMapY(ord.lat);
            const isDelivered = ord.status === 'DELIVERED';

            return (
              <div
                key={ord.id}
                className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90"
                style={{ left: `${posX}%`, top: `${posY}%` }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] border shadow ${
                    isDelivered ? 'bg-emerald-600 text-white border-white' : 'bg-white text-slate-900 border-blue-600 font-bold'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-[9px] text-slate-300 bg-slate-900/80 px-1 rounded mt-0.5 whitespace-nowrap">
                  {ord.customerName.substring(0, 14)}...
                </span>
              </div>
            );
          })}

        {/* Map Bottom Legend */}
        <div className="z-10 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-white text-[11px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#005696] border border-white"></span> Kalsi Depot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF6B00]"></span> Selected Van
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Active Fleet Vehicle
            </span>
          </div>
          <span className="text-slate-400">Coords update via Driver Mobile App</span>
        </div>
      </div>

      {/* Right Telematics & Driver Detail Sidebar */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h3 className="font-bold text-gray-900">Driver Live Telematics</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">{drivers.length} Drivers Online</span>
          </div>

          <div className="space-y-2 mt-4">
            {drivers.map((drv) => {
              const isSelected = selectedDriver?.id === drv.id;
              const activeRun = routes.find((r) => r.driverId === drv.id && r.status !== 'COMPLETED');

              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(drv.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-blue-50 border-[#005696] shadow-sm' : 'hover:bg-slate-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white ${
                        isSelected ? 'bg-[#FF6B00]' : 'bg-[#005696]'
                      }`}
                    >
                      {drv.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{drv.name}</h4>
                      <span className="text-[11px] text-gray-500">{drv.vehicleReg}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {drv.status}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {activeRun ? `${activeRun.orders.length} stops` : 'No run assigned'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDriver && (
            <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase">GPS Device Status</span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> GPS Active
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-400">Driver Phone:</span>
                  <a href={`tel:${selectedDriver.phone}`} className="font-bold text-[#005696] hover:underline">
                    {selectedDriver.phone}
                  </a>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-400">Current GPS Fix:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {selectedDriver.currentLat.toFixed(4)}, {selectedDriver.currentLng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-400">Last Telemetry:</span>
                  <span className="font-bold text-gray-800">{selectedDriver.lastUpdated}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Active Manifest:</span>
                  <span className="font-bold text-[#005696]">
                    {driverRoute ? driverRoute.routeNumber : 'None Assigned'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedDriver && (
          <button
            onClick={() => onSelectDriverToView(selectedDriver.id)}
            className="w-full mt-4 py-3 bg-[#005696] hover:bg-[#004070] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            Switch to {selectedDriver.name.split(' ')[0]}'s Driver App 📱
          </button>
        )}
      </div>
    </div>
  );
};
