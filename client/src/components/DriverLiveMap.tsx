import React, { useState } from 'react';
import { Driver, DeliveryRoute } from '../types';
import { Truck, Radio, Phone, UserCheck, ShieldCheck } from 'lucide-react';

interface Props {
  drivers: Driver[];
  routes: DeliveryRoute[];
  onSelectDriverToView: (driverId: string) => void;
}

export const DriverLiveMap: React.FC<Props> = ({ drivers, routes, onSelectDriverToView }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const driverRoute = routes.find((r) => r.driverId === selectedDriver?.id && r.status !== 'COMPLETED');

  // OpenStreetMap embed URL centered on selected driver's coordinates
  const lat = selectedDriver?.currentLat || 52.4862;
  const lng = selectedDriver?.currentLng || -1.8904;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.08}%2C${lat - 0.05}%2C${lng + 0.08}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
      {/* Real Map Viewport */}
      <div className="flex-1 bg-slate-100 relative flex flex-col min-h-[440px]">
        {/* Map Top Bar */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-gray-900">
              Live Fleet Location: <span className="text-[#005696] font-extrabold">{selectedDriver?.name}</span> ({selectedDriver?.vehicleReg})
            </span>
          </div>
          <span className="text-gray-500 text-[11px]">
            GPS: {lat.toFixed(4)}, {lng.toFixed(4)} • Updated {selectedDriver?.lastUpdated}
          </span>
        </div>

        {/* Live Interactive Map Iframe */}
        <div className="flex-1 relative w-full h-full">
          <iframe
            title="Driver GPS Live Map"
            src={osmUrl}
            className="w-full h-full border-0 min-h-[420px]"
            loading="lazy"
          ></iframe>

          {/* Floating Vehicle Overlay Card */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-lg text-xs max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-[#005696] text-white">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{selectedDriver?.name}</h4>
                <p className="text-[11px] text-gray-500">{selectedDriver?.vehicleReg}</p>
              </div>
            </div>
            {driverRoute ? (
              <p className="text-[11px] text-[#005696] font-bold mt-1 bg-blue-50 p-1.5 rounded">
                Manifest: {driverRoute.routeNumber} ({driverRoute.orders.length} stops)
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1">No active manifest assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Driver List & Telematics Sidebar */}
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="font-bold text-sm text-gray-900">Drivers Online ({drivers.length})</h3>
            </div>
          </div>

          <div className="space-y-2">
            {drivers.map((drv) => {
              const isSelected = selectedDriver?.id === drv.id;
              const activeRoute = routes.find((r) => r.driverId === drv.id && r.status !== 'COMPLETED');

              return (
                <div
                  key={drv.id}
                  onClick={() => setSelectedDriverId(drv.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-blue-50 border-[#005696] shadow-sm ring-1 ring-[#005696]' : 'hover:bg-slate-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        isSelected ? 'bg-[#FF6B00]' : 'bg-[#005696]'
                      }`}
                    >
                      {drv.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{drv.name}</h4>
                      <p className="text-[11px] text-gray-500">{drv.vehicleReg}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {drv.status}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {activeRoute ? `${activeRoute.orders.length} stops` : 'Idle'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Info for Selected Driver */}
          {selectedDriver && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">Driver Telematics</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> GPS Online
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phone:</span>
                <a href={`tel:${selectedDriver.phone}`} className="font-bold text-[#005696] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedDriver.phone}
                </a>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Assigned Route:</span>
                <span className="font-bold text-gray-900">
                  {driverRoute ? driverRoute.routeNumber : 'None'}
                </span>
              </div>
            </div>
          )}
        </div>

        {selectedDriver && (
          <button
            onClick={() => onSelectDriverToView(selectedDriver.id)}
            className="w-full mt-4 py-2.5 bg-[#005696] hover:bg-[#004070] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            Switch to {selectedDriver.name.split(' ')[0]}'s Driver App 📱
          </button>
        )}
      </div>
    </div>
  );
};
