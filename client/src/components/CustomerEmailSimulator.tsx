import React, { useState } from 'react';
import { CustomerNotificationEmail, Order, BrandTheme, Depot, DeliveryRoute, Driver, LeaveSafePreference } from '../types';
import { CustomerTrackingSubsite } from './CustomerTrackingSubsite';
import {
  Mail,
  Search,
  Calendar,
  MapPin,
  ShieldAlert,
  Home,
  ExternalLink,
  ChevronRight,
  Truck,
  Send,
  Warehouse,
  Smartphone
} from 'lucide-react';

interface Props {
  emails: CustomerNotificationEmail[];
  orders: Order[];
  depots: Depot[];
  routes: DeliveryRoute[];
  drivers: Driver[];
  brandTheme: BrandTheme;
  initialOrderId?: string;
  onSendNewEmail?: (orderId: string, type: CustomerNotificationEmail['type']) => void;
  onUpdateOrderLeaveSafe: (orderId: string, preference: LeaveSafePreference) => void;
  onRescheduleOrder: (orderId: string, targetDate: string, reason?: string) => void;
  onBackToAdmin: () => void;
  onSwitchToDriver?: (driverId: string) => void;
}

export const CustomerEmailSimulator: React.FC<Props> = ({
  emails,
  orders,
  depots,
  routes,
  drivers,
  brandTheme,
  initialOrderId,
  onSendNewEmail,
  onUpdateOrderLeaveSafe,
  onRescheduleOrder,
  onBackToAdmin,
  onSwitchToDriver,
}) => {
  // Select active email by order ID or default to first email
  const defaultEmailId = initialOrderId
    ? emails.find((e) => e.orderId === initialOrderId)?.id || emails[0]?.id
    : emails[0]?.id;

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(defaultEmailId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewingSubsite, setIsViewingSubsite] = useState(false);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];
  const relatedOrder = selectedEmail
    ? orders.find((o) => o.id === selectedEmail.orderId) || orders.find((o) => o.trackingNumber === selectedEmail.trackingNumber)
    : orders[0];

  const currentDepot = relatedOrder
    ? depots.find((d) => d.id === relatedOrder.depotId) || depots[0]
    : depots[0];

  const filteredEmails = emails.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.trackingNumber.toLowerCase().includes(q) ||
      e.recipientName.toLowerCase().includes(q) ||
      e.recipientEmail.toLowerCase().includes(q)
    );
  });

  // Handle opening subsite for an order
  const handleOpenSubsiteForOrder = (_order?: Order) => {
    setIsViewingSubsite(true);
  };

  // If subsite view is active, render the dedicated CustomerTrackingSubsite
  if (isViewingSubsite && relatedOrder) {
    return (
      <CustomerTrackingSubsite
        order={relatedOrder}
        depots={depots}
        routes={routes}
        drivers={drivers}
        brandTheme={brandTheme}
        onUpdateOrderLeaveSafe={onUpdateOrderLeaveSafe}
        onRescheduleOrder={onRescheduleOrder}
        onBackToEmailInbox={() => setIsViewingSubsite(false)}
        onBackToAdmin={onBackToAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      
      {/* Top Simulator Control Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight">Customer Email & Web Tracking Simulator</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Customer Perspective ✉️
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simulate transactional delivery emails and test the customer tracking portal, leave-safe requests, and reschedule flows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Trigger: Simulate Email for another order */}
          {onSendNewEmail && orders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-300 font-bold">Generate Email for:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onSendNewEmail(e.target.value, 'DISPATCH_ADVANCE');
                    setSelectedEmailId(`email-${Date.now()}`);
                  }
                }}
                defaultValue=""
                className="bg-slate-900 text-white text-xs font-bold rounded-lg border-0 focus:ring-1 focus:ring-blue-500 py-1 pl-2 pr-6 cursor-pointer"
              >
                <option value="" disabled>Select active order...</option>
                {orders.slice(0, 8).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.trackingNumber} ({o.customerName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Persona Switchers */}
          <button
            onClick={onBackToAdmin}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
          >
            <Warehouse className="w-3.5 h-3.5 text-blue-400" />
            Dispatch Hub 🏢
          </button>

          {onSwitchToDriver && drivers.length > 0 && (
            <button
              onClick={() => onSwitchToDriver(drivers[0].id)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Truck className="w-3.5 h-3.5 text-white" />
              Driver App 🚚
            </button>
          )}
        </div>
      </header>

      {/* DUAL-PANE EMAIL CLIENT LAYOUT */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 overflow-hidden">
        
        {/* LEFT PANE: INBOX LIST */}
        <div className="w-full sm:w-80 lg:w-96 bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          
          <div className="p-4 border-b border-gray-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h2 className="font-black text-sm text-slate-900">Simulated Inbox</h2>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                {filteredEmails.length} messages
              </span>
            </div>

            {/* Inbox Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracking or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No simulated emails found.
              </div>
            ) : (
              filteredEmails.map((em) => {
                const isSelected = em.id === selectedEmail?.id;
                return (
                  <button
                    key={em.id}
                    onClick={() => setSelectedEmailId(em.id)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 border-l-4 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-blue-600'
                        : 'hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[160px]">
                        {em.recipientName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{em.sentAt}</span>
                    </div>

                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {em.subject}
                    </span>

                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                        {em.trackingNumber}
                      </span>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        em.type === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-100 text-blue-800'
                          : em.type === 'SAFE_PLACE_CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : em.type === 'RESCHEDULED_CONFIRMED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {em.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: RICH HTML EMAIL VIEWER */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          
          {selectedEmail && relatedOrder ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              
              {/* Email Envelope Header */}
              <div className="p-6 border-b border-gray-200 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedEmail.subject}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Received: Today at {selectedEmail.sentAt}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs font-mono">
                  <div>
                    <strong className="text-slate-900">From:</strong> Kalsi Logistics &lt;dispatch@{brandTheme.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.uk&gt;
                  </div>
                  <div>
                    <strong className="text-slate-900">To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;
                  </div>
                </div>
              </div>

              {/* EMAIL BODY CANVAS */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 bg-slate-50/30">
                <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  
                  {/* Branded Email Header */}
                  <div
                    className="p-6 text-white flex items-center justify-between"
                    style={{ backgroundColor: brandTheme.primaryColour }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="px-3 py-1 rounded-xl text-white font-black text-base uppercase shadow"
                        style={{ backgroundColor: brandTheme.secondaryColour }}
                      >
                        {brandTheme.logoText}
                      </div>
                      <span className="text-xs font-bold text-slate-300">Dispatch Notification</span>
                    </div>

                    <span className="font-mono text-xs font-bold text-amber-300">
                      #{relatedOrder.trackingNumber}
                    </span>
                  </div>

                  {/* Main Email Content */}
                  <div className="p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        Hello {relatedOrder.customerName},
                      </h4>
                      <p className="mt-1 text-slate-600">
                        Your building products consignment has been dispatched from our <strong>{currentDepot.name}</strong>.
                      </p>
                    </div>

                    {/* Delivery Slot Banner */}
                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-bold text-blue-950 uppercase">
                        <span>Scheduled Delivery Window</span>
                        <span className="font-mono text-blue-700">Today</span>
                      </div>
                      <div className="text-lg font-black text-blue-950">
                        08:30 AM – 12:00 PM
                      </div>
                      <div className="text-slate-600 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{relatedOrder.address}, {relatedOrder.postcode}</span>
                      </div>
                    </div>

                    {/* AGE VERIFICATION CHALLENGE 25 NOTICE */}
                    {relatedOrder.requiresAgeVerification && (
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-1">
                        <span className="font-black text-xs text-amber-900 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-amber-700" /> 18+ Age Verification Required on Delivery
                        </span>
                        <p className="text-[11px] text-amber-900">
                          This order contains regulated chemical solvent products. A valid photo ID confirming 18+ (*UK Driving Licence or Passport*) will be visually inspected upon arrival. (No ID photographs are captured).
                        </p>
                      </div>
                    )}

                    {/* PRIMARY ACTION CTA BUTTON: OPEN LIVE SUBSITE */}
                    <div className="py-2 text-center space-y-2">
                      <button
                        onClick={() => handleOpenSubsiteForOrder(relatedOrder)}
                        className="w-full py-4 px-6 rounded-2xl text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                        style={{ backgroundColor: brandTheme.secondaryColour }}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Track Van on Live Subsite & Manage Options</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Opens customer tracking portal • Specify safe place or reschedule delivery in-flight.
                      </p>
                    </div>

                    {/* QUICK IN-EMAIL IN-FLIGHT ACTION BUTTONS */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Need to adjust your delivery before arrival?
                      </span>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleOpenSubsiteForOrder(relatedOrder)}
                          className="p-3 bg-slate-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-2xl text-left transition flex items-center justify-between text-xs font-bold text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-emerald-600" />
                            <span>Leave in Safe Place</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <button
                          onClick={() => handleOpenSubsiteForOrder(relatedOrder)}
                          className="p-3 bg-slate-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-2xl text-left transition flex items-center justify-between text-xs font-bold text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            <span>Reschedule Date</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Consignment Items ({relatedOrder.items.length})
                      </span>

                      <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-slate-50/50">
                        {relatedOrder.items.map((it, idx) => (
                          <div key={idx} className="p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-900 block">{it.name || it.sku}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-500 font-bold">{it.sku}</span>
                                {it.requiresAgeVerification && (
                                  <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded border border-amber-300">
                                    18+ ID
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border">
                              {it.quantity} units
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email Footer */}
                    <div className="border-t border-gray-200 pt-4 text-[11px] text-slate-400 text-center space-y-1">
                      <p>
                        {brandTheme.companyName} • Direct-to-Site Logistics • {currentDepot.name}
                      </p>
                      <p>
                        This is an automated transactional notification. For help call 0800 123 4567.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <Mail className="w-12 h-12 text-slate-300" />
              <h4 className="font-bold text-slate-700 text-sm">Select a simulated customer email</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose an email from the left inbox or use the dropdown above to generate a new dispatch notification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
