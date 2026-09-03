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
  Barcode,
  Sparkles,
  Home,
  Check,
  ListOrdered,
  Warehouse,
  ChevronRight
} from 'lucide-react';

interface Props {
  driver: Driver;
  brandTheme: BrandTheme;
  activeRoute?: DeliveryRoute;
  allAvailableRoutes?: DeliveryRoute[];
  onClaimRoute?: (routeId: string, driverId: string) => void;
  onConfirmRouteLoaded: (routeId: string) => void;
  onStartRoute: (routeId: string) => void;
  onCompletePod: (orderId: string, pod: Partial<ProofOfDelivery>) => void;
  onCompleteRoute?: (routeId: string) => void;
  onBackToAdmin: () => void;
  onOpenCustomerTracker?: (trackingNumber: string) => void;
}

type DriverAppStage = 'SELECT_ROUTE' | 'SCAN_LOAD' | 'ON_ROAD_MANIFEST' | 'RETURN_TO_DEPOT' | 'ROUTE_COMPLETED';

export const DriverApp: React.FC<Props> = ({
  driver,
  brandTheme,
  activeRoute,
  allAvailableRoutes = [],
  onClaimRoute,
  onConfirmRouteLoaded,
  onStartRoute,
  onCompletePod,
  onCompleteRoute,
  onBackToAdmin,
}) => {
  // Determine initial workflow stage
  const getInitialStage = (): DriverAppStage => {
    if (!activeRoute) return 'SELECT_ROUTE';
    if (!activeRoute.allLoaded && activeRoute.status !== 'IN_PROGRESS' && activeRoute.status !== 'COMPLETED') {
      return 'SCAN_LOAD';
    }
    if (activeRoute.status === 'COMPLETED') return 'ROUTE_COMPLETED';
    return 'ON_ROAD_MANIFEST';
  };

  const [currentStage, setCurrentStage] = useState<DriverAppStage>(getInitialStage());
  const [selectedStop, setSelectedStop] = useState<Order | null>(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  // Scan & Load Staging State
  const [loadedSkuMap, setLoadedSkuMap] = useState<Record<string, boolean>>({});
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scanBanner, setScanBanner] = useState('');

  // POD Form State
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [capturedGeo, setCapturedGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Damage / Short Exception Handling
  const [damagedItemMap, setDamagedItemMap] = useState<Record<string, { damagedQty: number; reason: string }>>({});
  const [hasExceptions, setHasExceptions] = useState(false);

  // Customer SMS Notice
  const [smsFeedback, setSmsFeedback] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stops progress
  const deliveredStops = activeRoute?.orders.filter((s) => s.status === 'DELIVERED') || [];
  const remainingStops = activeRoute?.orders.filter((s) => s.status !== 'DELIVERED') || [];
  const currentActiveStop = remainingStops[0] || null;

  // LIFO loading stops (Reverse stop order for van loading)
  const lifoStops = activeRoute ? [...activeRoute.orders].reverse() : [];
  const totalItemLines = activeRoute?.orders.reduce((acc, o) => acc + o.items.length, 0) || 0;
  const loadedCount = Object.keys(loadedSkuMap).length;

  // Handle Barcode Scan / Tap in Scan & Load screen
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeQuery.trim().toUpperCase();
    if (!query || !activeRoute) return;

    let matchedKey: string | null = null;
    lifoStops.forEach((s) => {
      s.items.forEach((item, iIdx) => {
        if (item.sku.toUpperCase() === query || s.trackingNumber.toUpperCase() === query) {
          matchedKey = `${s.id}-${item.sku}-${iIdx}`;
        }
      });
    });

    if (matchedKey) {
      setLoadedSkuMap((prev) => ({ ...prev, [matchedKey!]: true }));
      setScanBanner(`✓ Scanned & Verified: ${query}`);
      setBarcodeQuery('');
      setTimeout(() => setScanBanner(''), 2500);
    } else {
      setScanBanner(`⚠️ SKU / Tracking #${query} not on your manifest.`);
      setTimeout(() => setScanBanner(''), 3000);
    }
  };

  const handleToggleItemLoaded = (key: string) => {
    setLoadedSkuMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuickLoadAll = () => {
    const fullMap: Record<string, boolean> = {};
    lifoStops.forEach((s) => {
      s.items.forEach((item, iIdx) => {
        fullMap[`${s.id}-${item.sku}-${iIdx}`] = true;
      });
    });
    setLoadedSkuMap(fullMap);
  };

  const handleFinishLoadingAndDepart = () => {
    if (!activeRoute) return;
    onConfirmRouteLoaded(activeRoute.id);
    onStartRoute(activeRoute.id);
    setCurrentStage('ON_ROAD_MANIFEST');
  };

  // Canvas Drawing for Signatures
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

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOpenPod = (targetOrder: Order) => {
    setSelectedStop(targetOrder);
    setRecipientName(targetOrder.customerName);
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
          setCapturedGeo({ lat: targetOrder.lat + 0.0001, lng: targetOrder.lng + 0.0001 });
          setIsCapturingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setCapturedGeo({ lat: targetOrder.lat, lng: targetOrder.lng });
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

  const handleSendEtaSms = (targetOrder: Order) => {
    setSmsFeedback(`📱 Customer notified: "Driver ${driver.name.split(' ')[0]} is arriving in ~15 mins at ${targetOrder.postcode}."`);
    setTimeout(() => setSmsFeedback(''), 4500);
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

    // If that was the last stop, transition to return to depot
    if (remainingStops.length <= 1 && activeRoute) {
      setCurrentStage('RETURN_TO_DEPOT');
    }
  };

  const handleFinishShiftAndReturn = () => {
    if (activeRoute && onCompleteRoute) {
      onCompleteRoute(activeRoute.id);
    }
    setCurrentStage('ROUTE_COMPLETED');
  };

  const openGoogleMaps = (targetOrder: Order) => {
    const query = encodeURIComponent(`${targetOrder.address}, ${targetOrder.city} ${targetOrder.postcode}`);
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
              Admin Portal
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
              <p className="text-xs opacity-80">{brandTheme.companyName} Fleet Driver</p>
            </div>
            <div
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-bold text-sm text-white"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              {driver.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* DRIVER STAGE TABS BAR */}
        <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between text-xs border-b border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              currentStage === 'SELECT_ROUTE' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              1. Route
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              currentStage === 'SCAN_LOAD' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              2. Load Van
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              currentStage === 'ON_ROAD_MANIFEST' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
            }`}>
              3. Deliver
            </span>
          </div>

          {activeRoute && (
            <span className="font-mono text-[10px] text-amber-400 font-bold truncate max-w-[110px]">
              {activeRoute.routeNumber.split('(')[0]}
            </span>
          )}
        </div>

        {/* SMS Notification Banner Alert */}
        {smsFeedback && (
          <div className="p-3 bg-blue-50 text-blue-900 text-xs font-bold border-b border-blue-200 animate-fadeIn flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{smsFeedback}</span>
          </div>
        )}

        {/* STAGE 1: MORNING ROUTE SELECTION & CHECK-IN */}
        {currentStage === 'SELECT_ROUTE' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
              <Warehouse className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              <h3 className="font-black text-slate-900 text-base">Morning Depot Check-In</h3>
              <p className="text-xs text-slate-500 mt-1">
                Good morning {driver.name.split(' ')[0]}! Select your assigned route manifest to begin loading.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                Available Route Manifests:
              </h4>

              {allAvailableRoutes.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center text-xs text-slate-400">
                  No active routes currently staged at your depot.
                </div>
              ) : (
                allAvailableRoutes.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2 hover:border-blue-500 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black" style={{ color: brandTheme.secondaryColour }}>
                        {r.routeNumber}
                      </span>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                        {r.orders.length} Stops
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] py-1 bg-slate-50 rounded-xl">
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">EST. SHIFT</span>
                        <span className="font-black text-slate-800">{Math.floor(r.totalEstimatedMins / 60)}h {r.totalEstimatedMins % 60}m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">DISTANCE</span>
                        <span className="font-black text-slate-800">{r.totalDistanceKm} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">STATUS</span>
                        <span className="font-bold text-slate-700">{r.allLoaded ? 'Loaded' : 'Needs Loading'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onClaimRoute) onClaimRoute(r.id, driver.id);
                        setCurrentStage('SCAN_LOAD');
                      }}
                      className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: brandTheme.secondaryColour }}
                    >
                      <Truck className="w-4 h-4" />
                      Claim Route & Begin Scan Loading
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: SCAN-TO-VAN LOADING VERIFICATION (LIFO) */}
        {currentStage === 'SCAN_LOAD' && activeRoute && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Step 2: Van Loading
                  </span>
                  <h3 className="font-black text-slate-900 text-sm">Scan Items into Van (LIFO Order)</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                  {loadedCount} / {totalItemLines} Loaded
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Load in <strong>reverse stop order</strong> so Stop #1 is at the van doors ready to offload.
              </p>

              {/* Barcode scan input */}
              <form onSubmit={handleBarcodeScan} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Scan SKU barcode or Tracking #..."
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  className="flex-1 text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-slate-50 uppercase focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-white font-bold text-xs rounded-xl shadow"
                  style={{ backgroundColor: brandTheme.secondaryColour }}
                >
                  <Barcode className="w-4 h-4" />
                </button>
              </form>

              {scanBanner && (
                <div className={`p-2 rounded-lg text-xs font-bold ${
                  scanBanner.startsWith('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {scanBanner}
                </div>
              )}
            </div>

            {/* Quick verify button */}
            <div className="flex justify-end">
              <button
                onClick={handleQuickLoadAll}
                className="text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Quick Check-All
              </button>
            </div>

            {/* Reverse stops list */}
            <div className="space-y-2.5">
              {lifoStops.map((stopItem, sIdx) => {
                const stopNum = lifoStops.length - sIdx;
                return (
                  <div key={stopItem.id} className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                          #{stopNum}
                        </span>
                        <span className="font-bold text-slate-900">{stopItem.customerName}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{stopItem.postcode}</span>
                    </div>

                    <div className="space-y-1.5">
                      {stopItem.items.map((item, iIdx) => {
                        const itemKey = `${stopItem.id}-${item.sku}-${iIdx}`;
                        const isLoaded = !!loadedSkuMap[itemKey];

                        return (
                          <div
                            key={iIdx}
                            onClick={() => handleToggleItemLoaded(itemKey)}
                            className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                              isLoaded
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-slate-50 border-gray-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isLoaded}
                                onChange={() => {}}
                                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <span className="font-mono font-bold text-[11px] block">{item.sku}</span>
                                <span className="text-[11px] opacity-80">{item.name}</span>
                              </div>
                            </div>

                            <span className="font-black text-xs px-2 py-0.5 rounded bg-white border border-gray-200">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Depart Action */}
            <div className="pt-3">
              <button
                onClick={handleFinishLoadingAndDepart}
                className="w-full py-3.5 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                style={{ backgroundColor: brandTheme.secondaryColour }}
              >
                <Truck className="w-4 h-4" />
                Confirm Van Loaded & Start Delivery Route
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: ACTIVE ON-ROAD MANIFEST & DIGITAL POD */}
        {currentStage === 'ON_ROAD_MANIFEST' && activeRoute && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
            {/* Progress summary banner */}
            <div className="bg-slate-800 text-white p-3 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">DELIVERY PROGRESS</span>
                <span className="font-bold">{deliveredStops.length} of {activeRoute.orders.length} Stops Done</span>
              </div>
              <span className="font-black text-amber-400 text-sm">
                {Math.round((deliveredStops.length / (activeRoute.orders.length || 1)) * 100)}%
              </span>
            </div>

            {/* CURRENT ACTIVE STOP CARD */}
            {currentActiveStop ? (
              <div
                className="bg-white rounded-2xl p-4 shadow-md border-2 relative overflow-hidden"
                style={{ borderColor: brandTheme.secondaryColour }}
              >
                <div
                  className="absolute top-0 right-0 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider"
                  style={{ backgroundColor: brandTheme.secondaryColour }}
                >
                  Current Stop (#{currentActiveStop.stopSequence || 1})
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-xs font-black px-2 py-0.5 rounded border"
                    style={{ color: brandTheme.secondaryColour, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
                  >
                    {currentActiveStop.trackingNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-1">{currentActiveStop.customerName}</h3>
                
                <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    {currentActiveStop.address}, {currentActiveStop.city} <strong>{currentActiveStop.postcode}</strong>
                  </span>
                </p>

                {currentActiveStop.customerPhone && (
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={`tel:${currentActiveStop.customerPhone}`} className="text-blue-600 font-semibold underline">
                        {currentActiveStop.customerPhone}
                      </a>
                    </p>

                    <button
                      onClick={() => handleSendEtaSms(currentActiveStop)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0072CE] font-bold text-[10px] flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" />
                      Send "Arriving Next" SMS
                    </button>
                  </div>
                )}

                {/* Items to unload */}
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 text-xs">
                  <span className="font-bold text-amber-900 block text-[11px] mb-1 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                    PRODUCTS TO UNLOAD:
                  </span>
                  <div className="space-y-1">
                    {currentActiveStop.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-amber-900 font-medium">
                        <span>• {item.name}</span>
                        <span className="font-bold bg-white px-2 py-0.5 rounded border border-amber-300">
                          Qty: {item.quantity} ({item.sku})
                        </span>
                      </div>
                    ))}
                  </div>

                  {currentActiveStop.specialNotes && (
                    <p className="text-amber-800 italic text-[11px] mt-2 pt-1 border-t border-amber-200">
                      ⚠️ Note: {currentActiveStop.specialNotes}
                    </p>
                  )}

                  <div className="mt-2 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Expected Dwell: {currentActiveStop.manualDwellOverrideMins || currentActiveStop.totalDwellMins} mins
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => openGoogleMaps(currentActiveStop)}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-blue-200"
                    style={{ color: brandTheme.secondaryColour }}
                  >
                    <Navigation className="w-4 h-4" />
                    Google Maps
                  </button>

                  <button
                    onClick={() => handleOpenPod(currentActiveStop)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Deliver & POD
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-300 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-black text-emerald-950 text-base">All Deliveries Completed!</h3>
                <p className="text-xs text-emerald-800">
                  Great job! You have successfully delivered all stops on this manifest. Return to depot to finish your shift.
                </p>
                <button
                  onClick={() => setCurrentStage('RETURN_TO_DEPOT')}
                  className="w-full py-3 bg-emerald-700 text-white font-black text-xs rounded-xl shadow"
                >
                  Head Back to Depot ➔
                </button>
              </div>
            )}

            {/* UPCOMING STOPS */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Remaining Manifest Stops
              </h4>

              <div className="space-y-2">
                {activeRoute.orders.map((ord, idx) => {
                  const isDelivered = ord.status === 'DELIVERED';
                  const isCurrent = currentActiveStop?.id === ord.id;

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

        {/* STAGE 4: RETURN TO DEPOT & COMPLETE SHIFT */}
        {(currentStage === 'RETURN_TO_DEPOT' || currentStage === 'ROUTE_COMPLETED') && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-center flex flex-col justify-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Shift Completed</h3>
              <p className="text-xs text-slate-500 mt-1">
                All {deliveredStops.length} delivery stops have been verified with digital signatures and GPS telemetry.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-700 pb-1 border-b">
                <span>Vehicle:</span>
                <span>{driver.vehicleReg}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 pb-1 border-b">
                <span>Deliveries Verified:</span>
                <span className="text-emerald-700">{deliveredStops.length} Stops</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Total Shift Dwell + Drive:</span>
                <span>{activeRoute ? `${Math.floor(activeRoute.totalEstimatedMins / 60)}h ${activeRoute.totalEstimatedMins % 60}m` : 'Done'}</span>
              </div>
            </div>

            <button
              onClick={handleFinishShiftAndReturn}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Sign Off & Return to Depot
            </button>
          </div>
        )}

        {/* PROOF OF DELIVERY (POD) MODAL */}
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

              {/* Line Item Exceptions */}
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
                            onChange={(e) => setDamagedItemMap({
                              ...damagedItemMap,
                              [item.sku]: { damagedQty: parseInt(e.target.value) || 0, reason: damagedItemMap[item.sku]?.reason || 'Transit Scratch' }
                            })}
                            className="p-1 border rounded text-xs"
                          />
                          <select
                            value={damagedItemMap[item.sku]?.reason || 'Transit Scratch'}
                            onChange={(e) => setDamagedItemMap({
                              ...damagedItemMap,
                              [item.sku]: { damagedQty: damagedItemMap[item.sku]?.damagedQty || 1, reason: e.target.value }
                            })}
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
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseLeave={() => setIsDrawing(false)}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={() => setIsDrawing(false)}
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
