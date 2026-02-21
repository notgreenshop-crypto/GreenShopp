import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const defaultProduct = {
  name: '',
  code: '',
  description: '',
  details: '',
  price: 0,
  stock: 0,
  isActive: true,
  deliveryCharge: '',
  popularityScore: 0,
  slug: '',
  images: []
};

export default function ProductForm({ initial, onSaved, onClose }) {
  const [form, setForm] = useState(defaultProduct);
  const [imagesText, setImagesText] = useState('');
  const productsCol = useMemo(() => collection(db, 'products'), []);

  useEffect(() => {
    if (initial) {
      setForm({ ...defaultProduct, ...initial });
      setImagesText(Array.isArray(initial.images) ? initial.images.join('\n') : '');
    } else {
      setForm(defaultProduct);
      setImagesText('');
    }
  }, [initial]);

  const toSlug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const images = imagesText.split('\n').map(x => x.trim()).filter(Boolean);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      popularityScore: Number(form.popularityScore || 0),
      images,
      slug: form.slug?.trim() || toSlug(form.name || ''),
      updatedAt: serverTimestamp(),
    };

    if (initial?.id) {
      await setDoc(doc(db, 'products', initial.id), { ...payload, createdAt: initial.createdAt || serverTimestamp() }, { merge: true });
    } else {
      await addDoc(productsCol, { ...payload, createdAt: serverTimestamp() });
    }
    onSaved?.();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Code<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
          <label>Price<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label>Stock<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
          <label className="col-2">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea></label>
          <label className="col-2">Details<textarea rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}></textarea></label>
          <label className="col-2">Image URLs (one per line)<textarea rows={6} value={imagesText} onChange={(e) => setImagesText(e.target.value)} /></label>
          <label>Active?
            <select value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <div className="col-2 right">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
