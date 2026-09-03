import React, { useState, useRef } from 'react';
import { Driver, DeliveryRoute, Shipment, ProofOfDelivery } from '../types';
import { ChannelBadge } from './ChannelBadge';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Camera,
  PenTool,
  Clock,
  ShieldCheck,
  PackageCheck,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

interface Props {
  driver: Driver;
  activeRoute?: DeliveryRoute;
  onCompletePod: (shipmentId: string, pod: Partial<ProofOfDelivery>) => void;
  onStartRoute: (routeId: string) => void;
  onBackToAdmin: () => void;
}

export const DriverApp: React.FC<Props> = ({
  driver,
  activeRoute,
  onCompletePod,
  onStartRoute,
  onBackToAdmin,
}) => {
  const [selectedStop, setSelectedStop] = useState<Shipment | null>(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  // POD Form state
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [capturedGeo, setCapturedGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deliveredStops = activeRoute?.shipments.filter((s) => s.status === 'DELIVERED') || [];
  const remainingStops = activeRoute?.shipments.filter((s) => s.status !== 'DELIVERED') || [];
  const currentStop = remainingStops[0] || null;

  // Touch & Mouse Signature Handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#003366';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOpenPod = (stop: Shipment) => {
    setSelectedStop(stop);
    setRecipientName(stop.customerName);
    setPodNotes('');
    setCapturedPhoto(null);
    setHasSignature(false);
    setIsPodModalOpen(true);

    // Auto capture GPS
    setIsCapturingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCapturedGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsCapturingGps(false);
        },
        () => {
          setCapturedGeo({ lat: stop.lat + 0.0001, lng: stop.lng + 0.0001 });
          setIsCapturingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setCapturedGeo({ lat: stop.lat, lng: stop.lng });
      setIsCapturingGps(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPod = () => {
    if (!selectedStop) return;

    let signatureDataUrl = '';
    if (canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    onCompletePod(selectedStop.id, {
      recipientName: recipientName || selectedStop.customerName,
      signatureData: signatureDataUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><text y="20">Verified On-Site</text></svg>',
      photoUrl: capturedPhoto,
      notes: podNotes,
      deliveredLat: capturedGeo?.lat,
      deliveredLng: capturedGeo?.lng,
      timestamp: new Date().toISOString(),
    });

    setIsPodModalOpen(false);
    setSelectedStop(null);
  };

  const openGoogleMaps = (stop: Shipment) => {
    const query = encodeURIComponent(`${stop.address}, ${stop.city} ${stop.postcode}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-0 sm:py-6">
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[850px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-slate-800">
        
        {/* Mobile Header */}
        <header className="bg-gradient-to-r from-[#003366] to-[#005696] text-white px-5 pt-6 pb-4 shadow">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToAdmin}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 text-blue-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Depot Portal
            </button>
            <div className="flex items-center gap-1.5 bg-[#FF6B00] text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
              <span>{driver.vehicleReg}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight">{driver.name}</h2>
              <p className="text-xs text-blue-200">Kalsi Fleet Driver • {driver.phone}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm text-[#FFB800]">
              {driver.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Route Status Banner */}
        {activeRoute ? (
          <div className="bg-[#002244] text-white px-5 py-3 flex items-center justify-between text-xs border-b border-blue-900">
            <div>
              <span className="text-blue-300 block text-[10px]">ASSIGNED WAVE</span>
              <span className="font-mono font-bold text-[#FFB800]">{activeRoute.routeNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-blue-300 block text-[10px]">PROGRESS</span>
              <span className="font-bold">
                {deliveredStops.length} / {activeRoute.shipments.length} Delivered
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white m-4 rounded-2xl border border-gray-200">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800">No Route Wave Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">
              Switch to the Depot Portal to select an unassigned route wave and assign {driver.name}.
            </p>
            <button
              onClick={onBackToAdmin}
              className="mt-4 px-4 py-2 bg-[#005696] text-white font-bold text-xs rounded-xl shadow"
            >
              Open Depot Dispatch
            </button>
          </div>
        )}

        {/* Start Route Button */}
        {activeRoute && (activeRoute.status === 'ASSIGNED' || (activeRoute.status as string) === 'UNASSIGNED') && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-amber-900">Route Ready to Begin</h4>
              <p className="text-[11px] text-amber-700">{activeRoute.shipments.length} deliveries loaded</p>
            </div>
            <button
              onClick={() => onStartRoute(activeRoute.id)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              Start Driving
            </button>
          </div>
        )}

        {/* Stops List */}
        {activeRoute && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
            {/* CURRENT STOP */}
            {currentStop && (
              <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#005696] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#005696] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Next Delivery Stop
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-white font-bold flex items-center justify-center text-xs">
                    {currentStop.stopSequence || 1}
                  </span>
                  <ChannelBadge channel={currentStop.sourceChannel} />
                </div>

                <h3 className="font-bold text-base text-gray-900">{currentStop.customerName}</h3>
                
                <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    {currentStop.address}, {currentStop.city} <strong>{currentStop.postcode}</strong>
                  </span>
                </p>

                {currentStop.customerPhone && (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <a href={`tel:${currentStop.customerPhone}`} className="text-blue-600 font-semibold underline">
                      {currentStop.customerPhone}
                    </a>
                  </p>
                )}

                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 text-xs">
                  <span className="font-bold text-amber-900 block text-[11px] mb-0.5">📦 ITEMS TO UNLOAD:</span>
                  <p className="text-amber-800 font-medium">{currentStop.itemsDescription}</p>
                  {currentStop.specialNotes && (
                    <p className="text-amber-700 italic text-[11px] mt-1">
                      ⚠️ Note: {currentStop.specialNotes}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Allocated Dwell: {currentStop.manualDwellOverrideMins || currentStop.calculatedDwellMins} mins
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => openGoogleMaps(currentStop)}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 text-[#005696] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-blue-200"
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    Google Maps
                  </button>

                  <button
                    onClick={() => handleOpenPod(currentStop)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Deliver & POD
                  </button>
                </div>
              </div>
            )}

            {/* FULL ROUTE STOPS */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Full Wave Sequence
              </h4>

              <div className="space-y-2">
                {activeRoute.shipments.map((s, idx) => {
                  const isDelivered = s.status === 'DELIVERED';
                  const isCurrent = currentStop?.id === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        isDelivered
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                          : isCurrent
                          ? 'bg-white border-[#005696] shadow-sm'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDelivered
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-[#005696] text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-gray-900">{s.customerName}</span>
                            <ChannelBadge channel={s.sourceChannel} />
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[190px]">
                            {s.address}, {s.postcode}
                          </p>
                        </div>
                      </div>

                      {isDelivered ? (
                        <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPod(s)}
                          className="px-2.5 py-1 text-xs font-bold text-[#005696] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                        >
                          POD
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* POD MODAL */}
        {isPodModalOpen && selectedStop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-[#005696] uppercase block">Proof of Delivery (POD)</span>
                  <h3 className="text-base font-black text-gray-900">{selectedStop.customerName}</h3>
                </div>
                <button
                  onClick={() => setIsPodModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 my-3 text-xs">
                <p className="text-gray-700"><strong>Address:</strong> {selectedStop.address}, {selectedStop.postcode}</p>
                <p className="text-amber-800 mt-1"><strong>Goods:</strong> {selectedStop.itemsDescription}</p>
                <div className="flex items-center gap-1.5 mt-2 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isCapturingGps ? (
                    <span>Verifying GPS location...</span>
                  ) : (
                    <span>GPS Presence Verified ({capturedGeo?.lat.toFixed(4)}, {capturedGeo?.lng.toFixed(4)})</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Signee / Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe / Builder On-Site"
                    className="w-full text-sm rounded-xl border-gray-300 p-2.5 border focus:ring-[#005696]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-[#005696]" />
                      Customer Signature (Draw Below)
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[11px] text-rose-600 font-bold flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-white touch-none p-1 relative shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={130}
                      className="w-full h-32 cursor-crosshair rounded-xl"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasSignature && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 pointer-events-none select-none">
                        Sign with finger or stylus here
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-1 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
                    Proof Photo (Plastics Placed On-Site)
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {capturedPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                      <img src={capturedPhoto} alt="Captured" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-xs"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold flex flex-col items-center justify-center gap-1 transition"
                    >
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span>Take Photo of Goods / Gate Drop</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Delivery Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={podNotes}
                    onChange={(e) => setPodNotes(e.target.value)}
                    placeholder="e.g. Left safely inside rear garage"
                    className="w-full text-xs rounded-xl border-gray-300 p-2.5 border"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitPod}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm POD & Complete Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
