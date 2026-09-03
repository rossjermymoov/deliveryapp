import React, { useState } from 'react';
import { Driver, VanVehicle, VehicleFaultReport, VanFaultSeverity } from '../types';
import {
  Camera,
  Check,
  Truck,
  ShieldAlert,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  vans: VanVehicle[];
  activeVanRegistration?: string;
  onSubmitFault: (fault: VehicleFaultReport) => void;
}

export const ReportFaultModal: React.FC<Props> = ({
  isOpen,
  onClose,
  driver,
  vans,
  activeVanRegistration,
  onSubmitFault,
}) => {
  const depotVans = vans.filter((v) => v.depotId === driver.depotId);
  const defaultVan = depotVans.find((v) => v.registration === activeVanRegistration) || depotVans[0];

  const [selectedVanId, setSelectedVanId] = useState<string>(defaultVan?.id || '');
  const [category, setCategory] = useState<VehicleFaultReport['category']>('TYRES');
  const [severity, setSeverity] = useState<VanFaultSeverity>('MEDIUM');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const currentVan = vans.find((v) => v.id === selectedVanId) || defaultVan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !currentVan) return;

    setIsSubmitting(true);

    const report: VehicleFaultReport = {
      id: `flt-${Date.now()}`,
      vanId: currentVan.id,
      vanRegistration: currentVan.registration,
      reportedByDriverId: driver.id,
      reportedByDriverName: driver.name,
      depotId: driver.depotId,
      timestamp: 'Just now',
      category,
      severity,
      description: description.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      status: severity === 'CRITICAL_GROUND_VEHICLE' ? 'GROUNDED' : 'OPEN',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessNotice(true);
      onSubmitFault(report);

      setTimeout(() => {
        setSuccessNotice(false);
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black">Report Van Defect / Safety Fault</h2>
              <p className="text-xs text-rose-200">
                Instantly notifies Head Office Workshop & Depot Fleet Controllers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        {successNotice ? (
          <div className="p-10 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-900">Fault Dispatched to Head Office!</h3>
            <p className="text-xs text-slate-500">
              Workshop Fleet Support and Depot Controllers have received this defect report for <strong>{currentVan?.registration}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Van Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" /> Select Vehicle
              </label>
              <select
                value={selectedVanId}
                onChange={(e) => setSelectedVanId(e.target.value)}
                className="w-full text-xs font-black p-2.5 border rounded-xl bg-slate-50"
              >
                {depotVans.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} • {v.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Defect Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 border rounded-xl bg-slate-50"
                >
                  <option value="TYRES">Tyres / Tread / Puncture</option>
                  <option value="BRAKES">Brakes / Stopping Noise</option>
                  <option value="ENGINE_LIGHT">Dashboard Warning Light</option>
                  <option value="LIGHTS_ELECTRICS">Headlights / Indicators</option>
                  <option value="CARGO_DOORS">Rear Cargo Door / Lock</option>
                  <option value="STEERING_SUSPENSION">Steering / Suspension</option>
                  <option value="BODYWORK_DAMAGE">Bodywork / Mirror Damage</option>
                  <option value="OTHER">Other Component</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Safety Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className={`w-full text-xs font-black p-2.5 border rounded-xl ${
                    severity === 'CRITICAL_GROUND_VEHICLE'
                      ? 'bg-rose-50 text-rose-900 border-rose-400'
                      : severity === 'HIGH'
                      ? 'bg-amber-50 text-amber-900 border-amber-400'
                      : 'bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="LOW">Minor (Monitor at service)</option>
                  <option value="MEDIUM">Medium (Requires inspection)</option>
                  <option value="HIGH">High (Repair before next route)</option>
                  <option value="CRITICAL_GROUND_VEHICLE">⛔ CRITICAL - Ground Vehicle</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Fault Description & Symptoms
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what happened, any dashboard warnings, strange noises, or damage location..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 border rounded-xl bg-slate-50 font-medium"
              />
            </div>

            {/* Mock Photo Attachment */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600 font-bold">Attach Defect Photo</span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80')}
                className="px-3 py-1 bg-white text-slate-800 text-[10px] font-black rounded-lg border shadow-2xs hover:bg-slate-100"
              >
                {photoUrl ? '✓ Photo Attached' : 'Capture / Upload 📸'}
              </button>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Transmitting to Head Office...' : 'Send Immediate Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
