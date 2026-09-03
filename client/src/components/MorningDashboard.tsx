import React from 'react';
import { Order, DeliveryRoute, Driver, Depot, BrandTheme } from '../types';
import {
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Navigation,
  Sparkles,
  Layers,
  ArrowRight,
  Radio,
  Warehouse,
  CheckCircle
} from 'lucide-react';

interface Props {
  orders: Order[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  depots: Depot[];
  selectedDepotId: string;
  brandTheme: BrandTheme;
  onSelectDepot: (depotId: string) => void;
  onNavigateToTab: (tab: 'orders' | 'routes' | 'map' | 'sku_dwell' | 'pods' | 'branding') => void;
  onSelectRoute: (routeId: string) => void;
  onAutoBatchDepot: () => void;
}

export const MorningDashboard: React.FC<Props> = ({
  orders,
  routes,
  drivers,
  depots,
  selectedDepotId,
  brandTheme,
  onSelectDepot,
  onNavigateToTab,
  onSelectRoute,
  onAutoBatchDepot,
}) => {
  // Filter by selected depot
  const activeOrders = selectedDepotId === 'depot-all'
    ? orders
    : orders.filter((o) => o.depotId === selectedDepotId);

  const activeRoutes = selectedDepotId === 'depot-all'
    ? routes
    : routes.filter((r) => r.depotId === selectedDepotId);

  const activeDrivers = selectedDepotId === 'depot-all'
    ? drivers
    : drivers.filter((d) => d.depotId === selectedDepotId);

  // Status Metrics
  const pendingOrders = activeOrders.filter((o) => o.status === 'PENDING');
  const assignedOrders = activeOrders.filter((o) => o.status === 'ROUTED');
  const inTransitOrders = activeOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const deliveredOrders = activeOrders.filter((o) => o.status === 'DELIVERED');

  const problemRoutes = activeRoutes.filter((r) => r.isProblemRoute || r.totalEstimatedMins > 480);

  const totalDwellAllPending = pendingOrders.reduce((acc, curr) => acc + (curr.manualDwellOverrideMins || curr.totalDwellMins || 15), 0);
  const selectedDepot = depots.find((d) => d.id === selectedDepotId) || depots[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP MORNING BRIEFING & DEPOT FILTER BAR */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="p-3 rounded-2xl text-white shadow-md flex items-center justify-center"
            style={{ backgroundColor: brandTheme.primaryColour }}
          >
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Morning Fleet Dispatch Overview
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Sync
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {selectedDepot.name}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedDepot.address} • {selectedDepot.activeVansCount} Fleet Vehicles Stationed
            </p>
          </div>
        </div>

        {/* Depot Selector Dropdown */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-600 self-center hidden sm:inline">
            Filter Depot Hub:
          </label>
          <select
            value={selectedDepotId}
            onChange={(e) => onSelectDepot(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-slate-50 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {depots.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name} ({d.activeVansCount} Vans)
              </option>
            ))}
          </select>

          <button
            onClick={onAutoBatchDepot}
            disabled={pendingOrders.length === 0}
            className="px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: brandTheme.secondaryColour }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Auto-Batch {pendingOrders.length} Unassigned
          </button>
        </div>
      </div>

      {/* 2. THE LIVE 5-METRICS MORNING STATUS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Pending / Unassigned */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition cursor-pointer border-l-4 border-l-amber-500 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
            <span>Unassigned Bucket</span>
            <Package className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingOrders.length}</div>
          <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
            {totalDwellAllPending}m total dwell unrouted
          </span>
        </div>

        {/* 2. Assigned to Manifests */}
        <div
          onClick={() => onNavigateToTab('routes')}
          className="bg-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs hover:shadow-md transition cursor-pointer border-l-4 border-l-indigo-600 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-1">
            <span>Assigned to Routes</span>
            <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{assignedOrders.length}</div>
          <span className="text-[11px] text-indigo-700 font-medium block mt-0.5">
            Loaded on {activeRoutes.length} route manifests
          </span>
        </div>

        {/* 3. Out for Delivery / In Transit */}
        <div
          onClick={() => onNavigateToTab('map')}
          className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md transition cursor-pointer border-l-4 border-l-blue-600 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
            <span>In Transit / Out</span>
            <Truck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inTransitOrders.length}</div>
          <span className="text-[11px] text-blue-700 font-medium block mt-0.5">
            {activeDrivers.filter(d => d.status === 'ON_ROUTE' || d.status === 'DELIVERING').length} active vans on road
          </span>
        </div>

        {/* 4. Delivered & Confirmed */}
        <div
          onClick={() => onNavigateToTab('pods')}
          className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition cursor-pointer border-l-4 border-l-emerald-600 group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
            <span>Delivered (POD)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{deliveredOrders.length}</div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
            Verified with signatures & GPS
          </span>
        </div>

        {/* 5. Total Daily Volume */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs text-white col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Total Day Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black">{activeOrders.length} Orders</div>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            {Math.round((deliveredOrders.length / (activeOrders.length || 1)) * 100)}% daily completion
          </span>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: PROBLEM ROUTE WARNINGS & SUGGESTED ROUTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Suggested Routes & Feasible Manifests */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: brandTheme.secondaryColour }} />
                Suggested Routes & Manifest Feasibility
              </h3>
              <p className="text-xs text-slate-500">
                Calculated based on traffic drive time + SKU dwell times + 45m mandatory rest breaks.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('routes')}
              className="text-xs font-bold hover:underline flex items-center gap-1"
              style={{ color: brandTheme.secondaryColour }}
            >
              View All Routes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeRoutes.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700">No active routes for {selectedDepot.name}</p>
              <button
                onClick={onAutoBatchDepot}
                className="mt-3 px-4 py-2 text-white font-bold text-xs rounded-xl shadow"
                style={{ backgroundColor: brandTheme.secondaryColour }}
              >
                Auto-Generate Routes Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRoutes.map((route) => {
                const isProblem = route.isProblemRoute || route.totalEstimatedMins > 480;

                return (
                  <div
                    key={route.id}
                    onClick={() => onSelectRoute(route.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                      isProblem
                        ? 'bg-rose-50/70 border-rose-300 hover:bg-rose-100/70'
                        : 'bg-white hover:bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl text-white font-bold text-xs shrink-0 ${
                          isProblem ? 'bg-rose-600' : 'bg-slate-800'
                        }`}
                      >
                        {isProblem ? <AlertTriangle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900">
                            {route.routeNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isProblem
                                ? 'bg-rose-200 text-rose-900 font-bold'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isProblem ? '⚠️ Problem Route' : '✓ Shift Feasible'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          {route.orders.length} delivery stops • {route.totalDistanceKm} km roundtrip
                        </p>

                        {isProblem && route.problemReason && (
                          <p className="text-[11px] text-rose-700 font-bold mt-1 bg-white/70 p-1.5 rounded border border-rose-200">
                            🚨 Alert: {route.problemReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Breakdown pill */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">TOTAL SHIFT</span>
                        <span className={`font-black text-sm ${isProblem ? 'text-rose-700' : 'text-slate-900'}`}>
                          {Math.floor(route.totalEstimatedMins / 60)}h {route.totalEstimatedMins % 60}m
                        </span>
                      </div>

                      <div className="text-right pl-3 border-l border-gray-200">
                        <span className="text-[10px] text-slate-400 block font-bold">DRIVER</span>
                        <span className="font-bold text-slate-800">
                          {route.driver ? route.driver.name.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Morning Problem Route Warning Center & Fleet Status */}
        <div className="space-y-4">
          {/* PROBLEM ROUTE ALERT BOX */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h4 className="font-black text-slate-900 text-sm">Problem Route Watchdog</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                {problemRoutes.length} Alerts
              </span>
            </div>

            {problemRoutes.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All suggested routes fit within 8.0h working shifts with legal driver rest breaks.</span>
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                {problemRoutes.map((pRoute) => (
                  <div key={pRoute.id} className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-rose-900">
                      <span>{pRoute.routeNumber}</span>
                      <span>{Math.floor(pRoute.totalEstimatedMins / 60)}h {pRoute.totalEstimatedMins % 60}m</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-tight">
                      {pRoute.problemReason || 'Route exceeds 8-hour legal shift limit.'}
                    </p>
                    <button
                      onClick={() => onNavigateToTab('orders')}
                      className="mt-1 text-[10px] font-black text-rose-800 underline block"
                    >
                      Split or Rebalance Orders →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE DRIVER GPS SATELLITE STATUS */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h4 className="font-black text-slate-900 text-sm">Depot Fleet Telematics</h4>
              </div>
              <span className="text-xs text-slate-400 font-bold">{activeDrivers.length} Vans</span>
            </div>

            <div className="space-y-2 mt-3">
              {activeDrivers.map((drv) => (
                <div
                  key={drv.id}
                  onClick={() => onNavigateToTab('map')}
                  className="p-2.5 rounded-xl border border-gray-100 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {drv.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{drv.name}</span>
                      <span className="text-[10px] text-slate-400">{drv.vehicleReg} • {drv.phone}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    drv.status === 'ON_ROUTE' || drv.status === 'DELIVERING'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {drv.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('map')}
              className="w-full mt-3 py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              Open Live Fleet GPS Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
