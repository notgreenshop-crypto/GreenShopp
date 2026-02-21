import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

/* =========================
   OFFER CALCULATOR (SAFE)
========================= */
const calculateOffer = (product, settings) => {
  const price = Number(product?.price || 0);
  const offerPrice = Number(product?.offerPrice || 0);
  const offerPercent = Number(product?.offerPercent || 0);
  const globalPercent =
    settings?.globalOfferEnabled && settings?.globalOfferPercent
      ? Number(settings.globalOfferPercent)
      : 0;

  let finalPrice = price;
  let finalPercent = 0;

  if (price <= 0) return { finalPrice: 0, finalPercent: 0 };

  if (offerPrice > 0 && offerPrice < price) {
    finalPrice = offerPrice;
    finalPercent = Math.round(((price - offerPrice) / price) * 100);
  } else if (offerPercent > 0) {
    finalPrice = Math.round((price * (100 - offerPercent)) / 100);
    finalPercent = offerPercent;
  } else if (globalPercent > 0) {
    finalPrice = Math.round((price * (100 - globalPercent)) / 100);
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

  /* =========================
     FETCH SETTINGS
  ========================= */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  /* =========================
     PRELOAD IMAGES (SAFE)
  ========================= */
  useEffect(() => {
    if (product?.images?.length) {
      product.images.forEach((imgSrc, index) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
          setImagesLoaded((prev) => ({ ...prev, [index]: true }));
        };
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  const images = product?.images || [];
  const sizes = product?.sizes || [];
  const colors = product?.colors || [];

  const { finalPrice, finalPercent } = calculateOffer(product, settings);
  const basePrice = Number(product.price || 0);
  const hasDiscount = finalPrice < basePrice;

  const nextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const validateSelection = () => {
    const newErrors = {
      size: sizes.length ? !selectedSize : false,
      color: colors.length ? !selectedColor : false,
    };
    setErrors(newErrors);
    return !newErrors.size && !newErrors.color;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    addToCart(product, selectedSize, selectedColor);
    setShowSuccess(true);
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleOrderNow = () => {
    if (!validateSelection()) return;
    addToCart(product, selectedSize, selectedColor);
    setCurrentPage("cart");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <button
        onClick={() => setCurrentPage("home")}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft size={20} /> Back to Products
      </button>

      {showSuccess && (
        <div
          ref={successRef}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
        >
          Added to cart successfully!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* IMAGE SECTION */}
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {images.length > 0 && (
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-500 mt-1">Code: {product.code}</p>

          <div className="mt-4">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold">৳{finalPrice}</span>
                <span className="ml-3 text-red-500 line-through">
                  ৳{basePrice}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">৳{basePrice}</span>
            )}

            {finalPercent > 0 && (
              <span className="ml-3 text-sm bg-black text-white px-2 py-1 rounded">
                {finalPercent}% OFF
              </span>
            )}
          </div>

          {/* SIZE */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Select Size</h3>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded border ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR */}
          {colors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Select Color</h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded border ${
                      selectedColor === color
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={handleAddToCart}
              className="w-full border-2 border-black py-3 rounded"
            >
              Add to Cart
            </button>
            <button
              onClick={handleOrderNow}
              className="w-full bg-black text-white py-3 rounded"
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
