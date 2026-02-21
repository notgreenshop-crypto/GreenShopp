import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// ✅ Offer-aware price calculator
const getEffectivePrice = (product, settings) => {
  const price = Number(product.price || 0);
  const offerPrice = Number(product.offerPrice || 0);
  const offerPercent = Number(product.offerPercent || 0);
  const globalPercent = settings?.globalOfferEnabled
    ? Number(settings.globalOfferPercent || 0)
    : 0;

  if (offerPrice > 0) return offerPrice;
  const discount = Math.max(offerPercent, globalPercent);
  return discount > 0 ? Math.round((price * (100 - discount)) / 100) : price;
};

// ✅ Merge duplicate cart items (same name/code/color/size)
const mergeCartItems = (cart, settings) => {
  const merged = [];
  cart.forEach((item) => {
    const key = `${item.name}_${item.code}_${item.selectedSize}_${item.selectedColor}`;
    const existing = merged.find((x) => x._key === key);
    const effectivePrice = getEffectivePrice(item, settings);

    if (existing) {
      existing.quantity += item.quantity || 1;
      existing.totalPrice += effectivePrice * (item.quantity || 1);
    } else {
      merged.push({
        ...item,
        _key: key,
        quantity: item.quantity || 1,
        unitPrice: effectivePrice,
        totalPrice: effectivePrice * (item.quantity || 1),
      });
    }
  });
  return merged;
};

// ✅ Generate WhatsApp order message (merged view)
const generateOrderMessage = (cart, settings, totals, checkoutData) => {
  const mergedCart = mergeCartItems(cart, settings);
  let msg = `*New Order from Fenzo*\n\n`;

  mergedCart.forEach((item, i) => {
    const base = Number(item.price || 0);
    const eff = item.unitPrice;
    const hasOffer = eff < base;
    const priceDisplay = hasOffer ? `~৳${base}~ ৳${eff}` : `৳${eff}`;

    msg += `Product ${i + 1}:\n`;
    msg += `Name: ${item.name || "N/A"}\n`;
    msg += `Code: ${item.code || "N/A"}\n`;
    msg += `Price: ${priceDisplay}\n`;
    if (item.selectedSize) msg += `Size: ${item.selectedSize}\n`;
    if (item.selectedColor) msg += `Color: ${item.selectedColor}\n`;
    msg += `Quantity: ${item.quantity}\n\n`;
  });

  msg += `*Order Summary:*\n`;
  msg += `Subtotal: ৳${totals.subtotal}\n`;
  msg += `Delivery Charge: ৳${totals.deliveryCharge}\n`;
  msg += `Grand Total: ৳${totals.grandTotal}\n\n`;

  msg += `*Customer Info:*\n`;
  msg += `Name: ${checkoutData.name}\n`;
  msg += `Phone: ${checkoutData.phone}\n`;
  msg += `Address: ${checkoutData.address}\n`;
  msg += `Payment Method: ${checkoutData.paymentMethod}\n`;

  if (totals.deliveryCharge === 0 && settings?.freeDeliveryEnabled) {
    msg += "\n🎉 Free Delivery Applied!";
  }

  return msg;
};

const CheckoutPage = ({ cart, checkoutData, setCheckoutData, getTotalPrice }) => {
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    address: false,
    paymentMethod: false,
  });
  const [settings, setSettings] = useState(null);

  // ✅ Firestore থেকে live settings আনছে
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  const validateForm = () => {
    const newErr = {
      name: !checkoutData.name.trim(),
      phone: !checkoutData.phone.trim(),
      address: !checkoutData.address.trim(),
      paymentMethod: !checkoutData.paymentMethod,
    };
    setErrors(newErr);
    return !Object.values(newErr).some(Boolean);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const subtotal = getTotalPrice();
    const freeDeliveryEnabled = settings?.freeDeliveryEnabled || false;
    const threshold = settings?.freeDeliveryThreshold || 0;
    const freeDeliveryAchieved =
      freeDeliveryEnabled && subtotal >= threshold && threshold > 0;

    const deliveryCharge =
      !freeDeliveryAchieved && settings?.deliveryChargeEnabled
        ? Number(settings.deliveryCharge || 0)
        : 0;

    const totals = {
      subtotal,
      deliveryCharge,
      grandTotal: subtotal + deliveryCharge,
    };

    const message = generateOrderMessage(cart, settings, totals, checkoutData);
    const whatsappNumber = settings?.whatsappPrimary || "8801XXXXXXXXX";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (!settings) return <div className="p-8 text-center">Loading settings...</div>;

  const mergedCart = mergeCartItems(cart, settings);
  const subtotal = mergedCart.reduce((acc, i) => acc + i.totalPrice, 0);
  const totalQuantity = mergedCart.reduce((sum, i) => sum + i.quantity, 0);

  const freeDeliveryEnabled = settings?.freeDeliveryEnabled || false;
  const threshold = settings?.freeDeliveryThreshold || 0;
  const freeDeliveryAchieved =
    freeDeliveryEnabled && subtotal >= threshold && threshold > 0;

  const deliveryCharge =
    !freeDeliveryAchieved && settings?.deliveryChargeEnabled
      ? Number(settings.deliveryCharge || 0)
      : 0;

  const grandTotal = subtotal + deliveryCharge;

  // ✅ Payment options
  const paymentMethods = [];
  if (settings.bKash) paymentMethods.push({ id: "bKash", name: "bKash", icon: "📱" });
  if (settings.Nagad) paymentMethods.push({ id: "Nagad", name: "Nagad", icon: "💳" });
  if (settings.cod) paymentMethods.push({ id: "cod", name: "Cash on Delivery", icon: "💵" });

  const remaining = Math.max(0, threshold - subtotal).toFixed(0);
  const progressPercent =
    threshold > 0 ? Math.min((subtotal / threshold) * 100, 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Customer Info + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              {["name", "phone", "address"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {field === "name"
                      ? "Full Name"
                      : field === "phone"
                      ? "Phone Number"
                      : "Delivery Address"}{" "}
                    {errors[field] && <span className="text-red-500">*Required</span>}
                  </label>
                  {field === "address" ? (
                    <textarea
                      rows={3}
                      value={checkoutData[field]}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, [field]: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-lg border-2 resize-none ${
                        errors[field]
                          ? "border-red-300 bg-red-50 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400"
                      }`}
                      placeholder="Enter your complete delivery address"
                    />
                  ) : (
                    <input
                      type={field === "phone" ? "tel" : "text"}
                      value={checkoutData[field]}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, [field]: e.target.value })
                      }
                      placeholder={
                        field === "phone" ? "01XXXXXXXXX" : "Enter your full name"
                      }
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        errors[field]
                          ? "border-red-300 bg-red-50 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Payment Method{" "}
              {errors.paymentMethod && <span className="text-red-500">*Required</span>}
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() =>
                    setCheckoutData({ ...checkoutData, paymentMethod: method.name })
                  }
                  className={`p-4 rounded-lg border-2 font-medium transition-all transform hover:scale-105 ${
                    checkoutData.paymentMethod === method.name
                      ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <div className="text-sm">{method.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {mergedCart.map((item) => {
                const image =
                  item.images?.[0] ||
                  "https://via.placeholder.com/50x50?text=No+Image";
                const base = Number(item.price || 0);
                const eff = item.unitPrice;
                const hasOffer = eff < base;

                return (
                  <div key={item._key} className="flex gap-3 text-sm">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/50x50?text=No+Image")
                      }
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 line-clamp-1">
                        {item.name}{" "}
                        <span className="text-gray-600 text-xs ml-1">
                          × {item.quantity}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.selectedSize} · {item.selectedColor}
                      </p>
                      <div className="mt-1">
                        {hasOffer ? (
                          <>
                            <span className="text-gray-900 font-semibold text-base">
                              ৳{eff}
                            </span>
                            <span className="text-red-500 text-xs line-through ml-2">
                              ৳{base}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 font-semibold text-base">
                            ৳{base}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({totalQuantity} items)</span>
                <span className="font-semibold">৳{subtotal}</span>
              </div>

              {/* Free Delivery / Delivery Charge */}
              {freeDeliveryEnabled && threshold > 0 && (
                <div className="bg-blue-50 px-3 py-2 rounded-lg mb-2">
                  {subtotal < threshold ? (
                    <>
                      <p className="text-xs text-blue-700">
                        Add ৳{remaining} more for free delivery! 🚚
                      </p>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-green-700 font-semibold">
                      🎉 You got Free Delivery!
                    </p>
                  )}
                </div>
              )}

              {!freeDeliveryAchieved && deliveryCharge > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className="font-semibold">৳{deliveryCharge}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>৳{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
