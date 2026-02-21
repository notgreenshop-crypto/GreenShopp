import React from "react";
import { Trash2, ShoppingBag } from "lucide-react";

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
  return discount > 0 ? Math.round(price * (100 - discount) / 100) : price;
};

// ✅ Merge duplicate cart items
const mergeCartItems = (cart, settings) => {
  const merged = [];
  cart.forEach((item) => {
    const key = `${item.name}_${item.code}_${item.selectedSize}_${item.selectedColor}`;
    const existing = merged.find((x) => x._key === key);
    const effectivePrice = getEffectivePrice(item, settings);

    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += effectivePrice;
    } else {
      merged.push({
        ...item,
        _key: key,
        quantity: 1,
        unitPrice: effectivePrice,
        totalPrice: effectivePrice,
      });
    }
  });
  return merged;
};

const CartPage = ({ cart, removeFromCart, setCurrentPage, settings }) => {
  const mergedCart = mergeCartItems(cart, settings);

  // ✅ Calculate subtotal & quantity
  const subtotal = mergedCart.reduce((acc, i) => acc + i.totalPrice, 0);
  const totalQuantity = mergedCart.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Delivery charge logic (from settings.app)
  const deliveryChargeEnabled = settings?.deliveryChargeEnabled || false;
  const deliveryCharge = deliveryChargeEnabled
    ? Number(settings?.deliveryCharge || 0)
    : 0;

  // ✅ Free delivery system
  const freeDeliveryEnabled = settings?.freeDeliveryEnabled || false;
  const threshold = settings?.freeDeliveryThreshold || 0;
  const remaining = Math.max(0, threshold - subtotal).toFixed(0);
  const progressPercent =
    threshold > 0 ? Math.min((subtotal / threshold) * 100, 100) : 0;

  const freeDeliveryAchieved =
    freeDeliveryEnabled && subtotal >= threshold && threshold > 0;

  // ✅ Calculate grand total
  const grandTotal = freeDeliveryAchieved ? subtotal : subtotal + deliveryCharge;

  // 🛒 Empty cart view
  if (mergedCart.length === 0)
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <button
          onClick={() => setCurrentPage("home")}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          Continue Shopping
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Shopping Cart
      </h1>

      {/* 🧾 Cart Items */}
      <div className="space-y-4 mb-6">
        {mergedCart.map((item) => {
          const itemImage =
            item.images?.[0] ||
            "https://via.placeholder.com/100x100?text=No+Image";
          const unitPrice = item.unitPrice;
          const basePrice = Number(item.price || 0);
          const hasDiscount = unitPrice < basePrice;

          return (
            <div
              key={item._key}
              className="bg-white/40 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/50 animate-slideInUp hover:shadow-xl transition-all"
            >
              <div className="flex gap-4">
                <img
                  src={itemImage}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/100x100?text=No+Image")
                  }
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                    {item.name}{" "}
                    <span className="text-gray-600 text-xs font-medium ml-1">
                      × {item.quantity}
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {item.code || "N/A"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs sm:text-sm text-gray-700">
                    {item.selectedSize && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-gray-900 font-bold text-base">
                          ৳{unitPrice}
                        </span>
                        <span className="text-red-500 text-xs line-through ml-2">
                          ৳{basePrice}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">
                        ৳{unitPrice}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartId)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Order Summary */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/50 animate-slideInUp">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({totalQuantity} items)</span>
            <span className="font-semibold">৳{subtotal}</span>
          </div>

          {/* Delivery charge */}
          {deliveryChargeEnabled && !freeDeliveryAchieved && (
            <div className="flex justify-between text-gray-700">
              <span>Delivery Charge</span>
              <span className="font-semibold">৳{deliveryCharge}</span>
            </div>
          )}

          {/* Free Delivery Status */}
          {freeDeliveryEnabled && threshold > 0 && (
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
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

          <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
            <span>Grand Total</span>
            <span>৳{grandTotal}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setCurrentPage("home")}
            className="flex-1 bg-white border-2 border-gray-900 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => setCurrentPage("checkout")}
            className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
