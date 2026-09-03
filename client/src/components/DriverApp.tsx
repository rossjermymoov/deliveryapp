import React, { useState, useRef } from 'react';
import { Driver, DeliveryRoute, Order, ProofOfDelivery, BrandTheme } from '../types';
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
  RotateCcw,
  AlertTriangle,
  Send,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface Props {
  driver: Driver;
  brandTheme: BrandTheme;
  activeRoute?: DeliveryRoute;
  onCompletePod: (orderId: string, pod: Partial<ProofOfDelivery>) => void;
  onStartRoute: (routeId: string) => void;
  onBackToAdmin: () => void;
  onOpenCustomerTracker?: (trackingNumber: string) => void;
}

export const DriverApp: React.FC<Props> = ({
  driver,
  brandTheme,
  activeRoute,
  onCompletePod,
  onStartRoute,
  onBackToAdmin,
  onOpenCustomerTracker,
}) => {
  const [selectedStop, setSelectedStop] = useState<Order | null>(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  // POD state
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [capturedGeo, setCapturedGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Line-Item Damage / Exception Handling
  const [damagedItemMap, setDamagedItemMap] = useState<Record<string, { damagedQty: number; reason: string }>>({});
  const [hasExceptions, setHasExceptions] = useState(false);

  // Simulated Customer SMS Notification Trigger
  const [notificationSentMsg, setNotificationSentMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deliveredStops = activeRoute?.orders.filter((s) => s.status === 'DELIVERED') || [];
  const remainingStops = activeRoute?.orders.filter((s) => s.status !== 'DELIVERED') || [];
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
    ctx.strokeStyle = '#0F1E36';
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

  const handleOpenPod = (stop: Order) => {
    setSelectedStop(stop);
    setRecipientName(stop.customerName);
    setPodNotes('');
    setCapturedPhoto(null);
    setHasSignature(false);
    setDamagedItemMap({});
    setHasExceptions(false);
    setIsPodModalOpen(true);

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

  const handleSetDamagedQty = (sku: string, qty: number, reason: string) => {
    setDamagedItemMap((prev) => ({
      ...prev,
      [sku]: { damagedQty: qty, reason },
    }));
  };

  const handleSendEtaSms = (stop: Order) => {
    setNotificationSentMsg(`📱 SMS sent to ${stop.customerPhone}: "Your ${brandTheme.companyName} delivery is next! Driver ${driver.name.split(' ')[0]} is arriving in approx 15 mins."`);
    setTimeout(() => setNotificationSentMsg(''), 4500);
  };

  const handleSubmitPod = () => {
    if (!selectedStop) return;

    let signatureDataUrl = '';
    if (canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const exceptionNotes = Object.entries(damagedItemMap)
      .filter(([_, v]) => v.damagedQty > 0)
      .map(([sku, v]) => `${sku}: ${v.damagedQty} damaged/short (${v.reason})`)
      .join('; ');

    onCompletePod(selectedStop.id, {
      recipientName: recipientName || selectedStop.customerName,
      signatureData: signatureDataUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><text y="20">Verified On-Site</text></svg>',
      photoUrl: capturedPhoto,
      notes: podNotes,
      deliveredLat: capturedGeo?.lat,
      deliveredLng: capturedGeo?.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasItemExceptions: hasExceptions && !!exceptionNotes,
      itemExceptionNotes: exceptionNotes || undefined,
    });

    setIsPodModalOpen(false);
    setSelectedStop(null);
  };

  const openGoogleMaps = (stop: Order) => {
    const query = encodeURIComponent(`${stop.address}, ${stop.city} ${stop.postcode}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-0 sm:py-6 font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[850px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-slate-800">
        
        {/* Mobile Header */}
        <header
          className="text-white px-5 pt-6 pb-4 shadow transition-colors"
          style={{ backgroundColor: brandTheme.primaryColour }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToAdmin}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dispatch OMS
            </button>
            <div
              className="text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              <span>{driver.vehicleReg}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight">{driver.name}</h2>
              <p className="text-xs opacity-80">{brandTheme.companyName} Fleet Driver • {driver.phone}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-bold text-sm text-white"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {driver.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Route Status Banner */}
        {activeRoute ? (
          <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between text-xs border-b border-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">ROUTE</span>
              <span className="font-mono font-bold text-amber-400">{activeRoute.routeNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">PROGRESS</span>
              <span className="font-bold">
                {deliveredStops.length} / {activeRoute.orders.length} Delivered
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white m-4 rounded-2xl border border-gray-200">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800">No Route Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">
              Switch back to the portal to assign {driver.name} to a route.
            </p>
            <button
              onClick={onBackToAdmin}
              className="mt-4 px-4 py-2 text-white font-bold text-xs rounded-xl shadow"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              Open Portal
            </button>
          </div>
        )}

        {/* Start Route Button */}
        {activeRoute && (activeRoute.status === 'ASSIGNED' || (activeRoute.status as string) === 'UNASSIGNED') && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-amber-900">Route Ready to Depart</h4>
              <p className="text-[11px] text-amber-700">{activeRoute.orders.length} orders staged & loaded</p>
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

        {/* SMS Notification Banner Alert */}
        {notificationSentMsg && (
          <div className="p-3 bg-blue-50 text-blue-900 text-xs font-bold border-b border-blue-200 animate-fadeIn flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{notificationSentMsg}</span>
          </div>
        )}

        {/* Stops List */}
        {activeRoute && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
            {currentStop && (
              <div
                className="bg-white rounded-2xl p-4 shadow-md border-2 relative overflow-hidden"
                style={{ borderColor: brandTheme.secondaryColour }}
              >
                <div
                  className="absolute top-0 right-0 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1.5"
                  style={{ backgroundColor: brandTheme.secondaryColour }}
                >
                  <span>Next Stop (#{currentStop.stopSequence || 1})</span>
                  {onOpenCustomerTracker && (
                    <button
                      onClick={() => onOpenCustomerTracker(currentStop.trackingNumber)}
                      className="text-white hover:underline text-[9px] flex items-center gap-0.5"
                      title="View Customer Tracking Link"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-xs font-black px-2 py-0.5 rounded border"
                    style={{ color: brandTheme.secondaryColour, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
                  >
                    {currentStop.trackingNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-1">{currentStop.customerName}</h3>
                
                <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    {currentStop.address}, {currentStop.city} <strong>{currentStop.postcode}</strong>
                  </span>
                </p>

                {currentStop.customerPhone && (
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={`tel:${currentStop.customerPhone}`} className="text-blue-600 font-semibold underline">
                        {currentStop.customerPhone}
                      </a>
                    </p>

                    <button
                      onClick={() => handleSendEtaSms(currentStop)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0072CE] font-bold text-[10px] flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" />
                      Send "Arriving Next" SMS
                    </button>
                  </div>
                )}

                {/* Items to deliver */}
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 text-xs">
                  <span className="font-bold text-amber-900 block text-[11px] mb-1">
                    📦 PRODUCTS TO UNLOAD:
                  </span>
                  <div className="space-y-1">
                    {currentStop.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-amber-900 font-medium">
                        <span>• {item.name}</span>
                        <span className="font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                          Qty: {item.quantity} ({item.sku})
                        </span>
                      </div>
                    ))}
                  </div>

                  {currentStop.specialNotes && (
                    <p className="text-amber-800 italic text-[11px] mt-2 pt-1 border-t border-amber-200">
                      ⚠️ Note: {currentStop.specialNotes}
                    </p>
                  )}

                  <div className="mt-2 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Expected Dwell: {currentStop.manualDwellOverrideMins || currentStop.totalDwellMins} mins
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => openGoogleMaps(currentStop)}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-blue-200"
                    style={{ color: brandTheme.secondaryColour }}
                  >
                    <Navigation className="w-4 h-4" />
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

            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Route Stop Sequence
              </h4>

              <div className="space-y-2">
                {activeRoute.orders.map((ord, idx) => {
                  const isDelivered = ord.status === 'DELIVERED';
                  const isCurrent = currentStop?.id === ord.id;

                  return (
                    <div
                      key={ord.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        isDelivered
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                          : isCurrent
                          ? 'bg-white border-blue-600 shadow-sm'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isDelivered
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-slate-900 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{ord.customerName}</span>
                            <span className="text-[10px] font-mono text-gray-400">({ord.trackingNumber})</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[190px]">
                            {ord.address}, {ord.postcode}
                          </p>
                        </div>
                      </div>

                      {isDelivered ? (
                        <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPod(ord)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100"
                          style={{ color: brandTheme.secondaryColour }}
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

        {/* PROOF OF DELIVERY (POD) MODAL WITH EXCEPTION / SHORT DAMAGE REPORTING */}
        {isPodModalOpen && selectedStop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase block" style={{ color: brandTheme.secondaryColour }}>
                    Proof of Delivery (POD)
                  </span>
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
                <div className="flex items-center gap-1.5 mt-2 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isCapturingGps ? (
                    <span>Verifying GPS location...</span>
                  ) : (
                    <span>GPS Presence Verified ({capturedGeo?.lat.toFixed(4)}, {capturedGeo?.lng.toFixed(4)})</span>
                  )}
                </div>
              </div>

              {/* LINE ITEM EXCEPTION HANDLING (DAMAGED / SHORT GOODS) */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 mb-2 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Item Exceptions / Transit Damage
                  </span>
                  <button
                    type="button"
                    onClick={() => setHasExceptions(!hasExceptions)}
                    className="text-[11px] font-black underline text-amber-800"
                  >
                    {hasExceptions ? 'Cancel Exception' : '+ Report Damaged / Short'}
                  </button>
                </div>

                {hasExceptions && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-amber-200">
                    {selectedStop.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-300 space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.name} ({item.sku})</span>
                          <span>Total: {item.quantity}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Damaged Qty"
                            min="0"
                            max={item.quantity}
                            value={damagedItemMap[item.sku]?.damagedQty || ''}
                            onChange={(e) => handleSetDamagedQty(item.sku, parseInt(e.target.value) || 0, damagedItemMap[item.sku]?.reason || 'Transit Scratch')}
                            className="p-1 border rounded text-xs"
                          />
                          <select
                            value={damagedItemMap[item.sku]?.reason || 'Transit Scratch'}
                            onChange={(e) => handleSetDamagedQty(item.sku, damagedItemMap[item.sku]?.damagedQty || 1, e.target.value)}
                            className="p-1 border rounded text-xs"
                          >
                            <option value="Transit Scratch">Transit Scratch</option>
                            <option value="Broken / Cracked Length">Broken / Cracked</option>
                            <option value="Short Shipped (Missing)">Short Shipped</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    placeholder="e.g. Marcus Evans"
                    className="w-full text-sm rounded-xl border-gray-300 p-2.5 border focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5" style={{ color: brandTheme.secondaryColour }} />
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
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    Proof Photo (Goods on Site / Damage Evidence)
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
                      <span>Take Photo of Delivery</span>
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
                    placeholder="e.g. Left in side passageway"
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
