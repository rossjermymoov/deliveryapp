import React, { useState, useRef } from 'react';
import { Driver, VanVehicle, DeliveryRoute, Order, ProofOfDelivery, BrandTheme, VehicleFaultReport, AgeVerificationRecord } from '../types';
import { ReportFaultModal } from './ReportFaultModal';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  PenTool,
  Warehouse,
  Clock,
  Camera,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Home
} from 'lucide-react';

interface Props {
  driver: Driver;
  vans: VanVehicle[];
  activeRoute?: DeliveryRoute;
  allAvailableRoutes: DeliveryRoute[];
  brandTheme: BrandTheme;
  onClaimRoute?: (routeId: string, driverId: string) => void;
  onConfirmRouteLoaded: (routeId: string) => void;
  onStartRoute: (routeId: string) => void;
  onCompletePod: (orderId: string, podData: Partial<ProofOfDelivery>) => void;
  onCompleteRoute?: (routeId: string) => void;
  onSubmitFaultReport?: (report: VehicleFaultReport) => void;
  onBackToAdmin: () => void;
}

export const DriverApp: React.FC<Props> = ({
  driver,
  vans,
  activeRoute,
  allAvailableRoutes: _allAvailableRoutes,
  brandTheme,
  onClaimRoute: _onClaimRoute,
  onConfirmRouteLoaded,
  onStartRoute,
  onCompletePod,
  onCompleteRoute,
  onSubmitFaultReport,
  onBackToAdmin,
}) => {
  type DriverStage =
    | 'CHOOSE_ROUTE'
    | 'VEHICLE_WALKAROUND'
    | 'LIFO_VAN_LOADING'
    | 'ON_ROAD_MANIFEST'
    | 'RETURN_TO_DEPOT'
    | 'ROUTE_COMPLETED';

  const [currentStage, setCurrentStage] = useState<DriverStage>(
    !activeRoute
      ? 'CHOOSE_ROUTE'
      : activeRoute.status === 'IN_PROGRESS'
      ? 'ON_ROAD_MANIFEST'
      : activeRoute.allLoaded
      ? 'ON_ROAD_MANIFEST'
      : 'VEHICLE_WALKAROUND'
  );

  // Selected Van for shift
  const currentVanId = activeRoute?.vanId || driver.assignedVanId || vans[0]?.id || 'van-1';

  // Pre-trip inspection checklist
  const [walkaroundChecks, setWalkaroundChecks] = useState({
    tyres: true,
    lights: true,
    mirrors: true,
    doors: true,
    fluidLevels: true,
  });

  // LIFO loading tick states
  const [loadedSkuMap, setLoadedSkuMap] = useState<Record<string, boolean>>({});

  // POD modal state
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Order | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedGeo, setCapturedGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState('');

  // Age Verification Challenge 25 State (For Solvents / 18+ items)
  const [ageIdType, setAgeIdType] = useState<AgeVerificationRecord['idType']>('DRIVING_LICENCE');
  const [ageYearOfBirth, setAgeYearOfBirth] = useState<number>(1995);
  const [ageVerifiedConfirmed, setAgeVerifiedConfirmed] = useState<boolean>(false);

  // Safe Place Confirmation State
  const [isSafePlaceDelivery, setIsSafePlaceDelivery] = useState<boolean>(false);
  const [safePlaceConfirmedLocation, setSafePlaceConfirmedLocation] = useState<string>('');

  // Item Exception state
  const [hasExceptions, setHasExceptions] = useState(false);
  const [damagedItemMap, setDamagedItemMap] = useState<Record<string, { damagedQty: number; reason: string }>>({});

  // Defect Report Modal state
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [faultSuccessBanner, setFaultSuccessBanner] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const matchedVan = vans.find((v) => v.id === currentVanId);
  const currentVanReg = activeRoute?.vanRegistration || matchedVan?.registration || driver.assignedVanReg || 'KL24 BHM';

  const routeOrders = activeRoute?.orders || [];
  const deliveredStops = routeOrders.filter((o) => o.status === 'DELIVERED');
  const remainingStops = routeOrders.filter((o) => o.status !== 'DELIVERED');
  const currentActiveStop = remainingStops[0] || null;

  const handleStartDeliveryTour = () => {
    if (activeRoute) {
      onStartRoute(activeRoute.id);
    }
    setCurrentStage('ON_ROAD_MANIFEST');
  };

  const handleToggleItemLoaded = (key: string) => {
    setLoadedSkuMap((prev) => ({ ...prev, [key]: !prev[key] }));
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
    
    // Initialise Age Verification & Safe Place defaults
    setAgeVerifiedConfirmed(false);
    setAgeIdType('DRIVING_LICENCE');
    setAgeYearOfBirth(1995);

    if (stop.leaveSafePreference?.requested && stop.allowLeaveSafe !== false) {
      setIsSafePlaceDelivery(true);
      setSafePlaceConfirmedLocation(
        `${stop.leaveSafePreference.locationType.replace(/_/g, ' ')}: ${stop.leaveSafePreference.accessInstructions || ''}`
      );
    } else {
      setIsSafePlaceDelivery(false);
      setSafePlaceConfirmedLocation('');
    }

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

    // Age verification validation if order requires it
    if (selectedStop.requiresAgeVerification && !ageVerifiedConfirmed) {
      alert('⚠️ Age Verification Required: Please inspect photo ID and verify the recipient is 18+ before completing drop.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL('image/png') : '';

    const exceptionNotes = Object.entries(damagedItemMap)
      .filter(([_, val]) => val.damagedQty > 0)
      .map(([sku, val]) => `${sku}: ${val.damagedQty} damaged/short (${val.reason})`)
      .join('; ');

    const podData: Partial<ProofOfDelivery> = {
      recipientName: isSafePlaceDelivery ? `Safe Place (${selectedStop.leaveSafePreference?.locationType || 'Secured on site'})` : (recipientName || selectedStop.customerName),
      signatureData: hasSignature ? signatureData : undefined,
      photoUrl: capturedPhoto || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      notes: isSafePlaceDelivery ? `Left safe: ${safePlaceConfirmedLocation}. ${podNotes}` : podNotes,
      deliveredLat: capturedGeo?.lat || selectedStop.lat,
      deliveredLng: capturedGeo?.lng || selectedStop.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasItemExceptions: hasExceptions && exceptionNotes.length > 0,
      itemExceptionNotes: exceptionNotes,
      leftInSafePlace: isSafePlaceDelivery,
      safePlacePhotoUrl: isSafePlaceDelivery ? (capturedPhoto || 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80') : null,
      ageVerification: selectedStop.requiresAgeVerification ? {
        verified: true,
        idType: ageIdType,
        recipientYearOfBirth: ageYearOfBirth,
        verifiedAt: new Date().toISOString(),
      } : undefined,
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                {driver.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                  Driver Portal 📱
                </span>
                <h2 className="text-sm font-black">{driver.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFaultModalOpen(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black shadow flex items-center gap-1 border border-rose-400"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Report Fault
              </button>

              <button
                onClick={onBackToAdmin}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold px-2.5 py-1 rounded-xl transition"
              >
                Dispatch Hub
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between bg-black/20 px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">{currentVanReg}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{driver.lastUpdated}</span>
            </div>
          </div>
        </header>

        {faultSuccessBanner && (
          <div className="p-3 bg-rose-50 text-rose-900 text-xs font-bold border-b border-rose-200 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{faultSuccessBanner}</span>
          </div>
        )}

        {/* STAGE 1: PRE-TRIP WALKAROUND */}
        {currentStage === 'VEHICLE_WALKAROUND' && (
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Stage 1 • Safety Walkaround
                </span>
                <h3 className="text-base font-black text-slate-900">Pre-Trip Van Roadworthiness Check</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm physical checks on van <strong>{currentVanReg}</strong> before loading cargo.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { key: 'tyres', label: 'Tyres & Tread Depth (>1.6mm, undamaged)' },
                  { key: 'lights', label: 'All Lights, Indicators & Brake Lamps' },
                  { key: 'mirrors', label: 'Mirrors, Windscreen & Wipers Clear' },
                  { key: 'doors', label: 'Rear & Side Cargo Doors Latch Securely' },
                  { key: 'fluidLevels', label: 'Oil, Coolant & Screenwash Levels OK' },
                ].map((chk) => (
                  <label
                    key={chk.key}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-800">{chk.label}</span>
                    <input
                      type="checkbox"
                      checked={(walkaroundChecks as any)[chk.key]}
                      onChange={(e) =>
                        setWalkaroundChecks({ ...walkaroundChecks, [chk.key]: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentStage('LIFO_VAN_LOADING')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-1.5"
            >
              Confirm Vehicle Safe & Proceed to Loading <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STAGE 2: LIFO LOADING */}
        {currentStage === 'LIFO_VAN_LOADING' && activeRoute && (
          <div className="flex-1 p-5 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Stage 2 • Staging & LIFO Loading
              </span>
              <h3 className="text-base font-black text-slate-900">Load Van in Reverse Stop Order</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Last Stop goes into the bulkhead first. First stop goes near the rear doors.
              </p>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {[...activeRoute.orders].reverse().map((stop) => {
                const isFirstStop = stop.id === activeRoute.orders[0]?.id;
                return (
                  <div key={stop.id} className="p-3 bg-white rounded-2xl border border-gray-200 text-xs shadow-2xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                          Drop #{stop.stopSequence || activeRoute.orders.indexOf(stop) + 1}
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black">{currentActiveStop.customerName}</h3>
                    {currentActiveStop.requiresAgeVerification && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" /> 18+ ID
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" /> {currentActiveStop.address}, <strong>{currentActiveStop.postcode}</strong>
                  </p>
                </div>

                {/* In-Flight Safe Place Live Banner */}
                {currentActiveStop.leaveSafePreference?.requested && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-400 flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" /> Customer Requested Safe Place:
                      </span>
                      {currentActiveStop.leaveSafePreference.inFlightUpdate && (
                        <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                          Live In-Flight
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-white">
                      Location: {currentActiveStop.leaveSafePreference.locationType.replace(/_/g, ' ')} {currentActiveStop.leaveSafePreference.neighbourHouseNumber ? `(#${currentActiveStop.leaveSafePreference.neighbourHouseNumber})` : ''}
                    </p>
                    {currentActiveStop.leaveSafePreference.accessInstructions && (
                      <p className="text-[11px] text-slate-300 italic">"{currentActiveStop.leaveSafePreference.accessInstructions}"</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${currentActiveStop.address}, ${currentActiveStop.postcode}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Navigate (Maps)
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
                  <PenTool className="w-4 h-4" /> Offload Cargo & Complete Drop
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{stop.customerName}</span>
                          {stop.requiresAgeVerification && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1 rounded font-black border border-amber-300">
                              18+
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">{stop.postcode} • {stop.items.length} items</span>
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

        {/* POPUP POD CAPTURE MODAL WITH AGE VERIFICATION (NO ID PHOTO STORED), SAFE PLACE OPTION & BULK SITE PHOTO */}
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
                
                {/* SAFE PLACE vs IN-PERSON DELIVERY TOGGLE */}
                {selectedStop.allowLeaveSafe !== false && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Delivery Handover Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSafePlaceDelivery(false)}
                        className={`py-2 px-3 rounded-xl font-bold border transition text-xs flex items-center justify-center gap-1 ${
                          !isSafePlaceDelivery
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-gray-300'
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" /> Hand to Recipient
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSafePlaceDelivery(true)}
                        className={`py-2 px-3 rounded-xl font-bold border transition text-xs flex items-center justify-center gap-1 ${
                          isSafePlaceDelivery
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-gray-300'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" /> Leave in Safe Place
                      </button>
                    </div>

                    {isSafePlaceDelivery && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Confirmed Safe Place Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Behind side gate / Inside porch"
                          value={safePlaceConfirmedLocation}
                          onChange={(e) => setSafePlaceConfirmedLocation(e.target.value)}
                          className="w-full p-2 border rounded-xl bg-white font-bold text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* AGE VERIFICATION (CHALLENGE 25) - PROMPTED ONLY IF ORDER REQUIRES AGE VERIFICATION */}
                {selectedStop.requiresAgeVerification && (
                  <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-400 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Challenge 25 • Age Verification (18+)</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-snug">
                      Inspect photo ID to confirm recipient is 18+. <em>Per UK GDPR compliance, do not photograph or store copies of ID documents.</em>
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                          ID Type Inspected
                        </label>
                        <select
                          value={ageIdType}
                          onChange={(e) => setAgeIdType(e.target.value as any)}
                          className="w-full p-1.5 border border-amber-300 rounded-xl bg-white font-bold text-xs"
                        >
                          <option value="DRIVING_LICENCE">Driving Licence</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="PASS_CARD">PASS Card</option>
                          <option value="NATIONAL_IDENTITY_CARD">National ID Card</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                          Year of Birth
                        </label>
                        <input
                          type="number"
                          min="1920"
                          max="2008"
                          value={ageYearOfBirth}
                          onChange={(e) => setAgeYearOfBirth(parseInt(e.target.value) || 1995)}
                          className="w-full p-1.5 border border-amber-300 rounded-xl bg-white font-mono font-bold text-xs text-center"
                        />
                      </div>
                    </div>

                    <label className="p-2 bg-amber-100/70 rounded-xl flex items-center gap-2 cursor-pointer border border-amber-300">
                      <input
                        type="checkbox"
                        checked={ageVerifiedConfirmed}
                        onChange={(e) => setAgeVerifiedConfirmed(e.target.checked)}
                        className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] font-black text-amber-950">
                        I confirm I have physically checked valid 18+ photo ID
                      </span>
                    </label>
                  </div>
                )}

                {/* Recipient Full Name (If Handover) */}
                {!isSafePlaceDelivery && (
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
                )}

                {/* Signature Canvas (Only if handed to recipient) */}
                {!isSafePlaceDelivery && (
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
                )}

                {/* BULK POST-UNLOAD SITE PHOTO (Captures all delivered items on site) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      {isSafePlaceDelivery ? 'Safe Place Goods Photo 📸' : 'Post-Unload Site Goods Photo 📸'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">All items offloaded</span>
                  </div>
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
                      <Camera className="w-4 h-4 text-blue-600" /> Capture On-Site Bulk Goods Photo 📸
                    </button>
                  )}
                </div>

                {/* Exceptions / Damaged Items */}
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
