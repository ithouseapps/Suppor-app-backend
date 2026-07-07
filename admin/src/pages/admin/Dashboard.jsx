import { useState, useEffect, useRef } from 'react';
import { getDashboardStats, getDashboardSupports, getDashboardRooms, getSupportDelays, downloadMonthlyExcel, getBotConfig, updateBotConfig } from '../../api';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [supports, setSupports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [delays, setDelays] = useState([]);
  const [excelMonth, setExcelMonth] = useState(new Date().getMonth() + 1);
  const [excelYear, setExcelYear] = useState(new Date().getFullYear());
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState('');
  const [chatId, setChatId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [chatIdLoading, setChatIdLoading] = useState(true);
  const [chatIdSaving, setChatIdSaving] = useState(false);
  const [chatNotif, setChatNotif] = useState(null);

  const prevBusyRef = useRef(new Set());

  const notifyStatus = (support, wasBusy) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(wasBusy ? 'Support bosh' : 'Support band', {
        body: wasBusy
          ? `${support.user.username} darsni tugatdi!`
          : `${support.user.username} dars boshladi!`,
        icon: '/logo.png',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const loadDashboard = () => {
    getDashboardStats().then((r) => setStats(r.data));
    getDashboardSupports().then((r) => {
      const busyIds = r.data.filter((s) => s.status === 'busy').map((s) => s.id);
      const prevBusy = prevBusyRef.current;
      r.data.forEach((s) => {
        if (prevBusy.has(s.id) && s.status === 'free') {
          notifyStatus(s, true);
        }
        if (!prevBusy.has(s.id) && s.status === 'busy') {
          notifyStatus(s, false);
        }
      });
      prevBusyRef.current = new Set(busyIds);
      setSupports(r.data);
    });
    getDashboardRooms().then((r) => setRooms(r.data));
    getSupportDelays().then((r) => setDelays(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadDashboard();
    getBotConfig().then((r) => { setChatId(r.data.chat_id); setBotToken(r.data.bot_token || ''); setChatIdLoading(false); }).catch(() => setChatIdLoading(false));
    const interval = setInterval(loadDashboard, 10000);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => clearInterval(interval);
  }, []);

  const handleChatIdSave = async () => {
    setChatIdSaving(true);
    setChatNotif(null);
    try {
      await updateBotConfig({ chat_id: chatId, bot_token: botToken });
      setChatNotif('Saqlandi');
    } catch {
      setChatNotif('Xatolik');
    } finally {
      setChatIdSaving(false);
      setTimeout(() => setChatNotif(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Bugungi studentlar" value={stats.today_students} color="#2563EB" />
          <StatCard label="Bugungi darslar" value={stats.today_lessons} color="#059669" />
          <StatCard label="Bugungi bronlar" value={stats.today_bookings} color="#D97706" />
          <StatCard label="Bosh supportlar" value={stats.free_supports} color="#059669" />
          <StatCard label="Band supportlar" value={stats.busy_supports} color="#DC2626" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-semibold text-slate-700">Excel hisobot</span>
        <select value={excelMonth} onChange={(e) => setExcelMonth(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}-oy</option>
          ))}
        </select>
        <select value={excelYear} onChange={(e) => setExcelYear(Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button onClick={() => { setExcelLoading(true); setExcelError(''); downloadMonthlyExcel(excelYear, excelMonth).catch((e) => { setExcelError('Xatolik yuz berdi'); }).finally(() => setExcelLoading(false)); }}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {excelLoading ? 'Yuklanmoqda...' : 'Yuklab olish'}
        </button>
        {excelError && <span className="text-xs text-red-500 font-medium">{excelError}</span>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">Telegram sozlamalari</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 min-w-[80px]">Chat ID</span>
          <input type="text" value={chatId} disabled={chatIdLoading}
            onChange={(e) => setChatId(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Chat ID" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 min-w-[80px]">Bot Token</span>
          <input type="text" value={botToken} disabled={chatIdLoading}
            onChange={(e) => setBotToken(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bot token" />
        </div>
        <div className="flex items-center gap-3">
          {chatNotif && <span className="text-xs text-emerald-600 font-medium">{chatNotif}</span>}
          <button onClick={handleChatIdSave} disabled={chatIdSaving || chatIdLoading}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {chatIdSaving ? 'Saqlanmoqda...' : chatIdLoading ? 'Yuklanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Academic Supportlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supports.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-800">{s.user.username}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {s.is_banned && <span className="bg-red-50 text-red-600 text-[10px] font-medium px-2 py-0.5 rounded border border-red-200">Bloklangan</span>}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    s.status === 'free' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {s.status === 'free' ? 'Bosh' : 'Dars otyapti'}
                  </span>
                </div>
              </div>
              {s.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {s.subjects.map((sub) => (
                    <span key={sub.id} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">{sub.name}</span>
                  ))}
                </div>
              )}
              {s.current_lesson && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-500">Student:</span>
                    <span className="font-medium text-slate-700">{s.current_lesson.student}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-slate-500">Mavzu:</span>
                    <span className="text-slate-700">{s.current_lesson.topic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-500">Boshlangan:</span>
                    <span className="text-slate-700">{s.current_lesson.start_time}</span>
                  </div>
                  {s.current_lesson.room && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-slate-500">Xona:</span>
                      <span className="text-slate-700">{s.current_lesson.room}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                <span>Bugun: {s.today_lessons_count} dars</span>
                <span>{s.today_students_count} student</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Xonalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="font-semibold text-slate-800">{room.name}</h3>
                </div>
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${room.status === 'free' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
              {room.current_lesson && (
                <div className="mt-3 text-xs space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-500">Support:</span>
                    <span className="font-medium text-slate-700">{room.current_lesson.support_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-slate-500">Student:</span>
                    <span className="text-slate-700">{room.current_lesson.student_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-slate-500">Mavzu:</span>
                    <span className="text-slate-700">{room.current_lesson.topic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-500">Boshlangan:</span>
                    <span className="text-slate-700">{room.current_lesson.start_time}</span>
                  </div>
                </div>
              )}
              {room.status === 'free' && <p className="text-emerald-600 text-xs font-medium mt-2">Bosh</p>}
            </div>
          ))}
        </div>
      </div>

      {delays.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Dars kechikish/ertalik statistikasi</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Support</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Jami dars</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Kechikkan</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Erta boshlangan</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Oz vaqtida</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ortacha kechikish</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {delays.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{d.username}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{d.total_lessons}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.delayed_lessons > 0 ? 'text-red-600 font-semibold' : 'text-slate-600'}>{d.delayed_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.early_lessons > 0 ? 'text-blue-600 font-semibold' : 'text-slate-600'}>{d.early_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.on_time_lessons > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>{d.on_time_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {d.avg_delay_minutes > 0 ? `${d.avg_delay_minutes} min` : '0 min'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.is_banned ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-medium px-2 py-0.5 rounded border border-red-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Bloklangan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-medium px-2 py-0.5 rounded border border-emerald-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Aktiv
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
