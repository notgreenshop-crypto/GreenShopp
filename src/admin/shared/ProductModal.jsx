import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../config/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

const defaults = {
  name:'', code:'', price:0, stock:0, isActive:true,
  description:'', slug:'', deliveryCharge:'', popularityScore:0,
  images:[], sizes:[], colors:[], offerPrice:0, offerPercent:0
};

export default function ProductModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(defaults);
  const [imagesText, setImagesText] = useState('');
  const [sizesText, setSizesText] = useState('');
  const [colorsText, setColorsText] = useState('');
  const productsCol = useMemo(()=>collection(db,'products'),[]);

  useEffect(()=>{
    if(initial){
      setForm({...defaults, ...initial});
      setImagesText(Array.isArray(initial.images) ? initial.images.join('\n') : '');
      setSizesText(Array.isArray(initial.sizes) ? initial.sizes.join(', ') : '');
      setColorsText(Array.isArray(initial.colors) ? initial.colors.join(', ') : '');
    } else {
      setForm(defaults);
      setImagesText('');
      setSizesText('');
      setColorsText('');
    }
  },[initial]);

  const toSlug = s => s?.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const submit = async (e)=>{
    e.preventDefault();
    const images = imagesText.split('\n').map(x=>x.trim()).filter(Boolean);
    const sizes = sizesText.split(',').map(x=>x.trim()).filter(Boolean);
    const colors = colorsText.split(',').map(x=>x.trim()).filter(Boolean);

    const payload = {
      ...form,
      price: Number(form.price||0),
      stock: Number(form.stock||0),
      popularityScore: Number(form.popularityScore||0),
      images, sizes, colors,
      offerPrice: Number(form.offerPrice||0),
      offerPercent: Number(form.offerPercent||0),
      slug: form.slug?.trim() || toSlug(form.name),
      updatedAt: serverTimestamp()
    };
    if(initial?.id){
      await setDoc(doc(db,'products', initial.id), { ...payload, createdAt: initial.createdAt || serverTimestamp() }, { merge:true });
    }else{
      await addDoc(productsCol, { ...payload, createdAt: serverTimestamp() });
    }
    onSaved?.();
  };

  const previewImages = imagesText.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,4);

  // ✅ Handlers to ensure only one offer type active
  const handleOfferPriceChange = (value) => {
    setForm({
      ...form,
      offerPrice: value,
      offerPercent: value ? 0 : form.offerPercent
    });
  };

  const handleOfferPercentChange = (value) => {
    setForm({
      ...form,
      offerPercent: value,
      offerPrice: value ? 0 : form.offerPrice
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center px-3 z-50" onClick={onClose}>
      <form onClick={(e)=>e.stopPropagation()} onSubmit={submit}
        className="glass-card w-full max-w-4xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{initial?'Edit product':'Add product'}</h3>
            <p className="text-sm text-gray-500">Paste multiple image URLs (one per line)</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border px-3 py-1.5 hover:bg-white">Close</button>
        </div>

        {/* quick preview */}
        {previewImages.length>0 && (
          <div className="grid grid-cols-4 gap-3">
            {previewImages.map((src,i)=>(
              <div key={i} className="aspect-video rounded-xl overflow-hidden border bg-white/70">
                <img src={src} alt="" className="w-full h-full object-cover"/>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name">
            <input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </Field>
          <Field label="Code">
            <input className="inp" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/>
          </Field>
          <Field label="Price">
            <input className="inp" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
          </Field>

          {/* ✅ Offer Price */}
          <Field label="Offer price (if offered)">
            <input className="inp" type="number" value={form.offerPrice} onChange={e=>handleOfferPriceChange(Number(e.target.value))}/>
          </Field>
          <Field label="Offer (percentage)">
            <input className="inp" type="number" value={form.offerPercent} onChange={e=>handleOfferPercentChange(Number(e.target.value))}/>
          </Field>

          <Field label="Stock">
            <input className="inp" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
          </Field>
          <Field label="Popularity Score">
            <input className="inp" type="number" value={form.popularityScore} onChange={e=>setForm({...form,popularityScore:e.target.value})}/>
          </Field>
          <Field label="Active?">
            <select className="inp" value={form.isActive?'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Description" full>
            <textarea className="inp" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
          </Field>

          <Field label="Available Sizes (comma separated)" full>
            <input className="inp" placeholder="S, M, L, XL" value={sizesText} onChange={e=>setSizesText(e.target.value)}/>
          </Field>
          <Field label="Available Colors (comma separated)" full>
            <input className="inp" placeholder="Red, Blue, Black" value={colorsText} onChange={e=>setColorsText(e.target.value)}/>
          </Field>

          <Field label="Image URLs (one per line)" full>
            <textarea className="inp font-mono text-xs" rows={6} placeholder="https://...jpg\nhttps://...png"
              value={imagesText} onChange={e=>setImagesText(e.target.value)}/>
          </Field>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 hover:bg-white">Cancel</button>
          <button type="submit" className="rounded-xl bg-black text-white px-5 py-2.5 hover:opacity-90">Save</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <label className={`${full?'md:col-span-2':''} space-y-1`}>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="">{children}</div>
      <style>{`.inp{border-radius:12px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.8);padding:.75rem 1rem;outline:none} .inp:focus{box-shadow:0 0 0 3px rgba(0,0,0,.06)}`}</style>
    </label>
  );
}
