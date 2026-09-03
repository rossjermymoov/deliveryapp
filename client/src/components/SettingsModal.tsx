import React, { useState } from 'react';
import { SkuDwellSetting, ShiftParameters, BrandTheme, Depot, UserAccount } from '../types';
import { PRESET_THEMES } from '../data/initialData';
import {
  Settings,
  Sliders,
  Palette,
  Clock,
  Coffee,
  Car,
  Plus,
  Trash2,
  Check,
  Save,
  Compass,
  Truck,
  Users,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  brandTheme: BrandTheme;
  onUpdateBrandTheme: (theme: BrandTheme) => void;
  skuCatalog: SkuDwellSetting[];
  onUpdateSkuCatalog: (catalog: SkuDwellSetting[]) => void;
  depots: Depot[];
  onUpdateDepots: (depots: Depot[]) => void;
  shiftParams: ShiftParameters;
  onUpdateShiftParams: (params: ShiftParameters) => void;
  users: UserAccount[];
  onUpdateUsers: (users: UserAccount[]) => void;
  currentUser: UserAccount;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  brandTheme,
  onUpdateBrandTheme,
  skuCatalog,
  onUpdateSkuCatalog,
  depots,
  onUpdateDepots,
  shiftParams,
  onUpdateShiftParams,
  users,
  onUpdateUsers,
  currentUser,
}) => {
  const isHeadOffice = currentUser.role === 'HEAD_OFFICE_ADMIN';
  const [activeTab, setActiveTab] = useState<'users' | 'depots' | 'dwell' | 'shift' | 'branding'>(
    isHeadOffice ? 'users' : 'dwell'
  );

  const [newSku, setNewSku] = useState({ sku: '', name: '', defaultDwellMins: 15 });
  const [localDepots, setLocalDepots] = useState<Depot[]>(depots);
  const [saveBanner, setSaveBanner] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState<Partial<UserAccount>>({
    name: '',
    email: '',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: depots[0]?.id || 'depot-lon-s',
  });

  if (!isOpen) return null;

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.sku) return;
    onUpdateSkuCatalog([...skuCatalog, { ...newSku, sku: newSku.sku.toUpperCase() }]);
    setNewSku({ sku: '', name: '', defaultDwellMins: 15 });
  };

  const handleDeleteSku = (skuToDelete: string) => {
    onUpdateSkuCatalog(skuCatalog.filter((s) => s.sku !== skuToDelete));
  };

  const handleUpdateRadius = (depotId: string, radiusMiles: number) => {
    const updated = localDepots.map((d) => (d.id === depotId ? { ...d, maxDeliveryRadiusMiles: radiusMiles } : d));
    setLocalDepots(updated);
    onUpdateDepots(updated);
  };

  const handleUpdateMaxPerVan = (depotId: string, maxOrders: number) => {
    const updated = localDepots.map((d) => (d.id === depotId ? {
      ...d,
      maxOrdersPerVan: maxOrders,
      maxDailyCapacityOrders: maxOrders * d.activeVansCount
    } : d));
    setLocalDepots(updated);
    onUpdateDepots(updated);
  };

  const handleUpdateMinOrders = (depotId: string, minOrders: number) => {
    const updated = localDepots.map((d) => (d.id === depotId ? { ...d, minOrdersPerRoute: minOrders } : d));
    setLocalDepots(updated);
    onUpdateDepots(updated);
  };

  const handleUpdatePostcode = (depotId: string, pc: string) => {
    const updated = localDepots.map((d) => (d.id === depotId ? { ...d, postcode: pc.toUpperCase() } : d));
    setLocalDepots(updated);
    onUpdateDepots(updated);
  };

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const createdUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role || 'DEPOT_CONTROLLER',
      assignedDepotId: newUser.role === 'DEPOT_CONTROLLER' ? newUser.assignedDepotId : undefined,
    };

    onUpdateUsers([...users, createdUser]);
    setNewUser({
      name: '',
      email: '',
      role: 'DEPOT_CONTROLLER',
      assignedDepotId: depots[0]?.id,
    });
    setSaveBanner(`✓ Created user "${createdUser.name}" successfully!`);
    setTimeout(() => setSaveBanner(''), 2500);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Delete this user account?')) {
      onUpdateUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleSaveAll = () => {
    setSaveBanner('✓ Settings saved successfully!');
    setTimeout(() => {
      setSaveBanner('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">System & Access Settings</h2>
              <p className="text-xs text-slate-400">
                {isHeadOffice ? 'Head Office Master Administration & Depot Permissions' : `Depot Settings • ${currentUser.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 border-b border-gray-200 px-5 pt-3 gap-2 overflow-x-auto text-xs">
          {/* USER ROLES TAB (HEAD OFFICE ADMIN ONLY) */}
          {isHeadOffice && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              User Access & Depot Roles ({users.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('depots')}
            className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'depots' ? 'bg-white text-slate-900 shadow-xs border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            Van Capacities & Depot Radius ({depots.length})
          </button>

          <button
            onClick={() => setActiveTab('dwell')}
            className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'dwell' ? 'bg-white text-slate-900 shadow-xs border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            SKU Dwell Times ({skuCatalog.length})
          </button>

          <button
            onClick={() => setActiveTab('shift')}
            className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'shift' ? 'bg-white text-slate-900 shadow-xs border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Driver Shift & Traffic
          </button>

          {isHeadOffice && (
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-t-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'branding' ? 'bg-white text-slate-900 shadow-xs border-t-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-500" />
              White-Label & Branding
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveBanner && (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 animate-fadeIn">
              {saveBanner}
            </div>
          )}

          {/* TAB 0: USER ACCESS & DEPOT ROLES */}
          {activeTab === 'users' && isHeadOffice && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  User Accounts & Depot Access Control
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controllers assigned to a depot (e.g. London South) are strictly isolated and cannot see or access orders/routes from other depots.
                </p>
              </div>

              {/* Users Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Assigned Depot Boundary</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((usr) => {
                      const assignedDepot = depots.find((d) => d.id === usr.assignedDepotId);
                      const isHeadOfficeUser = usr.role === 'HEAD_OFFICE_ADMIN';

                      return (
                        <tr key={usr.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-[10px]">
                              {usr.name.charAt(0)}
                            </div>
                            {usr.name}
                          </td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">{usr.email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                isHeadOfficeUser
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : usr.role === 'DEPOT_CONTROLLER'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              {isHeadOfficeUser ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {usr.role.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            {isHeadOfficeUser ? (
                              <span className="text-purple-700 font-black">All 22 UK Depots (Unrestricted)</span>
                            ) : (
                              <span className="text-slate-900 font-bold">
                                🔒 Locked to: {assignedDepot?.name || usr.assignedDepotId}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {usr.id !== currentUser.id && (
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add New User Form */}
              <form
                onSubmit={handleAddUser}
                className="p-4 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Taylor"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full text-xs font-bold p-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="j.taylor@kalsi.co.uk"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full text-xs font-bold p-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">System Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full text-xs font-bold p-2 border rounded-xl bg-white"
                  >
                    <option value="DEPOT_CONTROLLER">Depot Controller (Locked)</option>
                    <option value="HEAD_OFFICE_ADMIN">Head Office Master Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign Depot Boundary</label>
                  <select
                    disabled={newUser.role === 'HEAD_OFFICE_ADMIN'}
                    value={newUser.assignedDepotId}
                    onChange={(e) => setNewUser({ ...newUser, assignedDepotId: e.target.value })}
                    className="w-full text-xs font-bold p-2 border rounded-xl bg-white disabled:opacity-50"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl shadow hover:bg-black flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </form>
            </div>
          )}

          {/* TAB 1: DEPOTS, EDITABLE MAX VAN CAPACITIES & RADIUS */}
          {activeTab === 'depots' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Depot Catchment, Max Van Capacity & Min Thresholds
                </h3>
                <p className="text-xs text-slate-500">
                  Configure maximum order drops per vehicle and minimum order threshold required before a van rolls out.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b">
                    <tr>
                      <th className="p-3">Depot Hub</th>
                      <th className="p-3">Center Postcode</th>
                      <th className="p-3 text-center">Catchment Radius</th>
                      <th className="p-3 text-center bg-blue-50/50 text-blue-900">Max Orders / Van</th>
                      <th className="p-3 text-center">Min Orders / Route</th>
                      <th className="p-3 text-right">Fleet Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {localDepots.map((depot) => (
                      <tr key={depot.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{depot.name}</span>
                          <span className="text-[10px] text-slate-400">{depot.region}</span>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={depot.postcode}
                            onChange={(e) => handleUpdatePostcode(depot.id, e.target.value)}
                            className="w-20 font-mono font-bold text-xs p-1 border rounded bg-white uppercase text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={depot.maxDeliveryRadiusMiles}
                              onChange={(e) => handleUpdateRadius(depot.id, parseInt(e.target.value) || 10)}
                              className="w-16 h-1.5 bg-gray-200 rounded cursor-pointer"
                            />
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 border min-w-[50px] inline-block text-center">
                              {depot.maxDeliveryRadiusMiles} mi
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-center bg-blue-50/30">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="2"
                              max="15"
                              value={depot.maxOrdersPerVan || 6}
                              onChange={(e) => handleUpdateMaxPerVan(depot.id, parseInt(e.target.value) || 6)}
                              className="w-14 font-black text-xs p-1.5 border-2 border-blue-500 rounded-lg bg-white text-center text-blue-900 shadow-2xs"
                            />
                            <span className="text-[10px] font-bold text-slate-500">drops/van</span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={depot.minOrdersPerRoute || 3}
                              onChange={(e) => handleUpdateMinOrders(depot.id, parseInt(e.target.value) || 3)}
                              className="w-14 font-bold text-xs p-1 border rounded bg-white text-center"
                            />
                            <span className="text-[10px] text-slate-400">min</span>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <span className="font-black text-slate-900 block text-xs">
                            {(depot.maxOrdersPerVan || 6) * depot.activeVansCount} total
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {depot.activeVansCount} vans @ {depot.maxOrdersPerVan || 6}/van
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SKU DWELL TIMES */}
          {activeTab === 'dwell' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Per-Product Dwell Time Rules</h3>
                <p className="text-xs text-slate-500">Each SKU automatically adds its allotted dwell duration at offload stops.</p>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b">
                    <tr>
                      <th className="p-3">SKU Code</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Dwell (Mins)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {skuCatalog.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{item.sku}</td>
                        <td className="p-3 font-medium text-slate-800">{item.name}</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded font-bold border border-amber-200">
                            {item.defaultDwellMins} mins
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSku(item.sku)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleAddSku} className="p-4 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. GUT-6M-BRN"
                    value={newSku.sku}
                    onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
                    className="w-full text-xs font-bold p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Product Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 6m Deepflow Gutter"
                    value={newSku.name}
                    onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                    className="w-full text-xs font-semibold p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dwell (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newSku.defaultDwellMins}
                    onChange={(e) => setNewSku({ ...newSku, defaultDwellMins: parseInt(e.target.value) || 15 })}
                    className="w-full text-xs font-bold p-2 border rounded-lg bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-black flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add SKU
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SHIFT & TRAFFIC */}
          {activeTab === 'shift' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Shift Limits & Traffic Multipliers</h3>
                <p className="text-xs text-slate-500">Parameters used by the optimization engine to calculate feasibility.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Max Driver Shift Length
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    step="0.5"
                    value={shiftParams.shiftLengthHours}
                    onChange={(e) => onUpdateShiftParams({ ...shiftParams, shiftLengthHours: parseFloat(e.target.value) || 8 })}
                    className="w-full font-black text-sm p-2 border rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Routes exceeding this are flagged as problem shifts.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-600" /> Mandatory Rest Break
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="15"
                    value={shiftParams.mandatoryBreakMins}
                    onChange={(e) => onUpdateShiftParams({ ...shiftParams, mandatoryBreakMins: parseInt(e.target.value) || 45 })}
                    className="w-full font-black text-sm p-2 border rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Automatically factored into legal route feasibility.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-600" /> Traffic Congestion Buffer
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="1.6"
                    step="0.05"
                    value={shiftParams.trafficBufferMultiplier}
                    onChange={(e) => onUpdateShiftParams({ ...shiftParams, trafficBufferMultiplier: parseFloat(e.target.value) || 1.2 })}
                    className="w-full font-black text-sm p-2 border rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Multiplier added to standard Google Maps drive times.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRANDING */}
          {activeTab === 'branding' && isHeadOffice && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">White-Label Branding Presets</h3>
                <p className="text-xs text-slate-500">1-click switch between Kalsi Plastics or generic OEM theme.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PRESET_THEMES).map(([key, preset]) => {
                  const isActive = brandTheme.companyName === preset.companyName;
                  return (
                    <button
                      key={key}
                      onClick={() => onUpdateBrandTheme(preset)}
                      className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                        isActive ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-slate-50 border-gray-200'
                      }`}
                    >
                      <div>
                        <span className="font-black text-xs text-slate-900">{preset.companyName}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{preset.tagline}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-black rounded-xl shadow flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
