import React, { useState } from 'react';
import { DeliveryRoute, Driver, BrandTheme, Depot } from '../types';
import {
  Route as RouteIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Barcode,
  GripVertical
} from 'lucide-react';

interface Props {
  routes: DeliveryRoute[];
  drivers: Driver[];
  depots: Depot[];
  selectedDepotId: string;
  brandTheme: BrandTheme;
  onAssignDriverToRoute: (routeId: string, driverId: string) => void;
  onUnassignOrCancelRoute: (routeId: string) => void;
  onMoveOrderBetweenRoutes: (orderId: string, sourceRouteId: string, targetRouteId: string) => void;
  onOpenScanToVan: (route: DeliveryRoute) => void;
  onSwitchToDriver: (driverId: string) => void;
}

export const RoutesManager: React.FC<Props> = ({
  routes,
  drivers,
  depots,
  selectedDepotId,
  brandTheme,
  onAssignDriverToRoute,
  onUnassignOrCancelRoute,
  onMoveOrderBetweenRoutes,
  onOpenScanToVan,
  onSwitchToDriver,
}) => {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragSourceRouteId, setDragSourceRouteId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState('');

  // Filter routes strictly by selected depot
  const activeRoutes = routes.filter((r) => r.depotId === selectedDepotId);
  const currentDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];
  const depotDrivers = drivers.filter((d) => d.depotId === selectedDepotId);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string, sourceRouteId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ orderId, sourceRouteId }));
    setDraggedOrderId(orderId);
    setDragSourceRouteId(sourceRouteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnRoute = (e: React.DragEvent, targetRouteId: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { orderId, sourceRouteId } = data;
      if (orderId && sourceRouteId && sourceRouteId !== targetRouteId) {
        onMoveOrderBetweenRoutes(orderId, sourceRouteId, targetRouteId);
        setActionNotice(`✓ Moved order into target route successfully.`);
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
    setDraggedOrderId(null);
    setDragSourceRouteId(null);
  };

  const handleCancelRoute = (route: DeliveryRoute) => {
    if (confirm(`Cancel "${route.routeNumber}" and return all ${route.orders.length} orders back to Unassigned pool?`)) {
      onUnassignOrCancelRoute(route.id);
      setActionNotice(`✓ Cancelled ${route.routeNumber}. All stops returned to Unassigned pool.`);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
            <h2 className="text-lg font-black text-slate-900">
              Delivery Routes & Van Manifests ({currentDepot.name})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Routes originating from <strong>{currentDepot.postcode}</strong>. Drag and drop stops between vans to rebalance shifts, or undo/cancel routes back to unassigned.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-2xl border border-gray-200">
          Max Capacity: <strong className="text-blue-900">{currentDepot.maxOrdersPerVan || 6} orders/van</strong>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Routes Grid with Drag & Drop Zones */}
      {activeRoutes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-gray-200 space-y-2">
          <RouteIcon className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No active delivery routes for {currentDepot.city}</h3>
          <p className="text-xs text-slate-400">
            Go to the Dashboard, select unassigned orders, and click "Calculate Route Feasibility" or "Auto-Batch".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeRoutes.map((route) => {
            const isAssigned = !!route.driverId;
            const isProblem = route.isProblemRoute || route.totalEstimatedMins > 480;
            const isFull = route.orders.length >= (currentDepot.maxOrdersPerVan || 6);

            return (
              <div
                key={route.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnRoute(e, route.id)}
                className={`bg-white rounded-3xl p-6 shadow-sm border-2 transition flex flex-col justify-between ${
                  dragSourceRouteId && dragSourceRouteId !== route.id
                    ? 'border-dashed border-blue-400 bg-blue-50/20'
                    : isProblem
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-gray-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Route Header & Status Badges */}
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <span className="font-mono text-xs font-black" style={{ color: brandTheme.secondaryColour }}>
                        {route.routeNumber}
                      </span>
                      <h3 className="font-black text-slate-900 text-sm mt-0.5">
                        {currentDepot.city} Local Depot Manifest
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {route.allLoaded && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
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
                            : isAssigned
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isProblem ? 'Problem (>8h)' : route.status}
                      </span>
                    </div>
                  </div>

                  {/* Shift Duration & Stop Metrics */}
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

                  {/* Draggable Stop Sequence List */}
                  <div className="space-y-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-between">
                      <span>Manifest Stops (Drag to move to another van):</span>
                      {isFull && <span className="text-amber-700 font-black">Max Van Capacity Reached</span>}
                    </span>

                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {route.orders.map((ord, idx) => (
                        <div
                          key={ord.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, ord.id, route.id)}
                          className={`p-3 rounded-2xl border transition text-xs flex items-center justify-between cursor-grab active:cursor-grabbing ${
                            draggedOrderId === ord.id
                              ? 'opacity-40 bg-blue-100 border-blue-500'
                              : 'bg-slate-50 hover:bg-slate-100 border-gray-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{ord.customerName}</span>
                                <span className="font-mono text-[10px] text-slate-400">({ord.trackingNumber})</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {ord.address}, <strong className="text-slate-700">{ord.postcode}</strong>
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border shadow-2xs">
                            {ord.manualDwellOverrideMins || ord.totalDwellMins}m dwell
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Driver Assignment & Action Bar */}
                <div className="mt-5 pt-3 border-t border-gray-100 space-y-3">
                  {/* Staging Scan-to-Van Loading */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenScanToVan(route)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-gray-200"
                    >
                      <Barcode className="w-4 h-4 text-blue-600" />
                      {route.allLoaded ? 'Review Loaded Van' : 'Scan-to-Van (LIFO)'}
                    </button>

                    {/* UNDO / CANCEL ROUTE BUTTON */}
                    <button
                      onClick={() => handleCancelRoute(route)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-rose-200"
                      title="Cancel this route and return all orders back to the unassigned pool"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Cancel Route
                    </button>
                  </div>

                  {/* Driver Assignment Select */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <select
                        value={route.driverId || ''}
                        onChange={(e) => onAssignDriverToRoute(route.id, e.target.value)}
                        className="w-full text-xs font-bold rounded-xl border-gray-300 p-2 border focus:ring-blue-500 bg-slate-50"
                      >
                        <option value="">-- Unassigned (Assign Driver) --</option>
                        {depotDrivers.map((drv) => (
                          <option key={drv.id} value={drv.id}>
                            {drv.name} ({drv.vehicleReg})
                          </option>
                        ))}
                      </select>
                    </div>

                    {route.driverId && (
                      <button
                        onClick={() => onSwitchToDriver(route.driverId!)}
                        className="py-2 px-3 bg-blue-50 hover:bg-blue-100 font-bold text-xs rounded-xl transition shrink-0"
                        style={{ color: brandTheme.secondaryColour }}
                      >
                        Driver View 📱
                      </button>
                    )}
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
