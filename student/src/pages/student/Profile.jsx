import { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { getStudentProfile, updateProfile } from '../../api';

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', first_name: '', last_name: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    getStudentProfile().then((r) => setProfile(r.data));
  }, []);

  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const startEditing = () => {
    setEditForm({
      username: profile?.user?.username || '',
      first_name: profile?.user?.first_name || '',
      last_name: profile?.user?.last_name || '',
      password: '',
    });
    setIsEditing(true);
  };

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
      const res = await getStudentProfile();
      setProfile(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.username?.[0] || 'Xatolik yuz berdi';
      setNotif({ type: 'error', text: msg });
    } finally {
      setSaving(false);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { total_lessons, total_completed, total_minutes } = profile;
  const initial = (profile?.user?.first_name || profile?.user?.username)?.[0]?.toUpperCase() || 'S';

  return (
    <div className="space-y-4 pb-4">
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{profile?.user?.username}</h2>
                    <p className="text-sm text-slate-500">{(profile?.user?.first_name || '') + (profile?.user?.last_name ? ' ' + profile?.user?.last_name : '') || '--'}</p>
                  </div>
                  <button onClick={startEditing} className="text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                {profile?.user?.secret_id && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-amber-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                    </svg>
                    Secret ID: {profile?.user?.secret_id}
                  </div>
                )}
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
        <div className="grid grid-cols-3 gap-4 text-center mt-5 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-blue-600">{total_lessons}</p>
            <p className="text-[11px] text-slate-500 font-medium">Jami dars</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{total_completed}</p>
            <p className="text-[11px] text-slate-500 font-medium">Tugagan</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">{formatMinutes(total_minutes)}</p>
            <p className="text-[11px] text-slate-500 font-medium">Umumiy vaqt</p>
          </div>
        </div>
      </div>
    </div>
  );
}