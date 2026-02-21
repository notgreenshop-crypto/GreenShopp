import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function SettingsAdmin() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const ref = doc(db, 'settings', 'app');

  const load = async () => {
    setLoading(true);
    const snap = await getDoc(ref);
    if (snap.exists()) setForm(snap.data());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await setDoc(ref, form, { merge: true });
    alert('Settings saved!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="toolbar"><h2>Settings</h2></div>
      <form className="form-grid" onSubmit={save}>
        {Object.keys(form).map(key => (
          <label key={key}>
            {key}
            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
        <div className="col-2 right"><button className="btn primary">Save</button></div>
      </form>
    </div>
  );
}
