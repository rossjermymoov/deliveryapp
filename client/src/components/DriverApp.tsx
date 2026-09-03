import React, { useState, useRef } from 'react';
import { Driver, DeliveryRoute, Order, ProofOfDelivery, BrandTheme, VanVehicle, VehicleFaultReport } from '../types';
import { ReportFaultModal } from './ReportFaultModal';
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  Camera,
  PenTool,
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Check,
  Warehouse,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface Props {
  driver: Driver;
  brandTheme: BrandTheme;
  vans?: VanVehicle[];
  activeRoute?: DeliveryRoute;
  allAvailableRoutes?: DeliveryRoute[];
  onClaimRoute?: (routeId: string, driverId: string) => void;
  onConfirmRouteLoaded: (routeId: string) => void;
  onStartRoute: (routeId: string) => void;
  onCompletePod: (orderId: string, pod: Partial<ProofOfDelivery>) => void;
  onCompleteRoute?: (routeId: string) => void;
  onSubmitFaultReport?: (fault: VehicleFaultReport) => void;
  onBackToAdmin: () => void;
  onOpenCustomerTracker?: (trackingNumber: string) => void;
}

type DriverAppStage = 'SELECT_ROUTE' | 'SCAN_LOAD' | 'ON_ROAD_MANIFEST' | 'RETURN_TO_DEPOT' | 'ROUTE_COMPLETED';

export const DriverApp: React.FC<Props> = ({
  driver,
  brandTheme,
  vans = [],
  activeRoute,
  allAvailableRoutes = [],
  onClaimRoute,
  onConfirmRouteLoaded,
  onStartRoute,
  onCompletePod,
  onCompleteRoute,
  onSubmitFaultReport,
  onBackToAdmin,
}) => {
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
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [faultSuccessBanner, setFaultSuccessBanner] = useState('');

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

  const currentVanReg = activeRoute?.vanRegistration || driver.assignedVanReg || 'Fleet Van';

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
      setScanBanner(`✓ Scanned & Loaded: ${query}`);
      setBarcodeQuery('');
      setTimeout(() => setScanBanner(''), 2500);
    } else {
      alert(`No unscanned goods on this manifest match "${query}".`);
    }
  };

  const handleToggleItemLoaded = (key: string) => {
    setLoadedSkuMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScanAllMock = () => {
    const allMap: Record<string, boolean> = {};
    lifoStops.forEach((s) => {
      s.items.forEach((item, iIdx) => {
        allMap[`${s.id}-${item.sku}-${iIdx}`] = true;
      });
    });
    setLoadedSkuMap(allMap);
    setScanBanner('✓ All cargo marked as loaded into van');
    setTimeout(() => setScanBanner(''), 2500);
  };

  const handleStartDeliveryTour = () => {
    if (!activeRoute) return;
    onStartRoute(activeRoute.id);
    setCurrentStage('ON_ROAD_MANIFEST');
  };

  const handleCaptureGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCapturedGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          if (selectedStop) {
            setCapturedGeo({ lat: selectedStop.lat + 0.0001, lng: selectedStop.lng + 0.0001 });
          }
        }
      );
    } else {
      if (selectedStop) {
        setCapturedGeo({ lat: selectedStop.lat + 0.0001, lng: selectedStop.lng + 0.0001 });
      }
    }
  };

  const handleOpenPod = (stop: Order) => {
    setSelectedStop(stop);
    setRecipientName(stop.customerName.split(' ')[0] || '');
    setPodNotes('');
    setCapturedPhoto(null);
    setHasSignature(false);
    setDamagedItemMap({});
    setHasExceptions(false);
    setIsPodModalOpen(true);
    handleCaptureGps();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F1E36';
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendEtaSms = (stop: Order) => {
    setSmsFeedback(`✓ Sent ETA text to ${stop.customerPhone || 'Customer'}: "Kalsi delivery van arriving in 15 mins."`);
    setTimeout(() => setSmsFeedback(''), 4000);
  };

  const handleSubmitPod = () => {
    if (!selectedStop) return;
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL('image/png') : '';

    const exceptionNotes = Object.entries(damagedItemMap)
      .filter(([_, val]) => val.damagedQty > 0)
      .map(([sku, val]) => `${sku}: ${val.damagedQty} damaged/short (${val.reason})`)
      .join('; ');

    const podData: Partial<ProofOfDelivery> = {
      recipientName: recipientName || selectedStop.customerName,
      signatureData: hasSignature ? signatureData : undefined,
      photoUrl: capturedPhoto || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      notes: podNotes,
      deliveredLat: capturedGeo?.lat || selectedStop.lat,
      deliveredLng: capturedGeo?.lng || selectedStop.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasItemExceptions: hasExceptions && exceptionNotes.length > 0,
      itemExceptionNotes: exceptionNotes,
    };

    onCompletePod(selectedStop.id, podData);
    setIsPodModalOpen(false);
    setSelectedStop(null);

    if (remainingStops.length <= 1) {
      setCurrentStage('RETURN_TO_DEPOT');
    }
  };

  const handleFinishShift = () => {
    if (activeRoute && onCompleteRoute) {
      onCompleteRoute(activeRoute.id);
    }
    setCurrentStage('ROUTE_COMPLETED');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center py-0 sm:py-6 font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[850px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-slate-800">
        
        {/* Report Fault Modal */}
        <ReportFaultModal
          isOpen={isFaultModalOpen}
          onClose={() => setIsFaultModalOpen(false)}
          driver={driver}
          vans={vans}
          activeVanRegistration={currentVanReg}
          onSubmitFault={(report) => {
            if (onSubmitFaultReport) onSubmitFaultReport(report);
            setFaultSuccessBanner(`✓ Reported defect on ${report.vanRegistration} to Head Office.`);
            setTimeout(() => setFaultSuccessBanner(''), 5000);
          }}
        />

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

            {/* Van Registration & Report Defect Button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFaultModalOpen(true)}
                className="px-2 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-[10px] font-black uppercase text-white flex items-center gap-1 shadow"
                title="Report vehicle breakdown, MOT defect, or mechanical fault"
              >
                <ShieldAlert className="w-3 h-3" /> Report Fault
              </button>

              <div
                className="text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono"
                style={{ backgroundColor: brandTheme.secondaryColour }}
              >
                <span>{currentVanReg}</span>
              </div>
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

        {faultSuccessBanner && (
          <div className="bg-rose-50 text-rose-900 border-b border-rose-200 px-4 py-2 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{faultSuccessBanner}</span>
          </div>
        )}

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

          <button
            onClick={() => setIsFaultModalOpen(true)}
            className="text-[10px] text-rose-300 hover:text-white font-bold underline"
          >
            Van Defect?
          </button>
        </div>

        {/* STAGE 1: SELECT / CLAIM ROUTE */}
        {currentStage === 'SELECT_ROUTE' && (
          <div className="flex-1 p-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Morning Manifest Sign-On</span>
              <h3 className="text-base font-black text-slate-900">Select Today's Delivery Route</h3>
              <p className="text-xs text-slate-500">Pick your assigned depot route to begin LIFO vehicle loading.</p>
            </div>

            <div className="space-y-3">
              {allAvailableRoutes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed text-xs">
                  No unassigned routes available at this depot right now. Check back with the controller.
                </div>
              ) : (
                allAvailableRoutes.map((r) => (
                  <div key={r.id} className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-xs hover:border-blue-500 transition space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-700">{r.routeNumber}</span>
                        <h4 className="font-black text-slate-900 text-sm mt-0.5">{r.orders.length} Delivery Drops</h4>
                      </div>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {r.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-50 p-2 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">DRIVE</span>
                        <span className="font-bold text-slate-800">{Math.floor(r.totalDrivingMins / 60)}h {r.totalDrivingMins % 60}m</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">DWELL</span>
                        <span className="font-bold text-slate-800">{r.totalDwellMins} mins</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold">SHIFT</span>
                        <span className="font-bold text-emerald-700">{Math.floor(r.totalEstimatedMins / 60)}h {r.totalEstimatedMins % 60}m</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onClaimRoute) onClaimRoute(r.id, driver.id);
                        setCurrentStage('SCAN_LOAD');
                      }}
                      className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow hover:bg-black transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" /> Claim Route & Begin Loading
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: LIFO SCAN & LOAD */}
        {currentStage === 'SCAN_LOAD' && activeRoute && (
          <div className="flex-1 p-4 space-y-3 flex flex-col">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  LIFO Van Loading Sequence
                </span>
                <span className="text-xs font-black text-slate-800">
                  {loadedCount} / {totalItemLines} Loaded
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Load stops in reverse order. Stop 1 is loaded last at the van doors.
              </p>
            </div>

            {scanBanner && (
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold text-center animate-fadeIn">
                {scanBanner}
              </div>
            )}

            <form onSubmit={handleBarcodeScan} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Scan / type SKU or tracking..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="flex-1 text-xs font-mono font-bold p-2 bg-white border rounded-xl"
              />
              <button
                type="submit"
                className="px-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Scan
              </button>
            </form>

            <div className="flex justify-end">
              <button
                onClick={handleScanAllMock}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Mark All Loaded
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[420px]">
              {lifoStops.map((stop, sIdx) => {
                const isFirstStop = stop.stopSequence === 1;
                return (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-2xl border transition text-xs ${
                      isFirstStop ? 'bg-blue-50/50 border-blue-400' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {stop.stopSequence || sIdx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{stop.customerName}</span>
                          <span className="text-[10px] text-slate-500">{stop.postcode}</span>
                        </div>
                      </div>
                      {isFirstStop && (
                        <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Rear Doors
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {stop.items.map((it, iIdx) => {
                        const key = `${stop.id}-${it.sku}-${iIdx}`;
                        const isDone = !!loadedSkuMap[key];
                        return (
                          <div
                            key={key}
                            onClick={() => handleToggleItemLoaded(key)}
                            className={`p-1.5 rounded-lg border flex justify-between items-center cursor-pointer transition ${
                              isDone ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${
                                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300'
                              }`}>
                                {isDone && '✓'}
                              </span>
                              <span className="font-mono text-[11px] font-bold">{it.sku}</span>
                            </div>
                            <span className="text-[10px] font-bold">{it.quantity} units</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  onConfirmRouteLoaded(activeRoute.id);
                  handleStartDeliveryTour();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4" /> Start Delivery Tour
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: ON ROAD MANIFEST & DROP EXECUTION */}
        {currentStage === 'ON_ROAD_MANIFEST' && activeRoute && (
          <div className="flex-1 p-4 space-y-3 flex flex-col">
            {currentActiveStop ? (
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Next Stop • Drop #{currentActiveStop.stopSequence || 1}
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                    {currentActiveStop.trackingNumber}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black">{currentActiveStop.customerName}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" /> {currentActiveStop.address}, <strong>{currentActiveStop.postcode}</strong>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${currentActiveStop.address}, ${currentActiveStop.postcode}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate (Google Maps)
                  </a>

                  <button
                    onClick={() => handleSendEtaSms(currentActiveStop)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1 border border-white/20"
                    title="Send SMS ETA to Customer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> 15m SMS
                  </button>
                </div>

                <button
                  onClick={() => handleOpenPod(currentActiveStop)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <PenTool className="w-4 h-4" /> Offload Cargo & Capture POD
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-black text-emerald-950 text-sm">All Stops Complete!</h3>
                <p className="text-xs text-emerald-800">Return to depot hub for end-of-day sign-off.</p>
                <button
                  onClick={() => setCurrentStage('RETURN_TO_DEPOT')}
                  className="py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Return to Depot
                </button>
              </div>
            )}

            {smsFeedback && (
              <div className="p-2 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-xl animate-fadeIn text-center">
                {smsFeedback}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">
                Full Manifest ({deliveredStops.length} delivered, {remainingStops.length} remaining)
              </span>

              {activeRoute.orders.map((stop, idx) => {
                const isDelivered = stop.status === 'DELIVERED';
                const isCurrent = currentActiveStop?.id === stop.id;

                return (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-2xl border transition text-xs flex justify-between items-center ${
                      isDelivered
                        ? 'bg-slate-100 border-gray-200 opacity-60'
                        : isCurrent
                        ? 'bg-amber-50/70 border-amber-400'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isDelivered ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                      }`}>
                        {isDelivered ? '✓' : idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{stop.customerName}</span>
                        <span className="text-[10px] text-slate-500">{stop.postcode} • {stop.items.length} cargo items</span>
                      </div>
                    </div>

                    {!isDelivered && (
                      <button
                        onClick={() => handleOpenPod(stop)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                      >
                        POD
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 4: RETURN TO DEPOT */}
        {currentStage === 'RETURN_TO_DEPOT' && (
          <div className="flex-1 p-6 text-center space-y-4 flex flex-col justify-center animate-fadeIn">
            <Warehouse className="w-16 h-16 text-blue-600 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Return to Regional Depot</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              All delivery stops have been completed and verified. Drive back to the depot to conclude your shift.
            </p>
            <button
              onClick={handleFinishShift}
              className="py-3 px-6 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow transition mx-auto"
            >
              Complete Shift & Hand In Van Keys
            </button>
          </div>
        )}

        {/* STAGE 5: ROUTE COMPLETED */}
        {currentStage === 'ROUTE_COMPLETED' && (
          <div className="flex-1 p-6 text-center space-y-4 flex flex-col justify-center animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Shift Completed!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Thank you, {driver.name}. All manifests, electronic PODs, and delivery photos have synced with Head Office.
            </p>
            <button
              onClick={onBackToAdmin}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition border mx-auto"
            >
              Return to Dispatch Dashboard
            </button>
          </div>
        )}

        {/* POPUP POD CAPTURE MODAL */}
        {isPodModalOpen && selectedStop && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn font-sans">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">POD Verification</span>
                  <h3 className="text-sm font-black">{selectedStop.customerName}</h3>
                </div>
                <button
                  onClick={() => setIsPodModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-slate-300 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-slate-50 font-bold text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Customer Signature Canvas
                    </label>
                    <button
                      onClick={clearSignature}
                      className="text-[10px] text-rose-600 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-slate-50 h-28 relative">
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={112}
                      className="w-full h-full cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                        Sign here with finger / stylus ✍️
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    On-Site Goods Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  {capturedPhoto ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border">
                      <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setCapturedPhoto(null)}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded text-[10px] font-bold"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-slate-100 border border-dashed border-gray-300 rounded-xl text-slate-700 font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200"
                    >
                      <Camera className="w-4 h-4 text-blue-600" /> Capture On-Site Photo 📸
                    </button>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => setHasExceptions(!hasExceptions)}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                      hasExceptions ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 border-gray-200 text-slate-600'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {hasExceptions ? 'Recording Damaged / Short Cargo' : 'Report Damaged / Missing Items?'}
                  </button>

                  {hasExceptions && (
                    <div className="mt-2 p-2 bg-rose-50/50 rounded-xl border border-rose-200 space-y-1.5">
                      {selectedStop.items.map((it) => (
                        <div key={it.sku} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-slate-800">{it.sku}</span>
                          <input
                            type="number"
                            min="0"
                            max={it.quantity}
                            placeholder="Damaged Qty"
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              setDamagedItemMap((prev) => ({
                                ...prev,
                                [it.sku]: { damagedQty: qty, reason: 'Site offload damage' }
                              }));
                            }}
                            className="w-20 p-1 border rounded bg-white text-xs font-bold text-center"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t flex gap-2">
                <button
                  onClick={() => setIsPodModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPod}
                  className="flex-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow"
                >
                  Confirm & Complete Drop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
