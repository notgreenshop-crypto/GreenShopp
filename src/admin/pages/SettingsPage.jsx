import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function SettingsPage() {
  const [form, setForm] = useState({
    facebookPage: "",
    whatsappPrimary: "",
    whatsappSecondary: "",
    freeDeliveryThreshold: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "settings", "app");
      const snap = await getDoc(ref);
      if (snap.exists()) setForm(snap.data());
    };

    fetchData();
  }, []);

  const save = async () => {
    setLoading(true);

    const ref = doc(db, "settings", "app");

    await updateDoc(ref, {
      facebookPage: form.facebookPage || "",
      whatsappPrimary: form.whatsappPrimary || "",
      whatsappSecondary: form.whatsappSecondary || "",
      freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
    });

    setLoading(false);
    alert("✅ General settings updated!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">General Settings</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Facebook Page</label>
          <input
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Facebook Page"
            value={form.facebookPage}
            onChange={(e) =>
              setForm({ ...form, facebookPage: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">WhatsApp Primary</label>
          <input
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="8801XXXXXXXXX"
            value={form.whatsappPrimary}
            onChange={(e) =>
              setForm({ ...form, whatsappPrimary: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">WhatsApp Secondary</label>
          <input
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="8801XXXXXXXXX"
            value={form.whatsappSecondary}
            onChange={(e) =>
              setForm({ ...form, whatsappSecondary: e.target.value })
            }
          />
        </div>
      </div>

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
