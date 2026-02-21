import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function PaymentsPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "settings", "app");
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    };

    fetchData();
  }, []);

  const toggle = (key) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setLoading(true);

    const ref = doc(db, "settings", "app");

    const offerEnabled = !!data.globalOfferEnabled;
    const offerPercent = offerEnabled ? data.globalOfferPercent || "0" : "0";
    const offerName = offerEnabled ? data.globalOfferName || "" : "";

    const freeDeliveryEnabled = !!data.freeDeliveryEnabled;
    const freeDeliveryThreshold = freeDeliveryEnabled
      ? Number(data.freeDeliveryThreshold) || 0
      : 0;

    await updateDoc(ref, {
      bKash: !!data.bKash,
      Nagad: !!data.Nagad,
      cod: !!data.cod,
      deliveryChargeEnabled: !!data.deliveryChargeEnabled,
      globalOfferEnabled: offerEnabled,
      globalOfferName: offerName,
      globalOfferPercent: offerPercent,
      freeDeliveryEnabled,
      freeDeliveryThreshold,
    });

    setLoading(false);
    alert("✅ Payment settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payment Methods</h2>

      {/* Payment Toggles */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { key: "bKash", label: "bKash" },
          { key: "Nagad", label: "Nagad" },
          { key: "cod", label: "Cash on Delivery" },
          { key: "deliveryChargeEnabled", label: "Delivery Charge Enabled" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-xl bg-white/70 border"
          >
            <span className="font-medium">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!data[item.key]}
                onChange={() => toggle(item.key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-black"></div>
              <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Rest of JSX unchanged */}
      {/* (Free Delivery + Global Offer sections same as yours) */}

      <button
        onClick={save}
        disabled={loading}
        className="w-full rounded-xl bg-black text-white py-3 hover:opacity-90 transition"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
