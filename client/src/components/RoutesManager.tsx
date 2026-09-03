import React, { useState } from 'react';
import { DeliveryRoute, Driver, VanVehicle, BrandTheme, Depot } from '../types';
import {
  Route as RouteIcon,
  Truck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Barcode,
  GripVertical
} from 'lucide-react';

interface Props {
  routes: DeliveryRoute[];
  drivers: Driver[];
  vans: VanVehicle[];
  depots: Depot[];
  selectedDepotId: string;
  brandTheme: BrandTheme;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onAssignVanToRoute: (routeId: string, vanId: string) => void;
  onUnassignOrCancelRoute: (routeId: string) => void;
  onMoveOrderBetweenRoutes: (orderId: string, sourceRouteId: string, targetRouteId: string) => void;
  onOpenScanToVan: (route: DeliveryRoute) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const RoutesManager: React.FC<Props> = ({
  routes,
  drivers,
  vans,
  depots,
  selectedDepotId,
  brandTheme,
  onAssignDriverToRoute,
  onAssignVanToRoute,
  onUnassignOrCancelRoute,
  onMoveOrderBetweenRoutes,
  onOpenScanToVan,
  onSwitchToDriver,
}) => {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [sourceRouteId, setSourceRouteId] = useState<string | null>(null);
  const [barcodeScanInput, setBarcodeScanInput] = useState<string>('');
  const [scanVanModalRouteId, setScanVanModalRouteId] = useState<string | null>(null);

  const currentDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];

  const depotRoutes = routes.filter((r) => r.depotId === selectedDepotId);
  const depotDrivers = drivers.filter((d) => d.depotId === selectedDepotId);
  const depotVans = vans.filter((v) => v.depotId === selectedDepotId);

  const handleDragStart = (orderId: string, rId: string) => {
    setDraggedOrderId(orderId);
    setSourceRouteId(rId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetRouteId: string) => {
    if (draggedOrderId && sourceRouteId && sourceRouteId !== targetRouteId) {
      onMoveOrderBetweenRoutes(draggedOrderId, sourceRouteId, targetRouteId);
    }
    setDraggedOrderId(null);
    setSourceRouteId(null);
  };

  const handleScanVanBarcodeSubmit = (e: React.FormEvent, routeId: string) => {
    e.preventDefault();
    const query = barcodeScanInput.trim().toUpperCase();
    if (!query) return;

    const matchedVan = depotVans.find(
      (v) => v.barcode.toUpperCase() === query || v.registration.replace(/\s+/g, '').toUpperCase() === query
    );

    if (matchedVan) {
      onAssignVanToRoute(routeId, matchedVan.id);
      setScanVanModalRouteId(null);
      setBarcodeScanInput('');
    } else {
      alert(`No van found matching barcode "${query}" in ${currentDepot.name}.`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
            <h2 className="text-lg font-black text-slate-900">
              Active Manifests & Route Allocation ({currentDepot.name})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decoupled Driver & Van pairing. Assign any roadworthy van or scan its barcode, assign a driver, or drag stops to rebalance manifests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border">
            Active Routes: <strong className="text-slate-900">{depotRoutes.length}</strong>
          </span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            Available Vans: <strong className="text-blue-900">{depotVans.filter(v => v.status === 'AVAILABLE').length} / {depotVans.length}</strong>
          </span>
        </div>
      </div>

      {depotRoutes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-3">
          <RouteIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No Active Routes Created Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Go to the Dispatch Dashboard to auto-batch unassigned backlog orders into optimised depot delivery manifests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {depotRoutes.map((route) => {
            const isAssignedDriver = !!route.driverId;
            const isAssignedVan = !!route.vanId;
            const isProblem = route.isProblemRoute;
            const isFull = route.orders.length >= (currentDepot.maxOrdersPerVan || 6);
            const assignedVan = vans.find((v) => v.id === route.vanId);

            return (
              <div
                key={route.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(route.id)}
                className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition relative flex flex-col ${
                  isProblem
                    ? 'border-rose-300 bg-rose-50/10'
                    : isAssignedDriver && isAssignedVan
                    ? 'border-emerald-300 bg-emerald-50/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{route.routeNumber}</span>
                      {assignedVan && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
                          assignedVan.status === 'FAULT_REPORTED' ? 'bg-amber-100 text-amber-950 border-amber-400' :
                          assignedVan.status === 'MAINTENANCE' ? 'bg-purple-100 text-purple-950 border-purple-300' :
                          assignedVan.status === 'GROUNDED' ? 'bg-rose-100 text-rose-950 border-rose-400' :
                          'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {assignedVan.registration} {assignedVan.status === 'FAULT_REPORTED' ? '(⚠️ Defect)' : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Depot: <strong>{currentDepot.city}</strong> • {route.orders.length} Drops ({route.totalDistanceKm} km)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {route.allLoaded && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Loaded
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        isProblem
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : route.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : route.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : isAssignedDriver && isAssignedVan
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isProblem ? 'Problem (>8h)' : route.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 my-3.5 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-slate-400 block text-[9px] font-bold">STOPS</span>
                    <span className="font-black text-slate-800">
                      {route.orders.length} / {currentDepot.maxOrdersPerVan || 6}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-slate-400 block text-[9px] font-bold">DRIVE TIME</span>
                    <span className="font-black text-slate-800">{Math.floor(route.totalDrivingMins / 60)}h {route.totalDrivingMins % 60}m</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-slate-400 block text-[9px] font-bold">DWELL TIME</span>
                    <span className="font-black" style={{ color: brandTheme.secondaryColour }}>{Math.floor(route.totalDwellMins / 60)}h {route.totalDwellMins % 60}m</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                    <span className="text-slate-400 block text-[9px] font-bold">TOTAL SHIFT</span>
                    <span className={`font-black ${isProblem ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m
                    </span>
                  </div>
                </div>

                {isProblem && route.problemReason && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 font-bold mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{route.problemReason}</span>
                  </div>
                )}

                <div className="space-y-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-between">
                    <span>Manifest Stops (Drag to rebalance):</span>
                    {isFull && <span className="text-amber-700 font-black">Max Van Capacity Reached</span>}
                  </span>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {route.orders.map((order, idx) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={() => handleDragStart(order.id, route.id)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-gray-200 flex items-center justify-between text-xs cursor-grab active:cursor-grabbing transition"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{order.customerName}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-blue-600" />
                              {order.postcode} • {order.items.length} SKUs
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-slate-700 text-[10px] font-bold block">
                            {order.manualDwellOverrideMins ?? order.totalDwellMins}m dwell
                          </span>
                          <span className={`text-[9px] font-bold uppercase ${order.status === 'DELIVERED' ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  <div className="p-3 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-blue-900 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" /> Assigned Delivery Van:
                      </span>

                      <button
                        onClick={() => {
                          setScanVanModalRouteId(scanVanModalRouteId === route.id ? null : route.id);
                          setBarcodeScanInput('');
                        }}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Barcode className="w-3 h-3" />
                        {scanVanModalRouteId === route.id ? 'Close Scanner' : 'Scan Van Barcode'}
                      </button>
                    </div>

                    {scanVanModalRouteId === route.id ? (
                      <form
                        onSubmit={(e) => handleScanVanBarcodeSubmit(e, route.id)}
                        className="flex gap-1.5 animate-fadeIn"
                      >
                        <input
                          type="text"
                          autoFocus
                          placeholder="Scan or type barcode (e.g. VAN-KL24BHM)..."
                          value={barcodeScanInput}
                          onChange={(e) => setBarcodeScanInput(e.target.value)}
                          className="flex-1 text-xs font-mono font-bold p-1.5 border rounded-xl bg-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                        >
                          Pair Van
                        </button>
                      </form>
                    ) : (
                      <select
                        value={route.vanId || ''}
                        onChange={(e) => onAssignVanToRoute(route.id, e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border-gray-300 p-2 border focus:ring-blue-500 bg-white"
                      >
                        <option value="">-- Select Van from Fleet --</option>
                        {depotVans.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registration} • {v.model} {
                              v.status === 'FAULT_REPORTED' ? '(⚠️ Defect Reported)' :
                              v.status === 'MAINTENANCE' ? '(🔧 Maintenance)' :
                              v.status === 'GROUNDED' ? '(⛔ Grounded)' :
                              v.status === 'ON_ROUTE' ? '(🚚 On Route)' : '(✓ Available)'
                            }
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Assigned Driver:
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={route.driverId || ''}
                        onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                        className="flex-1 text-xs font-bold rounded-xl border-gray-300 p-2 border focus:ring-blue-500 bg-white"
                      >
                        <option value="">-- Select Driver --</option>
                        {depotDrivers.map((drv) => (
                          <option key={drv.id} value={drv.id}>
                            {drv.name} ({drv.phone})
                          </option>
                        ))}
                      </select>

                      {route.driverId && (
                        <button
                          onClick={() => onSwitchToDriver(route.driverId!)}
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition shrink-0 border border-emerald-200"
                        >
                          Driver View 📱
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => onUnassignOrCancelRoute(route.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Undo / Dissolve Route
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenScanToVan(route)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border transition flex items-center gap-1"
                    >
                      <Barcode className="w-3.5 h-3.5 text-blue-600" />
                      LIFO Staging
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
