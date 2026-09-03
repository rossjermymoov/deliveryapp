import React, { useState } from 'react';
import { DeliveryRoute, BrandTheme } from '../types';
import {
  Truck,
  CheckCircle2,
  Barcode,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface Props {
  route: DeliveryRoute;
  brandTheme: BrandTheme;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLoaded: (routeId: string) => void;
}

export const ScanToVanModal: React.FC<Props> = ({
  route,
  brandTheme,
  isOpen,
  onClose,
  onConfirmLoaded,
}) => {
  if (!isOpen) return null;

  // Flatten all items across the route stops in LIFO order (Reverse stop order for van loading)
  const allStops = [...route.orders].reverse();
  const [loadedSkuMap, setLoadedSkuMap] = useState<Record<string, boolean>>({});
  const [scanInput, setScanInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Total items calculation
  const totalItemLines = route.orders.reduce((acc, o) => acc + o.items.length, 0);
  const loadedCount = Object.keys(loadedSkuMap).length;
  const isAllLoaded = loadedCount >= totalItemLines && totalItemLines > 0;

  const handleToggleItem = (key: string) => {
    setLoadedSkuMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleScanBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scanInput.trim().toUpperCase();
    if (!query) return;

    let matchedKey: string | null = null;
    allStops.forEach((stop) => {
      stop.items.forEach((item, iIdx) => {
        if (item.sku.toUpperCase() === query || stop.trackingNumber.toUpperCase() === query) {
          matchedKey = `${stop.id}-${item.sku}-${iIdx}`;
        }
      });
    });

    if (matchedKey) {
      setLoadedSkuMap((prev) => ({ ...prev, [matchedKey!]: true }));
      setFeedbackMsg(`✓ Verified & Loaded: ${query}`);
      setScanInput('');
      setTimeout(() => setFeedbackMsg(''), 2500);
    } else {
      setFeedbackMsg(`⚠️ SKU or Tracking #${query} not found on this manifest.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleQuickLoadAll = () => {
    const fullMap: Record<string, boolean> = {};
    allStops.forEach((stop) => {
      stop.items.forEach((item, iIdx) => {
        fullMap[`${stop.id}-${item.sku}-${iIdx}`] = true;
      });
    });
    setLoadedSkuMap(fullMap);
  };

  const handleCompleteLoading = () => {
    onConfirmLoaded(route.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: brandTheme.primaryColour }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl text-white shadow-md"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                Warehouse Staging & Van Loading
              </span>
              <h3 className="text-base font-black tracking-tight">{route.routeNumber}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Barcode Scanner Bar */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleScanBarcode} className="flex-1 w-full flex gap-2">
            <input
              type="text"
              placeholder="Scan Barcode / Enter SKU (e.g. FAS-5M-ANT or KAL-889101)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="flex-1 text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 uppercase"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow transition"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              Scan SKU
            </button>
          </form>

          <button
            onClick={handleQuickLoadAll}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Quick Verify All
          </button>
        </div>

        {feedbackMsg && (
          <div className={`px-4 py-2 text-xs font-bold ${
            feedbackMsg.startsWith('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
          }`}>
            {feedbackMsg}
          </div>
        )}

        {/* Loading Sequence (LIFO / Reverse Order) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              LIFO Loading Order (Last Stop First into Van):
            </span>
            <span className="font-black text-slate-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {loadedCount} / {totalItemLines} Items Verified
            </span>
          </div>

          <div className="space-y-3">
            {allStops.map((stop, sIdx) => {
              const stopNum = allStops.length - sIdx;
              return (
                <div key={stop.id} className="p-3.5 rounded-2xl bg-slate-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                        #{stopNum}
                      </span>
                      <span className="font-bold text-slate-900">{stop.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({stop.trackingNumber})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">{stop.postcode}</span>
                  </div>

                  <div className="space-y-1.5">
                    {stop.items.map((item, iIdx) => {
                      const itemKey = `${stop.id}-${item.sku}-${iIdx}`;
                      const isLoaded = !!loadedSkuMap[itemKey];

                      return (
                        <div
                          key={iIdx}
                          onClick={() => handleToggleItem(itemKey)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                            isLoaded
                              ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                              : 'bg-white hover:bg-slate-100 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isLoaded}
                              onChange={() => {}}
                              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                              <span className="font-mono font-black text-[#0072CE] text-[11px] mr-2">
                                {item.sku}
                              </span>
                              <span className="font-medium text-slate-800">{item.name}</span>
                            </div>
                          </div>

                          <span className="font-black text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-900 border border-gray-300">
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isAllLoaded ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> All heavy goods staged & verified for departure.
              </span>
            ) : (
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Staging in progress ({totalItemLines - loadedCount} remaining).
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteLoading}
              className="px-5 py-2.5 text-xs font-black text-white rounded-xl shadow transition flex items-center gap-1.5"
              style={{ backgroundColor: brandTheme.secondaryColour }}
            >
              <Truck className="w-4 h-4" />
              Confirm Van Loaded & Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
