import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupports, createSupport, updateSupport, deleteSupport, getSubjects, banSupport, unbanSupport } from '../../api';

export default function AdminSupports() {
  const navigate = useNavigate();
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
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
          <h1 className="text-xl font-bold text-slate-800">Academic Supportlar</h1>
        </div>
        <button onClick={() => { setEditing(null); setForm({ user: { username: '', password: '', first_name: '', last_name: '', phone: '' }, subject_ids: [] }); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Support qoshish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supports.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${s.is_banned ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">{s.user.username}</h3>
              </div>
              <div className="flex items-center gap-2">
                {s.is_banned && (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-medium px-2 py-0.5 rounded border border-red-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Bloklangan
                  </span>
                )}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  s.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {s.is_active ? 'Aktiv' : 'Noaktiv'}
                </span>
              </div>
            </div>
            {s.user.first_name && <p className="text-xs text-slate-500 ml-10">{s.user.first_name} {s.user.last_name}</p>}
            {s.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 ml-10">
                {s.subjects.map((sub) => (
                  <span key={sub.id} className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded border border-blue-200">{sub.name}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
              <button onClick={() => navigate(`/admin/supports/${s.id}/profile`)} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </button>
              <button onClick={() => handleEdit(s)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Tahrirlash
              </button>
              <button onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Ochirish
              </button>
              {s.is_banned ? (
                <button onClick={() => handleUnban(s.id)} className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Blokdan ochish
                </button>
              ) : (
                <button onClick={() => handleBan(s.id)} className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Bloklash
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-4">{editing ? 'Support tahrirlash' : 'Support qoshish'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
                <input placeholder="Username" value={form.user.username} onChange={(e) => setForm({ ...form, user: { ...form.user, username: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Parol</label>
                <input placeholder="Parol" type="password" value={form.user.password} onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required={!editing} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ism</label>
                  <input placeholder="Ism" value={form.user.first_name} onChange={(e) => setForm({ ...form, user: { ...form.user, first_name: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Familiya</label>
                  <input placeholder="Familiya" value={form.user.last_name} onChange={(e) => setForm({ ...form, user: { ...form.user, last_name: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fanlar</label>
                <div className="flex flex-wrap gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {subjects.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer hover:text-blue-600">
                      <input type="checkbox" checked={form.subject_ids.includes(sub.id)} onChange={() => toggleSubject(sub.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                      {sub.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-1.5">
                  {editing ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saqlash
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Qoshish
                    </>
                  )}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
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
