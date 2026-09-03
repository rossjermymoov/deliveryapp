import React, { useState } from 'react';
import { Depot, BrandTheme } from '../types';
import {
  Warehouse,
  CheckCircle2,
  Save,
  Compass
} from 'lucide-react';

interface Props {
  depots: Depot[];
  brandTheme: BrandTheme;
  onUpdateDepots: (depots: Depot[]) => void;
}

export const DepotRadiusManager: React.FC<Props> = ({
  depots,
  brandTheme,
  onUpdateDepots,
}) => {
  const [localDepots, setLocalDepots] = useState<Depot[]>(depots);
  const [selectedDepotId, setSelectedDepotId] = useState<string>(depots.find(d => d.id !== 'depot-all')?.id || depots[1]?.id || depots[0]?.id);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Editable depots (excluding aggregate "depot-all")
  const activeEditableDepots = localDepots.filter((d) => d.id !== 'depot-all');
  const selectedDepot = localDepots.find((d) => d.id === selectedDepotId) || activeEditableDepots[0];

  const handleUpdateRadius = (depotId: string, radiusMiles: number) => {
    setLocalDepots((prev) =>
      prev.map((d) => (d.id === depotId ? { ...d, maxDeliveryRadiusMiles: radiusMiles } : d))
    );
  };

  const handleUpdateCapacity = (depotId: string, maxOrders: number) => {
    setLocalDepots((prev) =>
      prev.map((d) => (d.id === depotId ? { ...d, maxDailyCapacityOrders: maxOrders } : d))
    );
  };

  const handleUpdatePostcode = (depotId: string, postcode: string) => {
    setLocalDepots((prev) =>
      prev.map((d) => (d.id === depotId ? { ...d, postcode: postcode.toUpperCase() } : d))
    );
  };

  const handleSaveAllDepots = () => {
    onUpdateDepots(localDepots);
    setSaveSuccessMsg(`✓ Saved delivery radius & capacity rules across all ${activeEditableDepots.length} UK depots!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Generate dynamic OpenStreetMap embed with radius visualization
  const targetLat = selectedDepot.lat;
  const targetLng = selectedDepot.lng;
  const latDelta = (selectedDepot.maxDeliveryRadiusMiles / 69) * 1.5;
  const lngDelta = (selectedDepot.maxDeliveryRadiusMiles / 43) * 1.5;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${targetLng - lngDelta}%2C${targetLat - latDelta}%2C${targetLng + lngDelta}%2C${targetLat + latDelta}&layer=mapnik&marker=${targetLat}%2C${targetLng}`;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Header & Save Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
            <h2 className="text-lg font-black text-slate-900">
              UK Depots & Delivery Catchment Radius Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure individual delivery radius thresholds (e.g. 10 miles for high-density London vs 30 miles for Newcastle) and max order capacities.
          </p>
        </div>

        <button
          onClick={handleSaveAllDepots}
          className="px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 hover:opacity-95 shrink-0"
          style={{ backgroundColor: brandTheme.secondaryColour }}
        >
          <Save className="w-4 h-4" />
          Save All Radius Settings
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Depot List Table + Interactive Catchment Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Editable Depot Radius & Postcode Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fleet Depots ({activeEditableDepots.length} Distribution Hubs)
              </span>
              <span className="text-[11px] text-slate-400">Click any depot to preview catchment zone</span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Depot Hub</th>
                    <th className="p-3">Postcode</th>
                    <th className="p-3 text-center">Catchment Radius</th>
                    <th className="p-3 text-center">Max Daily Capacity</th>
                    <th className="p-3 text-right">Vans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeEditableDepots.map((depot) => {
                    const isSelected = selectedDepot.id === depot.id;
                    const isLondon = depot.region === 'Greater London';
                    const isNewcastle = depot.code === 'NCL';

                    return (
                      <tr
                        key={depot.id}
                        onClick={() => setSelectedDepotId(depot.id)}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 font-semibold text-slate-900'
                            : 'hover:bg-slate-50/80 text-slate-700'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-100 border text-slate-900">
                              {depot.code}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">{depot.name}</span>
                              <span className="text-[10px] text-slate-400">{depot.region} • {depot.address}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <input
                            type="text"
                            value={depot.postcode}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdatePostcode(depot.id, e.target.value)}
                            className="w-20 font-mono font-bold text-xs p-1.5 border rounded-lg bg-white uppercase text-center"
                          />
                        </td>

                        {/* Radius Input + Slider */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="range"
                              min="5"
                              max="50"
                              step="1"
                              value={depot.maxDeliveryRadiusMiles}
                              onChange={(e) => handleUpdateRadius(depot.id, parseInt(e.target.value) || 10)}
                              className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span
                              className={`font-black font-mono text-xs px-2 py-0.5 rounded-md border min-w-[58px] inline-block ${
                                isLondon ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                isNewcastle ? 'bg-indigo-50 text-indigo-900 border-indigo-300' :
                                'bg-slate-100 text-slate-800 border-gray-300'
                              }`}
                            >
                              {depot.maxDeliveryRadiusMiles} mi
                            </span>
                          </div>
                        </td>

                        {/* Capacity */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="10"
                              max="200"
                              step="5"
                              value={depot.maxDailyCapacityOrders}
                              onChange={(e) => handleUpdateCapacity(depot.id, parseInt(e.target.value) || 50)}
                              className="w-16 font-bold text-xs p-1 border rounded-lg bg-white text-center"
                            />
                            <span className="text-[10px] text-slate-400">orders</span>
                          </div>
                        </td>

                        <td className="p-3 text-right font-black text-slate-800">
                          {depot.activeVansCount} Vans
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              💡 <strong>Smart Catchment Logic:</strong> High-density urban depots (e.g. Enfield/Croydon) are restricted to 10 miles to avoid traffic congestion, while regional depots (e.g. Newcastle/North East) service up to 30 miles.
            </span>
          </div>
        </div>

        {/* Right Column: Live Catchment Radius & Interactive OpenStreetMap Map */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Depot Catchment Preview
                </span>
                <h3 className="font-black text-slate-900 text-base">{selectedDepot.name}</h3>
              </div>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-[#0072CE] border border-blue-200">
                {selectedDepot.postcode}
              </span>
            </div>

            {/* Radius summary metrics */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Radius</span>
                <span className="text-xl font-black text-slate-900">{selectedDepot.maxDeliveryRadiusMiles} Miles</span>
                <span className="text-[10px] text-slate-500 block">From {selectedDepot.postcode}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Van Capacity</span>
                <span className="text-xl font-black text-slate-900">{selectedDepot.maxDailyCapacityOrders} Orders</span>
                <span className="text-[10px] text-slate-500 block">Across {selectedDepot.activeVansCount} Fleet Vans</span>
              </div>
            </div>

            {/* Real OpenStreetMap Live Catchment Viewport */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner h-64 w-full relative">
              <iframe
                title="Depot Catchment Map"
                src={osmUrl}
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>

              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-[10px] flex items-center justify-between">
                <span>📍 Postcode Center: <strong>{selectedDepot.postcode}</strong></span>
                <span className="text-amber-400 font-bold">Radial Boundary: {selectedDepot.maxDeliveryRadiusMiles} mi</span>
              </div>
            </div>

            {/* Quick Adjuster inside Map card */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                <span>Adjust Radius for {selectedDepot.code}:</span>
                <span className="font-black text-[#0072CE]">{selectedDepot.maxDeliveryRadiusMiles} Miles</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={selectedDepot.maxDeliveryRadiusMiles}
                onChange={(e) => handleUpdateRadius(selectedDepot.id, parseInt(e.target.value) || 10)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSaveAllDepots}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Apply Catchment Changes
          </button>
        </div>
      </div>
    </div>
  );
};
