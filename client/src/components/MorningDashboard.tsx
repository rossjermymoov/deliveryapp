import React, { useState } from 'react';
import { Order, DeliveryRoute, Driver, Depot, BrandTheme, ShiftParameters } from '../types';
import { optimizeRouteStops, DEFAULT_SHIFT_PARAMS } from '../utils/routing';
import {
  Sparkles,
  Truck,
  CheckCircle2,
  Clock,
  Send,
  Radio,
  Warehouse,
  ChevronRight,
  Route as RouteIcon,
  Check
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  depots: Depot[];
  selectedDepotId: string;
  brandTheme: BrandTheme;
  shiftParams?: ShiftParameters;
  onSelectDepot: (depotId: string) => void;
  onNavigateToTab: (tabName: 'dashboard' | 'orders' | 'routes' | 'map' | 'cs_lookup') => void;
  onSelectRoute: (routeId: string) => void;
  onAutoBatchDepot: () => void;
  onCreateRoute?: (route: DeliveryRoute) => void;
}

export const MorningDashboard: React.FC<Props> = ({
  orders,
  routes,
  drivers,
  depots,
  selectedDepotId,
  brandTheme,
  shiftParams = DEFAULT_SHIFT_PARAMS,
  onSelectDepot,
  onNavigateToTab,
  onSelectRoute,
  onAutoBatchDepot,
  onCreateRoute,
}) => {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [routePreview, setRoutePreview] = useState<any>(null);

  // Active depot filtering
  const activeDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];
  const activeOrders = selectedDepotId === 'depot-all'
    ? orders
    : orders.filter((o) => o.depotId === selectedDepotId);

  const activeRoutes = selectedDepotId === 'depot-all'
    ? routes
    : routes.filter((r) => r.depotId === selectedDepotId);

  // 5 Operational Morning Pipeline Buckets
  const unassignedOrders = activeOrders.filter((o) => o.status === 'PENDING');
  const routedOrders = activeOrders.filter((o) => o.status === 'ROUTED' || o.status === 'LOADED');
  const inTransitOrders = activeOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const deliveredOrders = activeOrders.filter((o) => o.status === 'DELIVERED');
  const totalOrdersCount = activeOrders.length;

  const problemRoutes = activeRoutes.filter((r) => r.isProblemRoute || r.totalEstimatedMins > (shiftParams.shiftLengthHours * 60));
  const activeDriversCount = drivers.filter((d) => selectedDepotId === 'depot-all' || d.depotId === selectedDepotId).length;

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCalculateRoute = () => {
    const selected = unassignedOrders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length === 0) return;

    const opt = optimizeRouteStops(selected, shiftParams);
    setRoutePreview(opt);
  };

  const handleConfirmAndCreateRoute = () => {
    if (!routePreview || !onCreateRoute) return;

    const isProblem = !routePreview.shiftAnalysis.fitsInShift;
    const depotName = activeDepot.city || 'Regional';
    const routeNumber = `Route ${routes.length + 1} (${depotName})`;

    const newRoute: DeliveryRoute = {
      id: `route-${Date.now()}`,
      routeNumber,
      depotId: selectedDepotId === 'depot-all' ? 'depot-bhm' : selectedDepotId,
      date: new Date().toISOString(),
      status: 'UNASSIGNED',
      totalDwellMins: routePreview.totalDwellMins,
      totalDrivingMins: routePreview.totalDrivingMins,
      breakTimeMins: routePreview.breakTimeMins,
      totalEstimatedMins: routePreview.totalDurationMins,
      totalDistanceKm: routePreview.totalDistanceKm,
      shiftUtilisationPct: routePreview.shiftAnalysis.utilisationPct,
      isProblemRoute: isProblem,
      problemReason: isProblem ? `Exceeds ${shiftParams.shiftLengthHours}h limit.` : undefined,
      driverId: undefined,
      orders: routePreview.orderedStops.map((o: Order) => ({
        ...o,
        routeId: `route-${Date.now()}`,
        status: 'ROUTED' as const,
      })),
    };

    onCreateRoute(newRoute);
    setSelectedOrderIds([]);
    setRoutePreview(null);
    onNavigateToTab('routes');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Controller Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-white text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              Controller Dashboard
            </span>
            <span className="text-xs text-slate-400 font-bold">
              • Fleet Operations & Route Feasibility
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {activeDepot.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Postcode: <strong>{activeDepot.postcode}</strong> • Catchment Radius: <strong>{activeDepot.maxDeliveryRadiusMiles} miles</strong> • Active Fleet: <strong>{activeDriversCount} Vans</strong>
          </p>
        </div>

        {/* Depot Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-gray-200 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-slate-500 ml-2" />
            <select
              value={selectedDepotId}
              onChange={(e) => onSelectDepot(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-900 border-0 focus:ring-0 cursor-pointer pr-4"
            >
              {depots.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name} ({d.postcode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onAutoBatchDepot}
            disabled={unassignedOrders.length === 0}
            className="px-5 py-3 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center gap-2 hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: brandTheme.secondaryColour }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Auto-Batch {unassignedOrders.length} Unassigned Orders
          </button>
        </div>
      </div>

      {/* 5-Metric Operations Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Unassigned Bucket */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-black uppercase tracking-wider">Unassigned</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-950">{unassignedOrders.length}</span>
            <span className="text-[10px] text-amber-700 block font-bold">Needs Routing</span>
          </div>
        </div>

        {/* Assigned Manifests */}
        <div
          onClick={() => onNavigateToTab('routes')}
          className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-black uppercase tracking-wider">Assigned Manifests</span>
            <RouteIcon className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-indigo-950">{routedOrders.length}</span>
            <span className="text-[10px] text-indigo-700 block font-bold">{activeRoutes.length} Manifests</span>
          </div>
        </div>

        {/* Out in Transit */}
        <div
          onClick={() => onNavigateToTab('map')}
          className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-black uppercase tracking-wider">In Transit</span>
            <Radio className="w-4 h-4 animate-pulse text-blue-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-950">{inTransitOrders.length}</span>
            <span className="text-[10px] text-blue-700 block font-bold">Live On Van</span>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-black uppercase tracking-wider">Completed Orders</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-950">{deliveredOrders.length}</span>
            <span className="text-[10px] text-emerald-700 block font-bold">Verified PODs</span>
          </div>
        </div>

        {/* Total Day Volume */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Volume</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
            <span className="text-[10px] text-slate-500 block font-bold">Orders Scheduled</span>
          </div>
        </div>
      </div>

      {/* Problem Route Watchdog Alert */}
      {problemRoutes.length > 0 && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div>
            <h4 className="font-black text-rose-950 text-xs flex items-center gap-1.5">
              ⚠️ Attention Controller: {problemRoutes.length} Route(s) Exceed Legal 8.0h Driver Shift Limit
            </h4>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Traffic congestion and total customer dwell times would cause statutory driving hour breaches. Split stops across additional vans.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('routes')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
          >
            Review Problem Routes ➔
          </button>
        </div>
      )}

      {/* UNASSIGNED ORDERS TABLE & EMBEDDED ROUTE OPTIMISER */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-slate-900">
                Unassigned Orders ({unassignedOrders.length})
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Select orders to calculate optimal route based on dwell times, traffic & rest breaks.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedOrderIds(unassignedOrders.map((o) => o.id))}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Unassigned Orders Table */}
        {unassignedOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-slate-700 text-sm">All orders assigned for this depot!</p>
            <p className="text-slate-400 mt-0.5">Switch depot or check Routes & Manifests to dispatch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">Select</th>
                  <th className="p-3">Tracking</th>
                  <th className="p-3">Customer & Destination</th>
                  <th className="p-3">Products / SKUs</th>
                  <th className="p-3 text-center">Dwell Time</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unassignedOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const effectiveDwell = ord.manualDwellOverrideMins ?? ord.totalDwellMins;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => handleToggleSelectOrder(ord.id)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-blue-50 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOrder(ord.id)}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 font-mono font-black" style={{ color: brandTheme.secondaryColour }}>
                        {ord.trackingNumber}
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-slate-500">{ord.address}, <strong>{ord.postcode}</strong></span>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ord.items.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border text-[10px] font-bold">
                              {item.quantity}x {item.sku}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {effectiveDwell} mins
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Route Calculation Action Row */}
        {unassignedOrders.length > 0 && (
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-bold">
              {selectedOrderIds.length} orders selected for routing
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCalculateRoute}
                disabled={selectedOrderIds.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Calculate Route Feasibility
              </button>
            </div>
          </div>
        )}

        {/* Optimised Route Preview Card */}
        {routePreview && (
          <div className={`p-4 rounded-2xl border animate-fadeIn mt-4 ${
            routePreview.shiftAnalysis.fitsInShift
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-rose-50/70 border-rose-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                {routePreview.shiftAnalysis.fitsInShift ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Feasible Route ({routePreview.shiftAnalysis.utilisationPct}% of {shiftParams.shiftLengthHours}h Shift)
                  </>
                ) : (
                  <>⚠️ Exceeds {shiftParams.shiftLengthHours}h Shift Limit!</>
                )}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {routePreview.totalDistanceKm} km total
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className="bg-white p-2 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold block">DRIVE TIME</span>
                <span className="font-black text-slate-800">{Math.floor(routePreview.totalDrivingMins / 60)}h {routePreview.totalDrivingMins % 60}m</span>
              </div>
              <div className="bg-white p-2 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold block">DWELL TIME</span>
                <span className="font-black" style={{ color: brandTheme.secondaryColour }}>{Math.floor(routePreview.totalDwellMins / 60)}h {routePreview.totalDwellMins % 60}m</span>
              </div>
              <div className="bg-white p-2 rounded-xl border">
                <span className="text-[10px] text-slate-400 font-bold block">MANDATORY BREAK</span>
                <span className="font-black text-amber-700">{routePreview.breakTimeMins} mins</span>
              </div>
            </div>

            <button
              onClick={handleConfirmAndCreateRoute}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Save & Generate Delivery Route
            </button>
          </div>
        )}
      </div>

      {/* Active Routes Manifest Summary Cards */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-black text-slate-900 text-base">Active Manifest Routes ({activeRoutes.length})</h3>
            <p className="text-xs text-slate-400">Current assigned van manifests scheduled for delivery today</p>
          </div>
          <button
            onClick={() => onNavigateToTab('routes')}
            className="text-xs font-bold hover:underline flex items-center gap-1"
            style={{ color: brandTheme.secondaryColour }}
          >
            Manage All Routes <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeRoutes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No routes scheduled yet. Use the unassigned table above to calculate routes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRoutes.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onSelectRoute(r.id);
                  onNavigateToTab('routes');
                }}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-gray-200 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="font-mono text-xs font-black" style={{ color: brandTheme.secondaryColour }}>
                    {r.routeNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    r.isProblemRoute ? 'bg-rose-100 text-rose-800' :
                    r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    r.driverId ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {r.isProblemRoute ? 'Problem' : r.driver ? `Driver: ${r.driver.name}` : 'Unassigned'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">STOPS</span>
                    <span className="font-black text-slate-800">{r.orders.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">SHIFT TIME</span>
                    <span className="font-black text-slate-800">{Math.floor(r.totalEstimatedMins / 60)}h {r.totalEstimatedMins % 60}m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">DISTANCE</span>
                    <span className="font-black text-slate-800">{r.totalDistanceKm} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
