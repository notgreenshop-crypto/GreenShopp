import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

// 🧠 Clean unified offer calculator (final fix)
const getOfferDetails = (product, settings) => {
  const basePrice = Number(product.price || 0);
  const offerPrice = Number(product.offerPrice || 0);
  const offerPercent = Number(product.offerPercent || 0);
  const globalEnabled = settings?.globalOfferEnabled || false;
  const globalPercent = Number(settings?.globalOfferPercent || 0);

  let finalPrice = basePrice;
  let finalPercent = 0;

  // ✅ 1️⃣ Individual offerPrice → highest priority
  if (offerPrice > 0 && offerPrice < basePrice) {
    finalPrice = offerPrice;
    finalPercent = Math.round(((basePrice - offerPrice) / basePrice) * 100);
  }

  // ✅ 2️⃣ Individual offerPercent → 2nd priority
  else if (offerPercent > 0 && offerPercent < 100) {
    finalPercent = offerPercent;
    finalPrice = Math.round(basePrice * (100 - offerPercent) / 100);
  }

  // ✅ 3️⃣ Global offer → only if no individual offers
  else if (globalEnabled && globalPercent > 0 && globalPercent < 100) {
    finalPercent = globalPercent;
    finalPrice = Math.round(basePrice * (100 - globalPercent) / 100);
  }

  // ✅ 4️⃣ No offer → fallback
  else {
    finalPrice = basePrice;
    finalPercent = 0;
  }

  return { finalPrice, finalPercent };
};

const HomePage = ({ setSelectedProduct, setCurrentPage }) => {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load Active Products
  useEffect(() => {
    const q = query(collection(db, "products"), where("isActive", "==", true));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(fetched);
      setLoading(false);
    });
    return () => unsubProducts();
  }, []);

  // 🔹 Load Settings (for global offer)
  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsubSettings();
  }, []);

  if (loading || !settings) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product, index) => {
            const { finalPrice, finalPercent } = getOfferDetails(product, settings);

            return (
              <div
                key={product.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard
                  product={{
                    ...product,
                    finalPrice,
                    finalPercent,
                  }}
                  setSelectedProduct={setSelectedProduct}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;
