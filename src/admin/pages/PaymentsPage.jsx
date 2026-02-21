import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function PaymentsPage() {
  const ref = doc(db, "settings", "app");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    })();
  }, []);

  const toggle = (key) => setData({ ...data, [key]: !data[key] });

  const save = async () => {
    setLoading(true);

    const offerEnabled = !!data.globalOfferEnabled;
    const offerPercent = offerEnabled ? data.globalOfferPercent || "0" : "0";
    const offerName = offerEnabled ? data.globalOfferName || "" : "";

    const freeDeliveryEnabled = !!data.freeDeliveryEnabled;
    const freeDeliveryThreshold = freeDeliveryEnabled
      ? Number(data.freeDeliveryThreshold) || 0
      : 0;

    await updateDoc(ref, {
      bKash: data.bKash,
      Nagad: data.Nagad,
      cod: data.cod,
      deliveryChargeEnabled: data.deliveryChargeEnabled,
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
              <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Free Delivery Section */}
      <div className="border rounded-xl bg-white/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-700">Free Delivery</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.freeDeliveryEnabled}
              onChange={() => toggle("freeDeliveryEnabled")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
            <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
          </label>
        </div>

        <div
          className={`space-y-2 transition-opacity ${
            data.freeDeliveryEnabled ? "opacity-100" : "opacity-50"
          }`}
        >
          <p className="text-sm text-gray-500">
            Minimum total amount required for free delivery.
          </p>
          <input
            type="number"
            disabled={!data.freeDeliveryEnabled}
            className={`w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 ${
              !data.freeDeliveryEnabled
                ? "cursor-not-allowed bg-gray-100"
                : ""
            }`}
            placeholder="Enter amount (e.g., 1500)"
            value={data.freeDeliveryThreshold || ""}
            onChange={(e) =>
              setData({ ...data, freeDeliveryThreshold: e.target.value })
            }
          />
        </div>
      </div>

      {/* Global Offer Section */}
      <div className="border rounded-xl bg-white/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-700">Global Offer</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!data.globalOfferEnabled}
              onChange={() => toggle("globalOfferEnabled")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
            <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
          </label>
        </div>

        <div
          className={`space-y-3 transition-opacity ${
            data.globalOfferEnabled ? "opacity-100" : "opacity-50"
          }`}
        >
          <input
            disabled={!data.globalOfferEnabled}
            className={`w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/70 outline-none focus:ring-2 focus:ring-black/10 ${
              !data.globalOfferEnabled ? "cursor-not-allowed bg-gray-100" : ""
            }`}
            placeholder="Offer Name (e.g., EID Discount)"
            value={data.globalOfferName || ""}
            onChange={(e) =>
              setData({ ...data, globalOfferName: e.target.value })
            }
          />
          <input
            disabled={!data.globalOfferEnabled}
            className={`w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/70 outline-none focus:ring-2 focus:ring-black/10 ${
              !data.globalOfferEnabled ? "cursor-not-allowed bg-gray-100" : ""
            }`}
            placeholder="Offer Percent (e.g., 10)"
            value={data.globalOfferPercent || ""}
            onChange={(e) =>
              setData({ ...data, globalOfferPercent: e.target.value })
            }
          />
        </div>
      </div>

      {/* Save Button */}
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
