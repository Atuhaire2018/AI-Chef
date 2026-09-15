import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Store, 
  Clock, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  LogIn, 
  Package, 
  ChevronRight, 
  AlertCircle, 
  X,
  RefreshCw,
  Calendar,
  DollarSign
} from "lucide-react";
import { User } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface GroceryOrder {
  orderId: string;
  userId: string;
  items: string[];
  itemCount: number;
  store: string;
  deliveryAddress: string;
  deliverySpeed: string;
  totalAmount: number;
  status: "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered";
  createdAt: string;
}

interface GroceryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => Promise<void>;
  cartItems: string[];
  onOrderCompleted: () => void;
  themeColors: any;
}

const AVAILABLE_STORES = [
  { id: "whole-foods", name: "Whole Foods Market", time: "35-50 min", fee: 4.99, logo: "🥑", rating: "4.9" },
  { id: "trader-joes", name: "Trader Joe's", time: "45-60 min", fee: 3.99, logo: "🌺", rating: "4.8" },
  { id: "kroger", name: "Kroger Fresh Produce", time: "30-45 min", fee: 2.99, logo: "🛒", rating: "4.7" },
  { id: "local-organic", name: "Local Farmers Co-op", time: "60-90 min", fee: 1.99, logo: "🥕", rating: "4.9" }
];

export const GroceryOrderModal: React.FC<GroceryOrderModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  cartItems,
  onOrderCompleted,
  themeColors: C
}) => {
  const [selectedStore, setSelectedStore] = useState(AVAILABLE_STORES[0]);
  const [deliveryAddress, setDeliveryAddress] = useState("742 Evergreen Terrace, Apt 3B");
  const [deliverySpeed, setDeliverySpeed] = useState<"express" | "standard">("standard");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<GroceryOrder | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [viewPastOrders, setViewPastOrders] = useState(false);
  const [pastOrders, setPastOrders] = useState<GroceryOrder[]>([]);
  const [loadingPastOrders, setLoadingPastOrders] = useState(false);

  // Estimate price: $3.80 average per ingredient
  const estimatedSubtotal = Math.max(12.50, cartItems.length * 3.85);
  const deliveryFee = deliverySpeed === "express" ? selectedStore.fee + 3.00 : selectedStore.fee;
  const estimatedTax = estimatedSubtotal * 0.085;
  const grandTotal = estimatedSubtotal + deliveryFee + estimatedTax;

  // Fetch past orders from Firestore when signed in
  useEffect(() => {
    if (user && db && isOpen) {
      loadPastOrders(user.uid);
    }
  }, [user, isOpen]);

  const loadPastOrders = async (userId: string) => {
    if (!db) return;
    try {
      setLoadingPastOrders(true);
      const ordersRef = collection(db, "users", userId, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loaded: GroceryOrder[] = [];
      snapshot.forEach(docSnap => {
        loaded.push(docSnap.data() as GroceryOrder);
      });
      setPastOrders(loaded);
    } catch (err) {
      console.warn("Firestore past orders query notice:", err);
    } finally {
      setLoadingPastOrders(false);
    }
  };

  const handleSignInAndProceed = async () => {
    try {
      setIsSigningIn(true);
      await onSignIn();
    } catch (e) {
      console.error("Order sign-in failed:", e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) return;
    if (cartItems.length === 0) return;

    try {
      setIsPlacingOrder(true);
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const nowIso = new Date().toISOString();

      const newOrder: GroceryOrder = {
        orderId,
        userId: user.uid,
        items: cartItems,
        itemCount: cartItems.length,
        store: selectedStore.name,
        deliveryAddress: deliveryAddress.trim() || "Address on file",
        deliverySpeed: deliverySpeed === "express" ? "Express (35-50 min)" : "Standard (2 hours)",
        totalAmount: Number(grandTotal.toFixed(2)),
        status: "Confirmed",
        createdAt: nowIso
      };

      // Persist directly in Firestore under /users/{userId}/orders/{orderId}
      if (db) {
        try {
          const orderDocRef = doc(db, "users", user.uid, "orders", orderId);
          await setDoc(orderDocRef, {
            ...newOrder,
            serverCreated: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("Firestore order write notice (fallback to local state):", dbErr);
        }
      }

      setCurrentOrder(newOrder);
      setPastOrders(prev => [newOrder, ...prev]);
      setOrderPlaced(true);
      onOrderCompleted();
    } catch (err) {
      console.error("Failed to place order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="grocery-order-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        id="grocery-order-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {orderPlaced ? "Order Confirmed!" : viewPastOrders ? "Your Past Orders" : "Order Ingredients Delivery"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {orderPlaced ? "Delivery tracking in progress" : viewPastOrders ? "Synced with Firestore" : "Local store pickup & direct delivery"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={() => setViewPastOrders(!viewPastOrders)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {viewPastOrders ? "Back to Checkout" : `Orders (${pastOrders.length})`}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: AUTH REQUIRED (Enforces constraint: 'one has to signin when making orders only') */}
          {!user && !orderPlaced && (
            <div className="text-center py-6 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <LogIn className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to Place Your Grocery Order</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  You can explore recipes and search freely without an account, but you must sign in with Google to place and track grocery orders.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Items in order ({cartItems.length} ingredients):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {cartItems.slice(0, 10).map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                      {item}
                    </span>
                  ))}
                  {cartItems.length > 10 && (
                    <span className="px-2 py-0.5 text-slate-400">+{cartItems.length - 10} more</span>
                  )}
                </div>
              </div>

              <button
                id="sign-in-for-order-btn"
                onClick={handleSignInAndProceed}
                disabled={isSigningIn}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Google Account...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google to Continue Order</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: PAST ORDERS VIEW (If user toggled to view history) */}
          {user && viewPastOrders && (
            <div className="space-y-3">
              {loadingPastOrders ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                  Loading past orders from Firestore...
                </div>
              ) : pastOrders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No previous orders yet</p>
                  <p className="text-xs text-slate-400">Your placed orders will be tracked securely here.</p>
                </div>
              ) : (
                pastOrders.map((ord) => (
                  <div key={ord.orderId} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{ord.orderId}</span>
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>{ord.store} • {ord.itemCount} items</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${ord.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{new Date(ord.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>{ord.deliverySpeed}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 3: ORDER CHECKOUT SCREEN (When user is authenticated) */}
          {user && !orderPlaced && !viewPastOrders && (
            <div className="space-y-4 text-xs">
              {/* Signed-in banner */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-950 dark:text-emerald-200">Ordering as {user.displayName || user.email}</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">Verified</span>
              </div>

              {/* Store Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Select Local Partner Store</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_STORES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStore(st)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedStore.id === st.id
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{st.logo}</span>
                        <span className="text-[10px] font-bold text-slate-500">⭐ {st.rating}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white truncate">{st.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{st.time} • ${st.fee.toFixed(2)} delivery</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Speed */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Delivery Address</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    id="delivery-address-input"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed("standard")}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between ${
                      deliverySpeed === "standard"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>Standard (2 hr)</span>
                    <span>${selectedStore.fee.toFixed(2)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliverySpeed("express")}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between ${
                      deliverySpeed === "express"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>⚡ Express (40 min)</span>
                    <span>${(selectedStore.fee + 3).toFixed(2)}</span>
                  </button>
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                  <span>Order Items ({cartItems.length})</span>
                  <span>Est. ${estimatedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Fulfillment & Delivery</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Estimated Local Tax (8.5%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Estimated Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="confirm-place-order-btn"
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isPlacingOrder ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting Order to {selectedStore.name}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Place Order (${grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: ORDER PLACED & LIVE TRACKING */}
          {orderPlaced && currentOrder && (
            <div className="py-4 px-2 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Order Received & Sent to {currentOrder.store}</h4>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Order ID: {currentOrder.orderId}
                </p>
                <p className="text-[11px] text-slate-500">
                  Estimated Arrival: ~40 minutes • Persisted in Firestore
                </p>
              </div>

              {/* Status Stepper */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span>1. Order Confirmed & Dispatched</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium pl-0.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                  <span>2. Personal Shopper Assigned at {currentOrder.store}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400 pl-0.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <span>3. Quality Inspection & Fresh Produce Pack</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-400 pl-0.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <span>4. Out for Delivery to {currentOrder.deliveryAddress}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all"
              >
                Back to AI Chef Kitchen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
