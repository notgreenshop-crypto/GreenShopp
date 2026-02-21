import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// ✅ Unified offer-aware price and percent calculator
const calculateOffer = (product, settings) => {
  const price = Number(product.price || 0);
  const offerPrice = Number(product.offerPrice || 0);
  const offerPercent = Number(product.offerPercent || 0);
  const globalPercent =
    settings?.globalOfferEnabled && settings?.globalOfferPercent
      ? Number(settings.globalOfferPercent)
      : 0;

  let finalPrice = price;
  let finalPercent = 0;

  if (offerPrice > 0) {
    finalPrice = offerPrice;
    finalPercent = Math.round(((price - offerPrice) / price) * 100);
  } else if (offerPercent > 0) {
    finalPrice = Math.round(price * (100 - offerPercent) / 100);
    finalPercent = offerPercent;
  } else if (globalPercent > 0) {
    finalPrice = Math.round(price * (100 - globalPercent) / 100);
    finalPercent = globalPercent;
  }

  return { finalPrice, finalPercent };
};

const ProductPage = ({ product, setCurrentPage, addToCart }) => {
  const [settings, setSettings] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [errors, setErrors] = useState({ size: false, color: false });
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const successRef = useRef(null);

  // ✅ Fetch settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  // ✅ Preload all product images
  useEffect(() => {
    if (product?.images) {
      product.images.forEach((imgSrc, index) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          setImagesLoaded((prev) => ({ ...prev, [index]: true }));
        };
      });
    }
  }, [product]);

  if (!product)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );

  // ✅ Calculate final offer price and percent
  const { finalPrice, finalPercent } = calculateOffer(product, settings);
  const basePrice = Number(product.price || 0);
  const hasDiscount = finalPrice < basePrice;

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );

  const validateSelection = () => {
    const newErrors = {
      size: !selectedSize,
      color: !selectedColor,
    };
    setErrors(newErrors);
    return !newErrors.size && !newErrors.color;
  };

  const handleAddToCart = () => {
    if (validateSelection()) {
      addToCart(product, selectedSize, selectedColor);
      setShowSuccess(true);
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleOrderNow = () => {
    if (validateSelection()) {
      addToCart(product, selectedSize, selectedColor);
      setCurrentPage("cart");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn">
      <button
        onClick={() => setCurrentPage("home")}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all hover:gap-3"
      >
        <ChevronLeft size={20} /> Back to Products
      </button>

      {/* ✅ Success Alert */}
      {showSuccess && (
        <div
          ref={successRef}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-slideInDown flex items-center gap-2 sticky top-0 z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Added to cart successfully!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* 🖼️ Product Images */}
        <div className="relative animate-slideInLeft">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl relative">
            {!imagesLoaded[currentImageIndex] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imagesLoaded[currentImageIndex] ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>

          {/* Image Navigation */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white transition-all hover:scale-110 shadow-lg"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 🧾 Product Details */}
        <div className="bg-white/40 rounded-2xl p-6 shadow-xl animate-slideInRight">
          {/* Price Section */}
          <div className="flex justify-between items-start relative">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    ৳{finalPrice}
                  </span>
                  <span className="text-red-500 text-sm line-through mt-1">
                    ৳{basePrice}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ৳{basePrice}
                </span>
              )}
            </div>

            {finalPercent > 0 && (
              <div className="bg-black text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm absolute top-0 right-0 transform translate-x-1 translate-y-2">
                {finalPercent}% OFF
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {product.name}
          </h1>

          <p className="text-gray-500 text-sm mt-1">Code: {product.code}</p>
          <p className="text-sm text-gray-600 mt-3">• Stock: {product.stock} pcs</p>
          <p className="text-gray-600 mt-3">{product.description}</p>

          {/* Size & Color */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">
              Select Size{" "}
              {errors.size && <span className="text-red-500 text-sm ml-2">* Required</span>}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setErrors({ ...errors, size: false });
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedSize === size
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">
              Select Color{" "}
              {errors.color && <span className="text-red-500 text-sm ml-2">* Required</span>}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setErrors({ ...errors, color: false });
                  }}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedColor === color
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-white border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Add to Cart
            </button>
            <button
              onClick={handleOrderNow}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
