import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ProductForm from './ProductForm';

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const productsCol = useMemo(() => collection(db, 'products'), []);

  const load = async () => {
    setLoading(true);
    const q = query(productsCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteDoc(doc(db, 'products', id));
    await load();
  };

  const toggleActive = async (id, curr) => {
    await updateDoc(doc(db, 'products', id), { isActive: !curr, updatedAt: serverTimestamp() });
    await load();
  };

  const startCreate = () => { setEditing(null); setOpenForm(true); };
  const startEdit = (p) => { setEditing(p); setOpenForm(true); };

  return (
    <div>
      <div className="toolbar">
        <h2>Products</h2>
        <button className="btn primary" onClick={startCreate}>+ Add Product</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="table">
          <div className="thead">
            <div>Name</div><div>Code</div><div>Price</div><div>Stock</div><div>Status</div><div>Actions</div>
          </div>
          {items.map(p => (
            <div className="trow" key={p.id}>
              <div><div className="title">{p.name}</div><div className="muted">{p.slug}</div></div>
              <div>{p.code || '-'}</div>
              <div>৳{p.price ?? '-'}</div>
              <div>{p.stock ?? 0}</div>
              <div><span className={p.isActive ? 'badge success' : 'badge'}>{p.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="row-actions">
                <button onClick={() => toggleActive(p.id, p.isActive)}>{p.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button className="danger" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openForm && (
        <ProductForm
          initial={editing}
          onClose={() => setOpenForm(false)}
          onSaved={() => { setOpenForm(false); load(); }}
        />
      )}
    </div>
  );
}
