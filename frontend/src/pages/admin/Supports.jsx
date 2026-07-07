import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSupports, createSupport, updateSupport, deleteSupport, getSubjects, banSupport, unbanSupport } from '../../api';

export default function AdminSupports() {
  const [supports, setSupports] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    user: { username: '', password: '', first_name: '', last_name: '', phone: '' },
    subject_ids: [],
  });

  const load = () => getSupports().then((r) => setSupports(r.data));
  useEffect(() => { load(); getSubjects().then((r) => setSubjects(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      user: editing ? { ...form.user } : form.user,
      subject_ids: form.subject_ids,
    };
    if (editing) {
      if (!data.user.password) delete data.user.password;
      await updateSupport(editing.id, data);
    } else {
      await createSupport(data);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ user: { username: '', password: '', first_name: '', last_name: '', phone: '' }, subject_ids: [] });
    load();
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      user: { username: s.user.username, password: '', first_name: s.user.first_name, last_name: s.user.last_name, phone: s.user.phone || '' },
      subject_ids: s.subjects.map((sub) => sub.id),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Rostdan ochirish?')) {
      await deleteSupport(id);
      load();
    }
  };

  const handleBan = async (id) => {
    const reason = prompt('Bloklash sababi (ixtiyoriy):');
    if (reason === null) return;
    try {
      await banSupport(id, { reason });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const handleUnban = async (id) => {
    if (confirm('Blokdan ochilsinmi?')) {
      try {
        await unbanSupport(id);
        load();
      } catch (err) {
        alert(err.response?.data?.error || 'Xatolik');
      }
    }
  };

  const toggleSubject = (id) => {
    setForm((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(id)
        ? prev.subject_ids.filter((s) => s !== id)
        : [...prev.subject_ids, id],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Academic Supportlar</h1>
        <button onClick={() => { setEditing(null); setForm({ user: { username: '', password: '', first_name: '', last_name: '', phone: '' }, subject_ids: [] }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Support qoshish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supports.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl shadow-sm p-4 ${s.is_banned ? 'border-2 border-red-200' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{s.user.username}</h3>
              <div className="flex items-center gap-2">
                {s.is_banned && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Bloklangan</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.is_active ? 'Aktiv' : 'Noaktiv'}
                </span>
              </div>
            </div>
            {s.user.first_name && <p className="text-sm text-gray-500">{s.user.first_name} {s.user.last_name}</p>}
            {s.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {s.subjects.map((sub) => (
                  <span key={sub.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{sub.name}</span>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-3 pt-3 border-t text-sm">
              <Link to={`/admin/supports/${s.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">Profil</Link>
              <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800">Tahrirlash</button>
              <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">Ochirish</button>
              {s.is_banned ? (
                <button onClick={() => handleUnban(s.id)} className="text-green-600 hover:text-green-800">Blokdan ochish</button>
              ) : (
                <button onClick={() => handleBan(s.id)} className="text-orange-600 hover:text-orange-800">Bloklash</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Tahrirlash' : 'Support qoshish'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Username" value={form.user.username} onChange={(e) => setForm({ ...form, user: { ...form.user, username: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input placeholder="Parol" type="password" value={form.user.password} onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required={!editing} />
              <input placeholder="Ism" value={form.user.first_name} onChange={(e) => setForm({ ...form, user: { ...form.user, first_name: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Familiya" value={form.user.last_name} onChange={(e) => setForm({ ...form, user: { ...form.user, last_name: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fanlar</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" checked={form.subject_ids.includes(sub.id)} onChange={() => toggleSubject(sub.id)} />
                      {sub.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  {editing ? 'Saqlash' : 'Qoshish'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}