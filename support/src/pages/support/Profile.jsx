import { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { getSupportProfile, updateProfile } from '../../api';

export default function SupportProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', first_name: '', last_name: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    getSupportProfile().then((r) => setProfile(r.data));
  }, []);

  const startEditing = () => {
    setEditForm({
      username: profile?.support?.user?.username || '',
      first_name: profile?.support?.user?.first_name || '',
      last_name: profile?.support?.user?.last_name || '',
      password: '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({ username: '', first_name: '', last_name: '', password: '' });
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
      const res = await getSupportProfile();
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

  const { support, students, total_students, total_lessons, total_completed, total_minutes } = profile;
  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };
  const initial = (support?.user?.first_name || support?.user?.username)?.[0]?.toUpperCase() || 'S';

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
                    <h2 className="text-lg font-bold text-slate-800">{support?.user?.username}</h2>
                    <p className="text-sm text-slate-500">{(support?.user?.first_name || '') + (support?.user?.last_name ? ' ' + support?.user?.last_name : '') || '--'}</p>
                  </div>
                  <button onClick={startEditing} className="text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {support?.subjects?.map((sub) => (
                    <span key={sub.id} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-medium">{sub.name}</span>
                  ))}
                  {(!support?.subjects || support.subjects.length === 0) && (
                    <span className="text-[10px] text-slate-400">Fanlar mavjud emas</span>
                  )}
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
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">First name</label>
                    <input type="text" value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Last name</label>
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
                  <button type="button" onClick={cancelEditing}
                    className="px-5 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 active:scale-[0.98] transition-all">
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center mt-5 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-blue-600">{total_students}</p>
            <p className="text-[11px] text-slate-500 font-medium">Student</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{total_lessons}</p>
            <p className="text-[11px] text-slate-500 font-medium">Jami dars</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-700">{total_completed}</p>
            <p className="text-[11px] text-slate-500 font-medium">Tugagan</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">{formatMinutes(total_minutes)}</p>
            <p className="text-[11px] text-slate-500 font-medium">Umumiy vaqt</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Studentlarim ({total_students})
        </h2>
        <div className="space-y-2">
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Hali studentlaringiz yoq</p>
            </div>
          ) : (
            students.map((item) => (
              <div key={item.student.id} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <button
                  onClick={() => setExpandedStudent(expandedStudent === item.student.id ? null : item.student.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                      {item.student.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800 text-sm">{item.student.username}</p>
                      <p className="text-xs text-slate-500">{item.student.first_name} {item.student.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{item.total_lessons}</p>
                      <p className="text-[10px] text-slate-400">Dars</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-600">{item.completed_lessons}</p>
                      <p className="text-[10px] text-slate-400">Tugagan</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-amber-600">{formatMinutes(item.total_minutes)}</p>
                      <p className="text-[10px] text-slate-400">Vaqt</p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedStudent === item.student.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedStudent === item.student.id && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {item.lessons.length === 0 ? (
                      <div className="p-4 text-sm text-slate-400 text-center">Darslar mavjud emas</div>
                    ) : (
                      item.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-4 hover:bg-slate-50/50 text-sm flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${lesson.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <div>
                              <p className="font-medium text-slate-700 text-sm">{lesson.topic}</p>
                              <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                                {lesson.subject_name && <span>{lesson.subject_name}</span>}
                                {lesson.room_name && <span>| {lesson.room_name}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400 shrink-0 ml-3">
                            <p>{lesson.date}</p>
                            <p>{lesson.start_time}{lesson.end_time ? ` - ${lesson.end_time}` : ''}</p>
                            {lesson.duration_minutes && <p className="font-medium text-slate-500">{lesson.duration_minutes} min</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
