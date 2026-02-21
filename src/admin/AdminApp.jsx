import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import AdminShell from './components/AdminShell';
import ProductsPage from './pages/ProductsPage';
import PaymentsPage from './pages/PaymentsPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdTokenResult(true);
        setIsAdmin(!!token.claims.admin);
      } else setIsAdmin(false);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => { await signOut(auth); };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-[#f3f6ff] grid place-items-center px-4">
        <form className="glass-card w-full max-w-md p-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Fenzo Admin</h2>
            <p className="text-sm text-gray-500">Sign in with admin email & password</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              type="email" value={form.email}
              onChange={(e)=>setForm({...form, email:e.target.value})} required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              type="password" value={form.password}
              onChange={(e)=>setForm({...form, password:e.target.value})} required
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button className="w-full rounded-xl bg-black text-white py-3 hover:opacity-90 transition">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminShell onLogout={handleLogout}/>}>
        <Route path="products" element={<ProductsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
