import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Package, Settings as Cog, LayoutGrid, CreditCard, Wrench } from 'lucide-react';

export default function AdminShell({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (t) => {
    navigate(
      t === 'products' ? '/admin/products' :
      t === 'settings' ? '/admin/settings' :
      t === 'payments' ? '/admin/payments' :
      t === 'maintenance' ? '/admin/maintenance' :
      '/admin'
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#f7f9ff] to-[#eef3ff]">
      {/* Topbar */}
      <div className="sticky top-0 z-30 px-4 py-3">
        <div className="glass-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-black/90 grid place-items-center text-white">F5</div>
            <div>
              <div className="text-sm text-gray-500">Admin Dashboard</div>
              <div className="font-semibold">Fenzo5</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-black/5"
          >
            <LogOut size={18}/> Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-12 grid grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="glass-card p-3 lg:p-4">
            <div className="text-xs text-gray-500 mb-2">Navigation</div>
            <nav className="space-y-2">
              <NavItem 
                icon={<LayoutGrid size={18}/>} 
                active={location.pathname.includes("/admin/products")} 
                onClick={()=>go('products')} 
                label="Products" 
              />
              <NavItem 
                icon={<Cog size={18}/>} 
                active={location.pathname.includes("/admin/settings")} 
                onClick={()=>go('settings')} 
                label="Settings" 
              />
              <NavItem 
                icon={<CreditCard size={18}/>} 
                active={location.pathname.includes("/admin/payments")} 
                onClick={()=>go("payments")} 
                label="Payment Methods" 
              />
              <NavItem 
                icon={<Wrench size={18}/>} 
                active={location.pathname.includes("/admin/maintenance")} 
                onClick={()=>go("maintenance")} 
                label="Maintenance/Update" 
              />
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="col-span-12 lg:col-span-9">
          <div className="glass-card p-4 lg:p-6">
            <Outlet /> {/* ✅ Nested route content render হবে এখানে */}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 border transition
        ${active ? 'border-black/10 bg-white' : 'border-white/60 hover:bg-white/70'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
