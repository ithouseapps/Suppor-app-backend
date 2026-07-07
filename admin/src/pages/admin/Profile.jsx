import { useState } from 'react';
import { useAuth } from '../../auth';
import { updateProfile } from '../../api';

export default function AdminProfile() {
  const { user, setUser, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: user?.username || '', first_name: user?.first_name || '', last_name: user?.last_name || '', password: '' });
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(null);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initial = (user?.first_name || user?.username)?.[0]?.toUpperCase() || 'A';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotif(null);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      const resp = await updateProfile(payload);
      setUser(resp.data);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setNotif({ type: 'success', text: 'Profil yangilandi' });
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.username?.[0] || 'Xatolik yuz berdi';
      setNotif({ type: 'error', text: msg });
    } finally {
      setSaving(false);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 ${
          notif.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notif.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {notif.text}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-800">Admin profili</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 max-w-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{user?.username}</h2>
                    <p className="text-sm text-slate-500">{(user?.first_name || '') + (user?.last_name ? ' ' + user?.last_name : '') || '--'}</p>
                    <p className="text-xs text-slate-400 mt-1">Admin</p>
                  </div>
                  <button onClick={() => { setEditForm({ username: user?.username || '', first_name: user?.first_name || '', last_name: user?.last_name || '', password: '' }); setIsEditing(true); }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Username</label>
                  <input type="text" value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Ism</label>
                    <input type="text" value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Familiya</label>
                    <input type="text" value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Yangi parol</label>
                  <input type="password" value={editForm.password} placeholder="Yangi parol"
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="px-5 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 active:scale-[0.98] transition-all">
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}