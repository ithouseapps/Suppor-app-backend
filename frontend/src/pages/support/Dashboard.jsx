import { useState, useEffect } from 'react';
import { useAuth } from '../../auth';
import { getBookings, getLessons, startLesson, endLesson, cancelBooking, getSupports, getUsers, getStudentStatus, getSchedules, createSchedule, deleteSchedule } from '../../api';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [support, setSupport] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [form, setForm] = useState({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '' });
  const [todayStats, setTodayStats] = useState({ lessons: 0, students: 0 });
  const [studentStatuses, setStudentStatuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customTime, setCustomTime] = useState(false);
  const [mySchedules, setMySchedules] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '18:00' });

  const today = new Date().toISOString().split('T')[0];
  const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  const load = async () => {
    try {
      const [supRes] = await Promise.all([getSupports()]);
      const mySupport = supRes.data.find((s) => s.user.id === user.id);
      setSupport(mySupport);
    } catch {}
    getBookings({ date: today }).then((r) => setBookings(r.data));
    const allLessRes = await getLessons();
    const activeGlobal = allLessRes.data.find((l) => l.is_active);
    setActiveLesson(activeGlobal || null);
    const lessRes = allLessRes.data.filter((l) => l.date === today);
    setLessons(lessRes);
    getUsers({ role: 'student' }).then((r) => setStudents(r.data)).catch(() => {});
    getStudentStatus().then((r) => setStudentStatuses(r.data));
    getSchedules().then((r) => setMySchedules(r.data)).catch(() => {});

    const completed = lessRes.filter((l) => !l.is_active);
    const uniqueStudents = new Set(completed.map((l) => l.student)).size;
    setTodayStats({ lessons: completed.length, students: uniqueStudents });
  };

  useEffect(() => { load(); }, []);

  const handleStartLesson = async (e) => {
    e.preventDefault();
    try {
      const selectedStudent = form.student_id ? students.find(s => s.id == form.student_id) : null;
      const payload = {
        student_name: selectedStudent ? selectedStudent.username : form.student_name,
        topic: form.topic,
        comment: form.comment,
        scheduled_start: form.scheduled_start || undefined,
      };
      const res = await startLesson(payload);
      setActiveLesson(res.data);
      setShowStart(false);
      setForm({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '' });
      setCustomTime(false);
      setNotifications((prev) => [...prev, { type: 'success', text: `Dars boshlandi: ${res.data.student_name} - ${res.data.topic}`, time: new Date().toLocaleTimeString() }]);
      load();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Xatolik';
      setNotifications((prev) => [...prev, { type: 'error', text: errMsg, time: new Date().toLocaleTimeString() }]);
      alert(errMsg);
    }
  };

  const handleEndLesson = async () => {
    if (!activeLesson) return;
    try {
      await endLesson({ lesson_id: activeLesson.id });
      setActiveLesson(null);
      setNotifications((prev) => [...prev, { type: 'success', text: `Dars tugadi: ${activeLesson.student_name}`, time: new Date().toLocaleTimeString() }]);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await createSchedule(scheduleForm);
      setShowScheduleForm(false);
      setScheduleForm({ day_of_week: 0, start_time: '09:00', end_time: '18:00' });
      getSchedules().then((r) => setMySchedules(r.data));
      setNotifications((prev) => [...prev, { type: 'success', text: 'Ish vaqti qoshildi', time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Bronni bekor qilishni tasdiqlaysizmi?")) return;
    try {
      await cancelBooking(id);
      setNotifications((prev) => [...prev, { type: 'success', text: 'Bron bekor qilindi', time: new Date().toLocaleTimeString() }]);
      getBookings({ date: today }).then((r) => setBookings(r.data));
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      getSchedules().then((r) => setMySchedules(r.data));
      setNotifications((prev) => [...prev, { type: 'success', text: 'Ish vaqti olib tashlandi', time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
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

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>

      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-3 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-sm font-semibold text-blue-700">Bildirishnomalar</h3>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {notifications.slice(-5).reverse().map((n, i) => (
              <div key={i} className={`text-xs p-1.5 rounded ${n.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                [{n.time}] {n.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {support && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
              {support.user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">{support.user.username}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {support.subjects?.map((sub) => (
                  <span key={sub.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{sub.name}</span>
                ))}
              </div>
              {support.is_banned && (
                <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded mt-1">Bloklangan</span>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-500">Bugun: <span className="font-semibold text-slate-800">{todayStats.lessons} dars</span></p>
            <p className="text-slate-500">{todayStats.students} student</p>
          </div>
        </div>
      )}

      {activeLesson ? (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="font-semibold text-slate-800">Dars davom etmoqda</h2>
            </div>
            <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">Aktiv</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <p><span className="text-slate-500">Student:</span> <span className="font-medium text-slate-800">{activeLesson.student_name}</span></p>
            <p><span className="text-slate-500">Mavzu:</span> <span className="text-slate-800">{activeLesson.topic}</span></p>
            <p><span className="text-slate-500">Boshlangan:</span> <span className="text-slate-800">{activeLesson.start_time}</span></p>
            {activeLesson.room_name && <p><span className="text-slate-500">Xona:</span> <span className="text-slate-800">{activeLesson.room_name}</span></p>}
            {activeLesson.scheduled_start && (
              <p className="col-span-2">
                <span className="text-slate-500">Rejalashtirilgan:</span> <span className="text-slate-800">{activeLesson.scheduled_start}</span>
                {getDelayInfo() && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    getDelayInfo().type === 'delay' ? 'bg-red-100 text-red-700' : 
                    getDelayInfo().type === 'early' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {getDelayInfo().text}
                  </span>
                )}
              </p>
            )}
          </div>
          <button onClick={handleEndLesson} className="inline-flex items-center gap-1.5 bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Darsni tugatish
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="font-semibold text-slate-800">Yangi dars boshlash</h2>
            </div>
            <button onClick={() => setShowStart(!showStart)} className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Darsni boshlash
            </button>
          </div>
          {showStart && (
            <form onSubmit={handleStartLesson} className="space-y-3 border-t border-slate-200/60 pt-4">
              <input placeholder="Student ismini yozing" value={form.student_name}
                onChange={(e) => { setForm({ ...form, student_name: e.target.value, student_id: '' }); }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value, student_name: '' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Yoki royxatdan tanlang</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.username}{s.first_name ? ` (${s.first_name})` : ''}</option>
                ))}
              </select>
              <input placeholder="Mavzu" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="customTime" checked={customTime} onChange={() => setCustomTime(!customTime)}
                  className="rounded border-slate-300" />
                <label htmlFor="customTime" className="text-sm text-slate-600">Boshqa vaqtni belgilash</label>
              </div>

              {customTime && (
                <div className="flex items-center gap-2">
                  <input type="time" value={form.scheduled_start}
                    onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm flex-1 outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    setForm({ ...form, scheduled_start: `${h}:${m}` });
                    setCustomTime(true);
                  }} className="text-blue-600 text-sm font-medium hover:text-blue-800 shrink-0">
                    Hozir
                  </button>
                </div>
              )}

              {!customTime && (
                <p className="text-xs text-slate-500">Hozirgi vaqtda dars boshlanadi ({new Date().toLocaleTimeString()})</p>
              )}

              <textarea placeholder="Izoh (ixtiyoriy)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Boshlash
                </button>
                <button type="button" onClick={() => { setShowStart(false); setForm({ student_name: '', student_id: '', topic: '', comment: '', scheduled_start: '' }); }} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="font-semibold text-slate-800">Bron qilgan oquvchilar</h2>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">Bugungi bronlar yoq</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {b.student_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{b.student_name}</p>
                      <p className="text-xs text-slate-400">{b.start_time} - {b.end_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      b.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {b.status_display}
                    </span>
                    {b.status !== 'completed' && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => {
                          setForm({ student_name: b.student_name || '', student_id: '', topic: b.subject_name || '', comment: '', scheduled_start: '' });
                          setShowStart(true);
                        }} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                          Dars boshlash
                        </button>
                        <button onClick={() => handleCancelBooking(b.id)}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="font-semibold text-slate-800">Bugun otilgan darslar</h2>
          </div>
          {lessons.filter((l) => !l.is_active).length === 0 ? (
            <p className="text-sm text-slate-500">Hali dars otilmagan</p>
          ) : (
            <div className="space-y-2">
              {lessons.filter((l) => !l.is_active).map((l) => (
                <div key={l.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{l.student_name}</span>
                    <span className="text-slate-500">{l.start_time} - {l.end_time}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">{l.topic}{l.subject_name ? ` - ${l.subject_name}` : ''}</p>
                  {l.delay_minutes !== null && l.delay_minutes !== undefined && (
                    <span className={`text-xs mt-1 inline-block px-1.5 py-0.5 rounded ${
                      l.delay_minutes > 0 ? 'bg-red-50 text-red-600' : l.delay_minutes < 0 ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {l.delay_minutes > 0 ? `${l.delay_minutes} min kech` : l.delay_minutes < 0 ? `${Math.abs(l.delay_minutes)} min erta` : 'Oz vaqtida'}
                    </span>
                  )}
                  {l.rating && (
                    <span className="text-xs ml-2 text-emerald-600">Baho: {l.rating.score}/5</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h2 className="font-semibold text-slate-800">Studentlar</h2>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Bosh ({studentStatuses.filter((s) => !s.is_busy).length})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Band ({studentStatuses.filter((s) => s.is_busy).length})</span>
          </div>
        </div>
        {studentStatuses.length === 0 ? (
          <p className="text-sm text-slate-500">Studentlar topilmadi</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {studentStatuses.map((s) => (
              <div key={s.id} className={`rounded-lg p-3 text-sm border ${
                s.is_busy ? 'bg-red-50 border-red-200/60' : 'bg-emerald-50 border-emerald-200/60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.is_busy ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <span className="font-medium text-slate-800">{s.first_name || s.username}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.is_busy ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {s.is_busy ? 'Band' : 'Bosh'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">ID: {s.secret_id || 'Mavjud emas'}</div>
                {s.is_busy && s.current_lesson && (
                  <div className="mt-2 text-xs text-slate-500 pl-5">
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="font-semibold text-slate-800">Ish vaqtlarim</h2>
          </div>
          <button onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
            Vaqt qoshish
          </button>
        </div>
        {showScheduleForm && (
          <form onSubmit={handleAddSchedule} className="space-y-2 mb-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Kun</label>
                <select value={scheduleForm.day_of_week} onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Boshlanish</label>
                <input type="time" value={scheduleForm.start_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tugash</label>
                <input type="time" value={scheduleForm.end_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">
              Saqlash
            </button>
          </form>
        )}
        {mySchedules.length === 0 ? (
          <p className="text-sm text-slate-400">Hali ish vaqti qoshilmagan</p>
        ) : (
          <div className="space-y-1">
            {mySchedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{s.day_of_week_display}</span>
                <span className="text-slate-600">{s.start_time} - {s.end_time}{s.room_name ? ` (${s.room_name})` : ''}</span>
                <button onClick={() => handleDeleteSchedule(s.id)}
                  className="inline-flex items-center gap-1 text-red-500 text-xs hover:text-red-700 font-medium">
                  Olib tashlash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
