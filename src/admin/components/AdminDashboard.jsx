import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProductsAdmin from './ProductsAdmin';
import SettingsAdmin from './SettingsAdmin';

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('products');

  return (
    <div className="admin-layout">
      <Sidebar tab={tab} setTab={setTab} onLogout={onLogout} />
      <main className="content">
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'settings' && <SettingsAdmin />}
      </main>
    </div>
  );
}
