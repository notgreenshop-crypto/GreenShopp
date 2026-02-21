import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// ✅ Offer-aware price calculator
const getEffectivePrice = (product, settings) => {
  const base = Number(product.price || 0);
  const offerPrice = Number(product.offerPrice || 0);
  const offerPercent = Number(product.offerPercent || 0);
  const globalPercent =
    settings?.globalOfferEnabled && settings?.globalOfferPercent
      ? Number(settings.globalOfferPercent)
      : 0;

  // Priority: offerPrice > offerPercent > globalOfferPercent
  if (offerPrice > 0) return offerPrice;
  const discount = offerPercent > 0 ? offerPercent : globalPercent;
  return discount > 0 ? Math.round((base * (100 - discount)) / 100) : base;
};

const ProductCard = ({ product, setSelectedProduct, setCurrentPage }) => {
  const [settings, setSettings] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  const handleClick = () => {
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  if (!settings)
    return (
      <div className="animate-pulse bg-white/40 rounded-2xl h-64 w-full border border-white/50" />
    );

  const basePrice = Number(product.price || 0);
  const effectivePrice = getEffectivePrice(product, settings);
  const hasDiscount = effectivePrice < basePrice;

  // ✅ Correct discount %
  let discountPercent = 0;
  if (product.offerPrice && basePrice > 0) {
    discountPercent = Math.round(((basePrice - product.offerPrice) / basePrice) * 100);
  } else if (product.offerPercent && product.offerPercent > 0) {
    discountPercent = Number(product.offerPercent);
  } else if (
    (!product.offerPercent || product.offerPercent === 0) &&
    settings.globalOfferEnabled &&
    settings.globalOfferPercent > 0
  ) {
    discountPercent = Number(settings.globalOfferPercent);
  }

  return (
    <div
      onClick={handleClick}
      className="relative bg-white/40 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50 transform hover:scale-105 hover:-translate-y-1"
    >
      {/* 🖼️ Product Image */}
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-500">Image not available</span>
          </div>
        )}

        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/300?text=No+Image"
          }
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
      </div>

      {/* 🏷️ Product Info */}
      <div className="p-3 sm:p-4 relative">
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{product.code}</p>

        {/* 💰 Price Section */}
        <div className="mt-3 flex items-center justify-between relative">
          {hasDiscount ? (
            <>
              <div className="relative flex flex-col items-start">
                {/* Old Price */}
                <span className="text-red-500 text-xs line-through absolute -top-3 left-0 opacity-90">
                  ৳{basePrice}
                </span>

                {/* New Price */}
                <span className="text-gray-900 font-bold text-xl sm:text-2xl leading-tight">
                  ৳{effectivePrice}
                </span>
              </div>

              {/* 🔖 Percentage Badge */}
              {discountPercent > 0 && (
                <div
                  className="bg-black text-white text-[11px] font-semibold px-2 py-[3px] rounded-md shadow-sm animate-pulse"
                  style={{ top: "50%", right: "0", transform: "translateY(-50%)" }}
                >
                  {discountPercent}% OFF
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-900 font-semibold text-lg sm:text-xl">
              ৳{basePrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
