import { useState, useEffect } from 'react';
import { getLessons } from '../../api';

export default function SupportHistory() {
  const [lessons, setLessons] = useState([]);
  const [filter, setFilter] = useState('today');

  const getDateRange = () => {
    const today = new Date();
    if (filter === 'today') return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    if (filter === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(today);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    if (filter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    return { start: '', end: '' };
  };

  const load = async () => {
    const range = getDateRange();
    const res = await getLessons({ date: range.start });
    setLessons(res.data);
  };

  useEffect(() => { load(); }, [filter]);

  const completedLessons = lessons.filter((l) => !l.is_active);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Dars tarixi</h1>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            { key: 'today', label: 'Bugun' },
            { key: 'week', label: 'Hafta' },
            { key: 'month', label: 'Oy' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === item.key ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Jami: <strong className="text-slate-800">{completedLessons.length}</strong> ta dars</span>
          <span><strong className="text-slate-800">{new Set(completedLessons.map((l) => l.student)).size}</strong> ta student</span>
        </div>
        <div className="divide-y divide-slate-100">
          {completedLessons.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Hali dars otilmagan</p>
            </div>
          ) : (
            completedLessons.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-lg px-2.5 py-1.5 text-center min-w-[52px] shadow-sm">
                      <p className="text-[11px] font-bold leading-tight">{l.start_time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{l.student_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{l.topic}</p>
                      {l.subject_name && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded mt-1.5 font-medium">
                          {l.subject_name}
                        </span>
                      )}
                      {l.student_count && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded mt-1.5 font-medium ml-1">
                          {l.student_count} o'quvchi
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 shrink-0 ml-3">
                    <p>{l.duration_minutes} daqiqa</p>
                    {l.room_name && <p className="text-[10px]">{l.room_name}</p>}
                  </div>
                </div>
                {l.comment && <p className="text-xs text-slate-400 mt-2 ml-[64px]">{l.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
