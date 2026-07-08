import { useState, useEffect } from 'react';
import { getSupportProfile, updateProfile } from '../../api';

export default function SupportProfile() {
  const [profile, setProfile] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', first_name: '', last_name: '', password: '' });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    getSupportProfile().then((r) => {
      setProfile(r.data);
      setForm({
        username: r.data.support?.user?.username || '',
        first_name: r.data.support?.user?.first_name || '',
        last_name: r.data.support?.user?.last_name || '',
        password: '',
      });
    });
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      const payload = { username: form.username, first_name: form.first_name, last_name: form.last_name };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      setSaveMessage('success');
      setEditing(false);
      setForm({ ...form, password: '' });
      getSupportProfile().then((r) => setProfile(r.data));
    } catch {
      setSaveMessage('error');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (profile) {
      setForm({
        username: profile.support?.user?.username || '',
        first_name: profile.support?.user?.first_name || '',
        last_name: profile.support?.user?.last_name || '',
        password: '',
      });
    }
    setSaveMessage('');
  };

  if (!profile) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;
  }

  const { support, students, total_students, total_lessons } = profile;
  const completedLessons = students.reduce((sum, s) => sum + s.completed_lessons, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Profilim</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Tahrirlash
          </button>
        )}
      </div>

      {editing && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Profilni tahrirlash</h2>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ism</label>
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Familiya</label>
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yangi parol (ixtiyoriy)</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Parolni ozgartirish uchun kiriting"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {saveMessage === 'success' && (
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 border border-emerald-200/60">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Profil saqlandi
              </div>
            )}
            {saveMessage === 'error' && (
              <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 border border-red-200/60">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xatolik yuz berdi
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Saqlash
              </button>
              <button type="button" onClick={handleCancelEdit} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm hover:bg-slate-200 transition-colors">
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {support.user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{support.user.username}</h2>
            <p className="text-slate-500">{support.user.first_name} {support.user.last_name}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {support.subjects?.map((sub) => (
                <span key={sub.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{sub.name}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{total_students}</p>
              <p className="text-xs text-slate-500">Student</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{total_lessons}</p>
              <p className="text-xs text-slate-500">Jami dars</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-600">{completedLessons}</p>
              <p className="text-xs text-slate-500">Tugagan</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Studentlarim ({total_students})
        </h2>
        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 text-center text-slate-500">
              Hali studentlaringiz yoq
            </div>
          ) : (
            students.map((item) => (
              <div key={item.student.id} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <button
                  onClick={() => setExpandedStudent(expandedStudent === item.student.id ? null : item.student.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                      {item.student.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{item.student.username}</p>
                      <p className="text-sm text-slate-500">{item.student.first_name} {item.student.last_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{item.total_lessons}</p>
                      <p className="text-xs text-slate-500">Dars</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-600">{item.completed_lessons}</p>
                      <p className="text-xs text-slate-500">Tugagan</p>
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedStudent === item.student.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedStudent === item.student.id && (
                  <div className="border-t border-slate-200/60 divide-y divide-slate-200/60">
                    {item.lessons.length === 0 ? (
                      <div className="p-4 text-sm text-slate-500">Darslar mavjud emas</div>
                    ) : (
                      item.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-4 hover:bg-slate-50 text-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${lesson.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <div>
                              <p className="font-medium text-slate-800">{lesson.topic}</p>
                              <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                {lesson.subject_name && <span>{lesson.subject_name}</span>}
                                {lesson.room_name && <span>| {lesson.room_name}</span>}
                                {lesson.student_count && <span>| {lesson.student_count} o'quvchi</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{lesson.date}</p>
                            <p>{lesson.start_time}{lesson.end_time ? ` - ${lesson.end_time}` : ''}</p>
                            {lesson.duration_minutes && <p className="font-medium">{lesson.duration_minutes} min</p>}
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
