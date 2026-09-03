import React, { useState } from 'react';
import { DeliveryRoute } from '../types';
import {
  Barcode,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Props {
  route: DeliveryRoute;
  brandTheme?: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLoaded: (routeId: string) => void;
}

export const ScanToVanModal: React.FC<Props> = ({
  route,
  isOpen,
  onClose,
  onConfirmLoaded,
}) => {
  const lifoOrders = [...route.orders].reverse();
  const [scannedItems, setScannedItems] = useState<Record<string, boolean>>({});
  const [barcodeInput, setBarcodeInput] = useState('');

  if (!isOpen) return null;

  const allItems = lifoOrders.flatMap((o) =>
    o.items.map((it, idx) => ({
      ...it,
      orderId: o.id,
      trackingNumber: o.trackingNumber,
      customerName: o.customerName,
      stopSequence: o.stopSequence || 1,
      uniqueKey: `${o.id}-${it.sku}-${idx}`,
    }))
  );

  const totalItemsCount = allItems.length;
  const loadedCount = allItems.filter((i) => scannedItems[i.uniqueKey]).length;
  const isFullyLoaded = totalItemsCount > 0 && loadedCount === totalItemsCount;

  const handleScanItem = (uniqueKey: string) => {
    setScannedItems((prev) => ({ ...prev, [uniqueKey]: true }));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const target = allItems.find(
      (i) =>
        !scannedItems[i.uniqueKey] &&
        (i.sku.toUpperCase() === barcodeInput.trim().toUpperCase() ||
          i.trackingNumber.toUpperCase() === barcodeInput.trim().toUpperCase())
    );

    if (target) {
      handleScanItem(target.uniqueKey);
      setBarcodeInput('');
    } else {
      alert(`No unscanned goods match "${barcodeInput}". Check SKU code.`);
    }
  };

  const handleScanAllMock = () => {
    const allScanned: Record<string, boolean> = {};
    allItems.forEach((i) => {
      allScanned[i.uniqueKey] = true;
    });
    setScannedItems(allScanned);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-400">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">{route.routeNumber}</h2>
                <span className="bg-blue-600/50 text-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  LIFO Staging
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last In, First Out: First delivery stop sits at the rear van doors for rapid offload.
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

        <div className="bg-slate-100 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-600 block">Van Loading Progress:</span>
            <span className="text-sm font-black text-slate-900">
              {loadedCount} of {totalItemsCount} items scanned ({Math.round((loadedCount / (totalItemsCount || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanAllMock}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border transition flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Auto-Scan All
            </button>
          </div>
        </div>

        <form onSubmit={handleBarcodeSubmit} className="p-4 bg-white border-b border-gray-100 flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Scan barcode or type SKU (e.g. FAS-5M-WHT)..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-mono font-bold bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow hover:bg-black"
          >
            Enter Scan
          </button>
        </form>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {lifoOrders.map((ord, orderIdx) => {
            const isFirstStop = ord.stopSequence === 1;
            return (
              <div
                key={ord.id}
                className={`p-4 rounded-2xl border-2 transition ${
                  isFirstStop
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-gray-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      Stop {ord.stopSequence || orderIdx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{ord.customerName}</span>
                      <span className="text-[10px] text-slate-500 block">{ord.postcode}</span>
                    </div>
                  </div>

                  {isFirstStop && (
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase">
                      🚪 At Van Rear Doors (First Offload)
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {ord.items.map((it, itIdx) => {
                    const uniqueKey = `${ord.id}-${it.sku}-${itIdx}`;
                    const isScanned = scannedItems[uniqueKey];

                    return (
                      <div
                        key={uniqueKey}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                          isScanned
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-gray-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleScanItem(uniqueKey)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                              isScanned
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-gray-300 hover:border-slate-500 bg-white'
                            }`}
                          >
                            {isScanned && '✓'}
                          </button>
                          <div>
                            <span className="font-mono font-bold block">{it.sku}</span>
                            <span className="text-[10px] opacity-75">{it.name || it.description}</span>
                          </div>
                        </div>

                        <span className="font-black px-2 py-0.5 rounded bg-slate-100 border text-[11px]">
                          {it.quantity} units
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>

          <button
            onClick={() => onConfirmLoaded(route.id)}
            disabled={!isFullyLoaded}
            className={`px-6 py-2.5 text-xs font-black rounded-xl shadow transition flex items-center gap-2 ${
              isFullyLoaded
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isFullyLoaded ? 'Confirm Staged & Ready to Roll' : `Scan Remaining (${totalItemsCount - loadedCount} items)`}
          </button>
        </div>
      </div>
    </div>
  );
};
