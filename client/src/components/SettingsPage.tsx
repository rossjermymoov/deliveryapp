import React, { useState } from 'react';
import { SkuDwellSetting, ShiftParameters, BrandTheme, Depot, UserAccount, Driver, VanVehicle } from '../types';
import { PRESET_THEMES } from '../data/initialData';
import {
  Sliders,
  Palette,
  Clock,
  Coffee,
  Car,
  Plus,
  Trash2,
  Check,
  Compass,
  Truck,
  Users,
  ShieldCheck,
  ArrowRightLeft,
  Warehouse,
  Barcode
} from 'lucide-react';

interface Props {
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
  drivers: Driver[];
  onUpdateDrivers: (drivers: Driver[]) => void;
  vans: VanVehicle[];
  onUpdateVans: (vans: VanVehicle[]) => void;
  currentUser: UserAccount;
}

export const SettingsPage: React.FC<Props> = ({
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
  drivers,
  onUpdateDrivers,
  vans,
  onUpdateVans,
  currentUser,
}) => {
  const isHeadOffice = currentUser.role === 'HEAD_OFFICE_ADMIN';
  const assignedDepotId = currentUser.assignedDepotId || depots[0]?.id || 'depot-bhm';
  const currentDepot = depots.find((d) => d.id === assignedDepotId) || depots[0];

  // If Head Office: default to 'staff'; If Depot Controller: default to 'my_drivers'
  const [activeTab, setActiveTab] = useState<'staff' | 'all_drivers' | 'my_drivers' | 'all_vans' | 'my_vans' | 'depots' | 'my_depot' | 'dwell' | 'shift' | 'branding'>(
    isHeadOffice ? 'staff' : 'my_drivers'
  );

  const [newSku, setNewSku] = useState({ sku: '', name: '', defaultDwellMins: 15 });
  const [localDepots, setLocalDepots] = useState<Depot[]>(depots);
  const [saveBanner, setSaveBanner] = useState('');

  // New Staff User Form State (Admin Only)
  const [newUser, setNewUser] = useState<Partial<UserAccount>>({
    name: '',
    email: '',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: depots[0]?.id || 'depot-bhm',
  });

  // New Driver Form State (Decoupled from van)
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: '',
    phone: '',
    depotId: isHeadOffice ? (depots[0]?.id || 'depot-bhm') : assignedDepotId,
  });

  // New Van Form State
  const [newVan, setNewVan] = useState<Partial<VanVehicle>>({
    registration: '',
    model: 'Mercedes Sprinter 3.5t Long-Wheelbase',
    barcode: '',
    depotId: isHeadOffice ? (depots[0]?.id || 'depot-bhm') : assignedDepotId,
    maxPayloadKg: 1350,
  });

  // Filtered lists for Depot Controller
  const visibleDrivers = isHeadOffice
    ? drivers
    : drivers.filter((d) => d.depotId === assignedDepotId);

  const visibleVans = isHeadOffice
    ? vans
    : vans.filter((v) => v.depotId === assignedDepotId);

  // Transfer Staff Member between Depots (Head Office Admin Only)
  const handleTransferStaff = (userId: string, targetDepotId: string) => {
    if (!isHeadOffice) return;
    const updated = users.map((u) => (u.id === userId ? { ...u, assignedDepotId: targetDepotId } : u));
    onUpdateUsers(updated);
    const targetDepot = depots.find((d) => d.id === targetDepotId);
    setSaveBanner(`✓ Transferred staff member to ${targetDepot?.name || targetDepotId}`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Transfer Driver between Depots (Head Office Admin Only)
  const handleTransferDriver = (driverId: string, targetDepotId: string) => {
    if (!isHeadOffice) return;
    const targetDepot = depots.find((d) => d.id === targetDepotId);
    const updated = drivers.map((d) =>
      d.id === driverId
        ? {
            ...d,
            depotId: targetDepotId,
            currentLat: targetDepot ? targetDepot.lat : d.currentLat,
            currentLng: targetDepot ? targetDepot.lng : d.currentLng,
          }
        : d
    );
    onUpdateDrivers(updated);
    setSaveBanner(`✓ Transferred driver to ${targetDepot?.name || targetDepotId}`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Transfer Van Vehicle between Depots (Head Office Admin Only)
  const handleTransferVan = (vanId: string, targetDepotId: string) => {
    if (!isHeadOffice) return;
    const targetDepot = depots.find((d) => d.id === targetDepotId);
    const updated = vans.map((v) => (v.id === vanId ? { ...v, depotId: targetDepotId } : v));
    onUpdateVans(updated);
    setSaveBanner(`✓ Transferred vehicle to ${targetDepot?.name || targetDepotId}`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Add Staff User Handler (Admin Only)
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHeadOffice || !newUser.name || !newUser.email) return;

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
    setSaveBanner(`✓ Created staff account for "${createdUser.name}"!`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Add Driver Handler (Decoupled from Van)
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name) return;

    const targetDepotId = isHeadOffice ? (newDriver.depotId || 'depot-bhm') : assignedDepotId;
    const assignedDepot = depots.find((d) => d.id === targetDepotId) || currentDepot;

    const createdDriver: Driver = {
      id: `drv-${Date.now()}`,
      name: newDriver.name,
      phone: newDriver.phone || '07700 900000',
      depotId: targetDepotId,
      currentLat: assignedDepot.lat,
      currentLng: assignedDepot.lng,
      lastUpdated: 'Just now',
      status: 'IDLE',
    };

    onUpdateDrivers([...drivers, createdDriver]);
    setNewDriver({
      name: '',
      phone: '',
      depotId: isHeadOffice ? depots[0]?.id : assignedDepotId,
    });
    setSaveBanner(`✓ Registered driver "${createdDriver.name}" at ${assignedDepot.name}!`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  // Add Van Vehicle Handler
  const handleAddVan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVan.registration) return;

    const reg = newVan.registration.toUpperCase();
    const targetDepotId = isHeadOffice ? (newVan.depotId || 'depot-bhm') : assignedDepotId;
    const assignedDepot = depots.find((d) => d.id === targetDepotId) || currentDepot;

    const createdVan: VanVehicle = {
      id: `van-${Date.now()}`,
      registration: reg,
      depotId: targetDepotId,
      model: newVan.model || 'Mercedes Sprinter 3.5t Long-Wheelbase',
      barcode: newVan.barcode?.toUpperCase() || `VAN-${reg.replace(/\s+/g, '')}`,
      status: 'AVAILABLE',
      maxPayloadKg: newVan.maxPayloadKg || 1350,
    };

    onUpdateVans([...vans, createdVan]);
    setNewVan({
      registration: '',
      model: 'Mercedes Sprinter 3.5t Long-Wheelbase',
      barcode: '',
      depotId: isHeadOffice ? depots[0]?.id : assignedDepotId,
      maxPayloadKg: 1350,
    });
    setSaveBanner(`✓ Registered vehicle "${createdVan.registration}" at ${assignedDepot.name}!`);
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (!isHeadOffice) return;
    if (confirm('Delete this staff account?')) {
      onUpdateUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm('Remove this driver record from the depot?')) {
      onUpdateDrivers(drivers.filter((d) => d.id !== driverId));
    }
  };

  const handleDeleteVan = (vanId: string) => {
    if (confirm('Remove this van from the fleet?')) {
      onUpdateVans(vans.filter((v) => v.id !== vanId));
    }
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHeadOffice || !newSku.sku) return;
    onUpdateSkuCatalog([...skuCatalog, { ...newSku, sku: newSku.sku.toUpperCase() }]);
    setNewSku({ sku: '', name: '', defaultDwellMins: 15 });
  };

  const handleDeleteSku = (skuToDelete: string) => {
    if (!isHeadOffice) return;
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

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Page Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-white text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {isHeadOffice ? 'Head Office Administration' : `${currentDepot.city} Depot Settings`}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              • {isHeadOffice ? 'Global Access & Fleet Management' : 'Local Depot Drivers & Van Fleet'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            {isHeadOffice ? 'Global Operations Settings' : `${currentDepot.name} Fleet Configuration`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isHeadOffice
              ? 'Head Office Administration • Manage staff transfers, decoupled driver rosters, physical van inventory, SKUs and branding.'
              : `Managing decoupled drivers and vehicle fleet pool for ${currentDepot.name}.`}
          </p>
        </div>
      </div>

      {saveBanner && (
        <div className="p-4 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-2xl border border-emerald-300 flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-200 p-1.5 gap-1.5 overflow-x-auto shadow-sm text-xs">
        
        {/* HEAD OFFICE ADMIN TABS */}
        {isHeadOffice ? (
          <>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Staff & Depot Transfers ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('all_drivers')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'all_drivers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              All Drivers ({drivers.length})
            </button>

            <button
              onClick={() => setActiveTab('all_vans')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'all_vans'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4 text-blue-400" />
              All UK Van Fleet ({vans.length})
            </button>

            <button
              onClick={() => setActiveTab('depots')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'depots'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-400" />
              All 22 UK Depots ({depots.length})
            </button>

            <button
              onClick={() => setActiveTab('dwell')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'dwell'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              Global SKU Dwell Rules ({skuCatalog.length})
            </button>

            <button
              onClick={() => setActiveTab('shift')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'shift'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 text-teal-400" />
              Shift & Traffic Buffers
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'branding'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-4 h-4 text-purple-400" />
              White-Label Branding
            </button>
          </>
        ) : (
          /* DEPOT CONTROLLER TABS */
          <>
            <button
              onClick={() => setActiveTab('my_drivers')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'my_drivers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              {currentDepot.city} Drivers ({visibleDrivers.length})
            </button>

            <button
              onClick={() => setActiveTab('my_vans')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'my_vans'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4 text-blue-400" />
              {currentDepot.city} Van Fleet ({visibleVans.length})
            </button>

            <button
              onClick={() => setActiveTab('my_depot')}
              className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 ${
                activeTab === 'my_depot'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-400" />
              {currentDepot.city} Depot Parameters
            </button>
          </>
        )}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        
        {/* PANEL 1: STAFF & DEPOT TRANSFERS (HEAD OFFICE ADMIN ONLY) */}
        {activeTab === 'staff' && isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Staff Accounts & Inter-Depot Transfers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Head Office Admin control to assign depot controllers or transfer staff between UK distribution hubs.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase border-b text-[11px]">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">System Role</th>
                    <th className="p-3.5">Current Depot Hub</th>
                    <th className="p-3.5 text-center">Transfer Depot</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((usr) => {
                    const isHeadOfficeUser = usr.role === 'HEAD_OFFICE_ADMIN';
                    const currentAssignedDepot = depots.find((d) => d.id === usr.assignedDepotId);

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                            {usr.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block">{usr.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono text-[11px]">{usr.email}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                              isHeadOfficeUser
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}
                          >
                            {isHeadOfficeUser && <ShieldCheck className="w-3 h-3" />}
                            {usr.role.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-slate-800">
                          {isHeadOfficeUser ? (
                            <span className="text-purple-700 font-black">All 22 UK Depots</span>
                          ) : (
                            <span className="text-slate-900 font-bold flex items-center gap-1.5">
                              <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                              {currentAssignedDepot?.name || usr.assignedDepotId}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {!isHeadOfficeUser && (
                            <div className="flex items-center justify-center gap-1.5">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                              <select
                                value={usr.assignedDepotId || ''}
                                onChange={(e) => handleTransferStaff(usr.id, e.target.value)}
                                className="text-xs font-bold p-1.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                {depots.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.code} - {d.city}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          {usr.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 font-bold text-xs"
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

            {/* Add New Staff Form */}
            <form
              onSubmit={handleAddUser}
              className="p-5 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Taylor"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
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
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                >
                  <option value="DEPOT_CONTROLLER">Depot Controller</option>
                  <option value="HEAD_OFFICE_ADMIN">Head Office Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign Depot</label>
                <select
                  disabled={newUser.role === 'HEAD_OFFICE_ADMIN'}
                  value={newUser.assignedDepotId}
                  onChange={(e) => setNewUser({ ...newUser, assignedDepotId: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white disabled:opacity-50"
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
                className="py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl shadow hover:bg-black flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Staff
              </button>
            </form>
          </div>
        )}

        {/* PANEL 2: DRIVER ROSTER (DECOUPLED FROM VEHICLES) */}
        {(activeTab === 'all_drivers' || activeTab === 'my_drivers') && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {isHeadOffice ? 'All UK Drivers' : `${currentDepot.city} Drivers`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Driver personnel roster. Drivers are decoupled from vehicles and can be assigned to any available van each morning.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase border-b text-[11px]">
                  <tr>
                    <th className="p-3.5">Driver Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Assigned Depot</th>
                    <th className="p-3.5">Status</th>
                    {isHeadOffice && <th className="p-3.5 text-center">Transfer Depot</th>}
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleDrivers.map((drv) => {
                    const assignedDepot = depots.find((d) => d.id === drv.depotId);

                    return (
                      <tr key={drv.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                            {drv.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block">{drv.name}</span>
                            <span className="text-[10px] text-slate-400">ID: {drv.id}</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-700 font-bold">{drv.phone}</td>

                        <td className="p-3.5 font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                            {assignedDepot?.name || drv.depotId}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                            {drv.status}
                          </span>
                        </td>

                        {isHeadOffice && (
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                              <select
                                value={drv.depotId}
                                onChange={(e) => handleTransferDriver(drv.id, e.target.value)}
                                className="text-xs font-bold p-1.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                {depots.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.code} - {d.city}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        )}

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteDriver(drv.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 font-bold text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Driver Form */}
            <form
              onSubmit={handleAddDriver}
              className="p-5 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Driver Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Foster"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="07700 900222"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>

              {isHeadOffice && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Initial Depot</label>
                  <select
                    value={newDriver.depotId}
                    onChange={(e) => setNewDriver({ ...newDriver, depotId: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Driver to Roster
              </button>
            </form>
          </div>
        )}

        {/* PANEL 3: VAN FLEET INVENTORY (DECOUPLED VEHICLES) */}
        {(activeTab === 'all_vans' || activeTab === 'my_vans') && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                {isHeadOffice ? 'All UK Van Fleet Inventory' : `${currentDepot.city} Van Fleet Pool`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical delivery vans and barcodes. If a van is undergoing maintenance or broken, drivers can seamlessly switch to any other van.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase border-b text-[11px]">
                  <tr>
                    <th className="p-3.5">Registration Plate</th>
                    <th className="p-3.5">Vehicle Model</th>
                    <th className="p-3.5">Barcode / Asset Tag</th>
                    <th className="p-3.5">Depot Station</th>
                    <th className="p-3.5">Status</th>
                    {isHeadOffice && <th className="p-3.5 text-center">Transfer Depot</th>}
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleVans.map((v) => {
                    const assignedDepot = depots.find((d) => d.id === v.depotId);

                    return (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-950 border border-amber-300">
                            {v.registration}
                          </span>
                        </td>

                        <td className="p-3.5 font-medium text-slate-800">{v.model}</td>

                        <td className="p-3.5 font-mono text-[11px] font-bold text-blue-700 flex items-center gap-1">
                          <Barcode className="w-4 h-4 text-slate-400" /> {v.barcode}
                        </td>

                        <td className="p-3.5 font-bold text-slate-900">
                          {assignedDepot?.name || v.depotId}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                            v.status === 'ON_ROUTE' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {v.status}
                          </span>
                        </td>

                        {isHeadOffice && (
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                              <select
                                value={v.depotId}
                                onChange={(e) => handleTransferVan(v.id, e.target.value)}
                                className="text-xs font-bold p-1.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                {depots.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.code} - {d.city}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        )}

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteVan(v.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 font-bold text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Van Form */}
            <form
              onSubmit={handleAddVan}
              className="p-5 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Registration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KL24 XYZ"
                  value={newVan.registration}
                  onChange={(e) => setNewVan({ ...newVan, registration: e.target.value })}
                  className="w-full text-xs font-black uppercase p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  placeholder="e.g. Mercedes Sprinter LWB"
                  value={newVan.model}
                  onChange={(e) => setNewVan({ ...newVan, model: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Barcode (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VAN-KL24XYZ"
                  value={newVan.barcode}
                  onChange={(e) => setNewVan({ ...newVan, barcode: e.target.value })}
                  className="w-full text-xs font-mono font-bold p-2.5 border rounded-xl bg-white uppercase"
                />
              </div>

              {isHeadOffice && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Depot</label>
                  <select
                    value={newVan.depotId}
                    onChange={(e) => setNewVan({ ...newVan, depotId: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Van to Fleet
              </button>
            </form>
          </div>
        )}

        {/* PANEL 4: ALL UK DEPOTS (HEAD OFFICE ADMIN ONLY) */}
        {activeTab === 'depots' && isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                All 22 UK Depots • Catchment & Van Capacities
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Head Office configuration for all distribution centres across the UK network.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase border-b text-[11px]">
                  <tr>
                    <th className="p-3.5">Depot Hub</th>
                    <th className="p-3.5">Center Postcode</th>
                    <th className="p-3.5 text-center">Catchment Radius</th>
                    <th className="p-3.5 text-center bg-blue-50/50 text-blue-900">Max Orders / Van</th>
                    <th className="p-3.5 text-center">Min Orders / Route</th>
                    <th className="p-3.5 text-right">Fleet Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {localDepots.map((depot) => (
                    <tr key={depot.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{depot.name}</span>
                        <span className="text-[10px] text-slate-400">{depot.region}</span>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={depot.postcode}
                          onChange={(e) => handleUpdatePostcode(depot.id, e.target.value)}
                          className="w-24 font-mono font-bold text-xs p-1.5 border rounded-xl bg-white uppercase text-center"
                        />
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={depot.maxDeliveryRadiusMiles}
                            onChange={(e) => handleUpdateRadius(depot.id, parseInt(e.target.value) || 10)}
                            className="w-20 h-1.5 bg-gray-200 rounded cursor-pointer"
                          />
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 border min-w-[55px] inline-block text-center">
                            {depot.maxDeliveryRadiusMiles} mi
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center bg-blue-50/30">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="2"
                            max="15"
                            value={depot.maxOrdersPerVan || 6}
                            onChange={(e) => handleUpdateMaxPerVan(depot.id, parseInt(e.target.value) || 6)}
                            className="w-16 font-black text-xs p-1.5 border-2 border-blue-500 rounded-xl bg-white text-center text-blue-900 shadow-2xs"
                          />
                          <span className="text-[10px] font-bold text-slate-500">drops/van</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={depot.minOrdersPerRoute || 3}
                            onChange={(e) => handleUpdateMinOrders(depot.id, parseInt(e.target.value) || 3)}
                            className="w-14 font-bold text-xs p-1.5 border rounded-xl bg-white text-center"
                          />
                          <span className="text-[10px] text-slate-400">min</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
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

        {/* PANEL 5: LOCAL DEPOT PARAMETERS (FOR DEPOT CONTROLLER) */}
        {activeTab === 'my_depot' && !isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                {currentDepot.name} • Local Operating Parameters
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust van capacity and local delivery radius for {currentDepot.city}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  Local Postcode Center
                </label>
                <input
                  type="text"
                  value={currentDepot.postcode}
                  onChange={(e) => handleUpdatePostcode(currentDepot.id, e.target.value)}
                  className="w-full font-mono font-bold text-sm p-2.5 border rounded-xl bg-white uppercase text-center"
                />
                <p className="text-[11px] text-slate-500">Center point for territory distance calculations.</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  Max Orders / Drops per Van
                </label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={currentDepot.maxOrdersPerVan || 6}
                  onChange={(e) => handleUpdateMaxPerVan(currentDepot.id, parseInt(e.target.value) || 6)}
                  className="w-full font-black text-sm p-2.5 border-2 border-blue-500 rounded-xl bg-white text-center text-blue-900"
                />
                <p className="text-[11px] text-slate-500">Physical vehicle capacity (default 5–6 drops).</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  Delivery Radius ({currentDepot.maxDeliveryRadiusMiles} miles)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={currentDepot.maxDeliveryRadiusMiles}
                  onChange={(e) => handleUpdateRadius(currentDepot.id, parseInt(e.target.value) || 10)}
                  className="w-full h-2 bg-gray-200 rounded cursor-pointer mt-2"
                />
                <p className="text-[11px] text-slate-500">Depot catchment boundary for customer order fulfillment.</p>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 6: SKU DWELL TIMES (HEAD OFFICE ADMIN ONLY) */}
        {activeTab === 'dwell' && isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                Global SKU Handling & Dwell Times (Admin Control)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centrally configured product offload durations applied to route feasibility algorithms across all depots.
              </p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black uppercase border-b text-[11px]">
                  <tr>
                    <th className="p-3.5">SKU Code</th>
                    <th className="p-3.5">Product Description</th>
                    <th className="p-3.5 text-center">Standard Dwell Duration</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skuCatalog.map((item) => (
                    <tr key={item.sku} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-black text-blue-700 text-xs">{item.sku}</td>
                      <td className="p-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3.5 text-center">
                        <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-full font-black border border-amber-200">
                          {item.defaultDwellMins} mins
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteSku(item.sku)}
                          className="text-rose-600 hover:text-rose-800 p-1 font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddSku} className="p-5 bg-slate-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">SKU</label>
                <input
                  type="text"
                  placeholder="e.g. GUT-6M-BRN"
                  value={newSku.sku}
                  onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Product Description</label>
                <input
                  type="text"
                  placeholder="e.g. 6m Deepflow Gutter"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 border rounded-xl bg-white"
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
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-white"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl shadow hover:bg-black flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add SKU Rule
              </button>
            </form>
          </div>
        )}

        {/* PANEL 7: SHIFT & TRAFFIC (HEAD OFFICE ADMIN ONLY) */}
        {activeTab === 'shift' && isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Driver Legal Shift Limits & Congestion Buffers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parameters enforced by the route optimizer to prevent driving hour breaches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" /> Max Driver Shift Length
                </label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  step="0.5"
                  value={shiftParams.shiftLengthHours}
                  onChange={(e) => onUpdateShiftParams({ ...shiftParams, shiftLengthHours: parseFloat(e.target.value) || 8 })}
                  className="w-full font-black text-base p-2.5 border rounded-xl bg-white"
                />
                <p className="text-[11px] text-slate-500">Routes exceeding this are flagged as problem shifts.</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" /> Mandatory Rest Break
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="15"
                  value={shiftParams.mandatoryBreakMins}
                  onChange={(e) => onUpdateShiftParams({ ...shiftParams, mandatoryBreakMins: parseInt(e.target.value) || 45 })}
                  className="w-full font-black text-base p-2.5 border rounded-xl bg-white"
                />
                <p className="text-[11px] text-slate-500">Statutory 45m break automatically factored into routes.</p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600" /> Traffic Congestion Buffer
                </label>
                <input
                  type="number"
                  min="1.0"
                  max="1.6"
                  step="0.05"
                  value={shiftParams.trafficBufferMultiplier}
                  onChange={(e) => onUpdateShiftParams({ ...shiftParams, trafficBufferMultiplier: parseFloat(e.target.value) || 1.2 })}
                  className="w-full font-black text-base p-2.5 border rounded-xl bg-white"
                />
                <p className="text-[11px] text-slate-500">Multiplier added to base drive times (e.g. 1.2x = +20%).</p>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 8: BRANDING (HEAD OFFICE ADMIN ONLY) */}
        {activeTab === 'branding' && isHeadOffice && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                White-Label Branding Presets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant 1-click styling presets for white-label enterprise resale.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(PRESET_THEMES).map(([key, preset]) => {
                const isActive = brandTheme.companyName === preset.companyName;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateBrandTheme(preset)}
                    className={`p-5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isActive ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <span className="font-black text-sm text-slate-900">{preset.companyName}</span>
                      <p className="text-xs text-slate-500 mt-1">{preset.tagline}</p>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
