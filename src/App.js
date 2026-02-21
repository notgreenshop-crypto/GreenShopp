import React, { useEffect, useState } from "react";
import FenzoEcommerce from "./pages/FenzoEcommerce";
import AdminApp from "./admin/AdminApp";
import { db } from "./config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import "./App.css";
import "./index.css";

export default function App() {
  const isAdmin =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  const [settings, setSettings] = useState(null);

  // 🔹 Listen for Firestore settings realtime
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "app"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
        <div className="w-14 h-14 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium animate-pulse">
          Initializing website...
        </p>
      </div>
    );
  }

  // 🛠 Maintenance Mode Screen
  if (!isAdmin && settings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] to-[#c7d2fe] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Subtle floating shapes */}
        <div className="absolute w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse -top-10 -left-10"></div>
        <div className="absolute w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl animate-pulse bottom-0 right-0"></div>

        {/* 🔧 Replace the <img> with your video */}
       <video
        autoPlay
        loop
        muted
       playsInline
       className="w-72 h-72 mb-8 rounded-2xl shadow-2xl object-cover"
       >
       <source src="/assets/maintenance.webm" type="video/webm" />
       {/* Optional fallback if browser   doesn’t support WebM */}
       <source src="/assets/maintenance.gif" type="image/gif" />
       Your browser does not support the video tag.
       </video>


        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-4">
          We’re Currently Updating Our Website
        </h1>

        {/* Message */}
        <p className="text-gray-600 max-w-lg mx-auto text-base leading-relaxed">
          {settings.maintenanceMessage ||
            "Our engineers are working hard to bring new updates and improvements. We’ll be back shortly!"}
        </p>

        {/* Progress bar animation */}
        <div className="mt-10 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress"></div>
        </div>

        <p className="mt-3 text-sm text-gray-500 font-medium animate-pulse">
          Thank you for your patience 💙
        </p>

        {/* Custom CSS animation for progress */}
        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-progress {
            width: 200%;
            animation: progress 3s ease-in-out infinite alternate;
          }
        `}</style>
      </div>
    );
  }

  // ✅ Normal site
  return isAdmin ? <AdminApp /> : <FenzoEcommerce />;
}
