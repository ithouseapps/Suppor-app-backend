import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { getBookings, getLessons, startLesson, endLesson, cancelBooking, getSupports, getUsers, getStudentStatus, getSchedules, createSchedule, deleteSchedule } from '../../api';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 animate-slideDown ${
      notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {notification.type === 'success' ? (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )}
      {notification.text}
    </div>
  );
}

export default function SupportDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [support, setSupport] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [form, setForm] = useState({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '', student_count: '' });
  const [todayStats, setTodayStats] = useState({ lessons: 0, students: 0 });
  const [studentStatuses, setStudentStatuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customTime, setCustomTime] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [mySchedules, setMySchedules] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '18:00' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || 'bron';

  const today = new Date().toISOString().split('T')[0];
  const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  const load = async () => {
    try {
      const [supRes] = await Promise.all([getSupports()]);
      const mySupport = supRes.data.find((s) => s.user.id === user.id);
      setSupport(mySupport);
    } catch {}
    getBookings({ date: today }).then((r) => setBookings(r.data)).catch(() => {});
    const allLessRes = await getLessons().catch(() => ({ data: [] }));
    const activeGlobal = allLessRes.data.find((l) => l.is_active);
    setActiveLesson(activeGlobal || null);
    const lessRes = allLessRes.data.filter((l) => l.date === today);
    setLessons(lessRes);
    getUsers({ role: 'student' }).then((r) => setStudents(r.data)).catch(() => {});
    getStudentStatus().then((r) => setStudentStatuses(r.data)).catch(() => {});
    getSchedules().then((r) => setMySchedules(r.data)).catch(() => {});

    const completed = lessRes.filter((l) => !l.is_active);
    const uniqueStudents = new Set(completed.map((l) => l.student)).size;
    setTodayStats({ lessons: completed.length, students: uniqueStudents });
  };

  useEffect(() => { load(); }, []);

  const addNotification = (type, text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, text, time: new Date().toLocaleTimeString() }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  };

  const handleStartLesson = async (e) => {
    e.preventDefault();
    try {
      const selectedStudent = form.student_id ? students.find(s => s.id == form.student_id) : null;
      const payload = {
        student_name: selectedStudent ? selectedStudent.username : form.student_name,
        topic: form.topic,
        comment: form.comment,
        scheduled_start: form.scheduled_start || undefined,
        student_count: isGroup ? Number(form.student_count) : null,
      };
      const res = await startLesson(payload);
      setActiveLesson(res.data);
      setShowStart(false);
      setForm({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '', student_count: '' });
      setCustomTime(false);
      setIsGroup(false);
      addNotification('success', `Dars boshlandi: ${res.data.student_name} - ${res.data.topic}`);
      load();
    } catch (err) {
      addNotification('error', err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleEndLesson = async () => {
    if (!activeLesson) return;
    try {
      await endLesson({ lesson_id: activeLesson.id });
      setActiveLesson(null);
      addNotification('success', `Dars tugadi: ${activeLesson.student_name}`);
      load();
    } catch (err) {
      addNotification('error', err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;
    try {
      await cancelBooking(id);
      addNotification('success', 'Bron bekor qilindi');
      getBookings({ date: today }).then((r) => setBookings(r.data));
    } catch (err) {
      addNotification('error', err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(scheduleForm);
      setShowScheduleForm(false);
      setScheduleForm({ day_of_week: 0, start_time: '09:00', end_time: '18:00' });
      getSchedules().then((r) => setMySchedules(r.data));
      addNotification('success', 'Ish vaqti qoshildi');
    } catch (err) {
      addNotification('error', err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      getSchedules().then((r) => setMySchedules(r.data));
      addNotification('success', 'Ish vaqti olib tashlandi');
    } catch (err) {
      addNotification('error', err.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const getDelayInfo = () => {
    if (!activeLesson?.scheduled_start) return null;
    const scheduled = activeLesson.scheduled_start;
    const actual = activeLesson.start_time;
    if (scheduled && actual) {
      const [sh, sm] = scheduled.split(':').map(Number);
      const [ah, am] = actual.split(':').map(Number);
      const sMin = sh * 60 + sm;
      const aMin = ah * 60 + am;
      const diff = aMin - sMin;
      if (diff > 0) return { type: 'delay', text: `${diff} min kechikish` };
      if (diff < 0) return { type: 'early', text: `${Math.abs(diff)} min erta` };
      return { type: 'ontime', text: 'Oz vaqtida' };
    }
    return null;
  };

  const completedLessons = lessons.filter((l) => !l.is_active);
  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  return (
    <div className="space-y-3 pb-4">
      {notifications.map((n) => (
        <NotificationToast key={n.id} notification={n} onDismiss={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))} />
      ))}

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Bugungi dars" value={todayStats.lessons} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} color="#2563EB" />
        <StatCard label="Studentlar" value={todayStats.students} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="#059669" />
        <StatCard label="Bronlar" value={pendingBookings.length} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} color="#D97706" />
      </div>

      {activeLesson ? (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <h2 className="text-white font-semibold text-sm">Dars davom etmoqda</h2>
            </div>
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
              {activeLesson.start_time}
            </span>
          </div>
          <div className="bg-white/10 rounded-lg p-3 space-y-1.5 text-white/90 text-sm mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{activeLesson.student_name?.[0]?.toUpperCase()}</span>
              <span className="font-medium text-sm">{activeLesson.student_name}</span>
            </div>
            <p className="pl-8 text-xs">{activeLesson.topic}</p>
            {activeLesson.room_name && <p className="pl-8 text-xs text-white/70">Xona: {activeLesson.room_name}</p>}
            {getDelayInfo() && (
              <span className={`ml-8 inline-block text-[10px] px-2 py-0.5 rounded-full ${
                getDelayInfo().type === 'delay' ? 'bg-red-500/40 text-white' :
                getDelayInfo().type === 'early' ? 'bg-blue-500/40 text-white' : 'bg-green-500/40 text-white'
              }`}>
                {getDelayInfo().text}
              </span>
            )}
          </div>
          <button onClick={handleEndLesson} className="w-full bg-white text-orange-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-50 active:scale-[0.98] transition-all shadow-sm">
            Darsni tugatish
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <button onClick={() => setShowStart(!showStart)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm">Yangi dars boshlash</p>
                <p className="text-[11px] text-slate-400">Studentni tanlang va mavzuni kiriting</p>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${showStart ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showStart && (
            <form onSubmit={handleStartLesson} className="px-4 pb-5 space-y-3 border-t border-slate-100 pt-4">
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Student ismi</label>
                <input placeholder="Ismni yozing" value={form.student_name}
                  onChange={(e) => { setForm({ ...form, student_name: e.target.value, student_id: '' }); }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Yoki royxatdan tanlang</label>
                <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value, student_name: '' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                  <option value="">Tanlang</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.username}{s.first_name ? ` (${s.first_name})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Mavzu</label>
                <input placeholder="Mavzuni kiriting" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400" required />
              </div>
              <label className="flex items-center gap-2.5 py-1">
                <input type="checkbox" checked={isGroup} onChange={() => setIsGroup(!isGroup)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20" />
                <span className="text-sm text-slate-600">Guruhli dars</span>
              </label>
              {isGroup && (
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Nechta student</label>
                  <input type="number" min="1" placeholder="Studentlar soni" value={form.student_count}
                    onChange={(e) => setForm({ ...form, student_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400" />
                </div>
              )}
              <label className="flex items-center gap-2.5 py-1">
                <input type="checkbox" checked={customTime} onChange={() => setCustomTime(!customTime)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20" />
                <span className="text-sm text-slate-600">Boshqa vaqtni belgilash</span>
              </label>
              {customTime ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={form.scheduled_start}
                    onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  <button type="button" onClick={() => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    setForm({ ...form, scheduled_start: `${h}:${m}` });
                  }} className="text-blue-600 text-sm font-medium hover:text-blue-700 shrink-0 px-2">
                    Hozir
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Hozirgi vaqtda dars boshlanadi</p>
              )}
              <textarea placeholder="Izoh (ixtiyoriy)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400" rows="2" />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm">
                  Boshlash
                </button>
                <button type="button" onClick={() => { setShowStart(false); setForm({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '', student_count: '' }); setIsGroup(false); }}
                  className="px-6 bg-slate-100 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 active:scale-[0.98] transition-all">
                  Bekor qilish
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="flex overflow-x-auto scrollbar-hide gap-1 -mx-4 px-4">
        {[
          { key: 'bron', label: 'Bronlar', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { key: 'dars', label: 'Darslar', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
          { key: 'student', label: 'Studentlar', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
          { key: 'vaqt', label: 'Ish vaqti', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        ].map((t) => (
          <button key={t.key} onClick={() => navigate(`/support?section=${t.key}`)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
              section === t.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {section === 'bron' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Bron qilgan o'quvchilar</h2>
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{pendingBookings.length} ta</span>
          </div>
          {pendingBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-sm text-slate-400">Bugungi bronlar yoq</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingBookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    {b.student_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{b.student_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{b.start_time} - {b.end_time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        b.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {b.status_display}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => {
                      setForm({ student_name: b.student_name || '', student_id: '', topic: b.subject_name || '', comment: '', scheduled_start: '' });
                      setShowStart(true);
                      navigate('/support?section=bron');
                    }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                      Dars
                    </button>
                    <button onClick={() => handleCancelBooking(b.id)}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 active:scale-95 transition-all">
                      Bekor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'dars' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Bugun otilgan darslar</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">{completedLessons.length} ta</span>
          </div>
          {completedLessons.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="text-sm text-slate-400">Hali dars otilmagan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedLessons.map((l) => (
                <div key={l.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-center min-w-[48px] shadow-sm">
                      <p className="text-[11px] font-bold leading-tight">{l.start_time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800 text-sm">{l.student_name}</p>
                        {l.duration_minutes && <span className="text-xs text-slate-400">{l.duration_minutes} min</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{l.topic}{l.subject_name ? ` - ${l.subject_name}` : ''}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {l.delay_minutes !== null && l.delay_minutes !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            l.delay_minutes > 0 ? 'bg-red-50 text-red-600' : l.delay_minutes < 0 ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {l.delay_minutes > 0 ? `${l.delay_minutes} min kech` : l.delay_minutes < 0 ? `${Math.abs(l.delay_minutes)} min erta` : 'Oz vaqtida'}
                          </span>
                        )}
                        {l.rating && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            <svg className="w-3 h-3 inline mr-0.5 text-amber-500 -mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> {l.rating.score}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'student' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Studentlar</h2>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {studentStatuses.filter((s) => !s.is_busy).length}</span>
              <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500" /> {studentStatuses.filter((s) => s.is_busy).length}</span>
            </div>
          </div>
          {studentStatuses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">Studentlar topilmadi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentStatuses.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.is_busy ? 'bg-red-500' : 'bg-emerald-500'} shadow-sm`} />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{s.first_name || s.username}</p>
                        <p className="text-xs text-slate-400">ID: {s.secret_id || 'Mavjud emas'}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      s.is_busy ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {s.is_busy ? 'Band' : 'Bosh'}
                    </span>
                  </div>
                  {s.is_busy && s.current_lesson && (
                    <div className="mt-2 ml-5 bg-red-50/50 rounded-lg p-2.5 text-xs text-slate-500 space-y-0.5 border border-red-100/50">
                      <p>Support: {s.current_lesson.support_name}</p>
                      <p>Mavzu: {s.current_lesson.topic}</p>
                      <p>Boshlangan: {s.current_lesson.start_time}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'vaqt' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Ish vaqtlarim</h2>
            <button onClick={() => setShowScheduleForm(!showScheduleForm)}
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                showScheduleForm ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showScheduleForm ? 'M6 18L18 6M6 6l12 12' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'} /></svg>
              {showScheduleForm ? 'Yopish' : 'Qoshish'}
            </button>
          </div>
          {showScheduleForm && (
            <form onSubmit={handleAddSchedule} className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Kun</label>
                  <select value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                    {DAYS.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Boshlanish</label>
                    <input type="time" value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Tugash</label>
                    <input type="time" value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm">
                  Saqlash
                </button>
              </div>
            </form>
          )}
          {mySchedules.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-sm text-slate-400">Hali ish vaqti qoshilmagan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {mySchedules.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-[11px] font-bold">
                      {s.day_of_week_display?.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{s.day_of_week_display}</p>
                      <p className="text-xs text-slate-400">{s.start_time} - {s.end_time}{s.room_name ? ` (${s.room_name})` : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSchedule(s.id)}
                    className="text-red-500 text-xs font-medium hover:text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 active:scale-95 transition-all">
                    Olib tashlash
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
