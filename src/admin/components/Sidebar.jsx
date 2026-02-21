import React from 'react';

export default function Sidebar({ tab, setTab, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">Fenzo5 Admin</div>
      <nav>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          Settings
        </button>
      </nav>
      <div className="spacer" />
      <button className="btn" onClick={onLogout}>Logout</button>
    </aside>
  );
}
