import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function MaintenancePage() {
  const ref = doc(db, "settings", "app");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) setData(snap.data());
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    await updateDoc(ref, {
      maintenanceMode: !!data.maintenanceMode,
      maintenanceMessage: data.maintenanceMessage || "",
    });
    setLoading(false);
    alert("✅ Maintenance settings updated!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Maintenance / Update</h2>

      <div className="p-4 border rounded-xl bg-white/70 flex items-center justify-between">
        <span className="font-medium">Enable Maintenance Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.maintenanceMode}
            onChange={(e) => setData({ ...data, maintenanceMode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black"></div>
          <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
        </label>
      </div>

      <div className={`space-y-2 transition-opacity ${data.maintenanceMode ? "opacity-100" : "opacity-50"}`}>
        <label className="text-sm text-gray-600">Maintenance Message</label>
        <textarea
          rows={3}
          disabled={!data.maintenanceMode}
          className={`w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 ${
            !data.maintenanceMode ? "cursor-not-allowed bg-gray-100" : ""
          }`}
          placeholder="It will take a while. Please check back later!"
          value={data.maintenanceMessage || ""}
          onChange={(e) => setData({ ...data, maintenanceMessage: e.target.value })}
        />
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
