import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Pencil, Trash2, EyeOff, Eye } from 'lucide-react';
import ProductModal from '../shared/ProductModal';

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const productsCol = useMemo(()=>collection(db,'products'),[]);

  const load = async () => {
    setLoading(true);
    const q = query(productsCol, orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d=>({id:d.id, ...d.data()})));
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const toggleActive = async (p) => {
    await updateDoc(doc(db,'products', p.id), { isActive: !p.isActive, updatedAt: serverTimestamp() });
    load();
  };

  const remove = async (p) => {
    if(!window.confirm('Delete this product?')) return;
    await deleteDoc(doc(db, 'products', p.id));
    load();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-sm text-gray-500">Manage your catalog. Add multiple image URLs from the web.</p>
        </div>
        <button onClick={()=>{setEditing(null); setOpen(true);}} className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90">
          <Plus size={18}/> Add product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/60">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && (
              <tr><td className="px-4 py-6" colSpan={6}>Loading…</td></tr>
            )}
            {!loading && items.length===0 && (
              <tr><td className="px-4 py-6" colSpan={6}>No products</td></tr>
            )}
            {!loading && items.map(p=>(
              <tr key={p.id} className="border-t border-white/70 hover:bg-white/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl overflow-hidden bg-white/80 border border-white/70 grid place-items-center">
                      {Array.isArray(p.images) && p.images[0]
                        ? <img className="h-12 w-12 object-cover" src={p.images[0]} alt={p.name}/>
                        : <span className="text-xs text-gray-400">No img</span>}
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.code || '-'}</td>
                <td className="px-4 py-3">৳{p.price ?? '-'}</td>
                <td className="px-4 py-3">{p.stock ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border
                    ${p.isActive ? 'border-emerald-400 text-emerald-600 bg-emerald-50' : 'border-gray-300 text-gray-500 bg-white'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>toggleActive(p)} className="rounded-xl border px-3 py-1.5 hover:bg-white">
                      {p.isActive ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={()=>{setEditing(p); setOpen(true);}} className="rounded-xl border px-3 py-1.5 hover:bg-white">
                      <Pencil size={16}/>
                    </button>
                    <button onClick={()=>remove(p)} className="rounded-xl border px-3 py-1.5 hover:bg-white text-red-500">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <ProductModal initial={editing} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false); load();}}/>}
    </div>
  );
}
