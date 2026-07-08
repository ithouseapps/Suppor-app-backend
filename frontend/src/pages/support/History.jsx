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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Dars tarixi</h1>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'today', label: 'Bugun' },
            { key: 'week', label: 'Hafta' },
            { key: 'month', label: 'Oy' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === item.key ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
        <div className="p-4 border-b border-slate-200/60 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Jami: <strong>{completedLessons.length}</strong> ta dars</span>
          </div>
          <span>
            {(() => { const ind = new Set(); const grp = new Map(); completedLessons.forEach(l => l.student_count ? grp.set(l.student, l.student_count) : ind.add(l.student)); return ind.size + [...grp.values()].reduce((a, b) => a + b, 0); })()} ta student
          </span>
        </div>
        <div className="divide-y divide-slate-200/60">
          {completedLessons.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Hali dars otilmagan</div>
          ) : (
            completedLessons.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 text-blue-600 rounded-lg px-3 py-1.5 text-sm font-semibold min-w-[60px] text-center border border-blue-200/60">
                      {l.start_time}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{l.student_name}</p>
                      <p className="text-sm text-slate-600">{l.topic}</p>
                      {l.subject_name && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded mt-1">
                          {l.subject_name}
                        </span>
                      )}
                      {l.student_count && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded mt-1 ml-1">
                          {l.student_count} o'quvchi
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{l.duration_minutes} daqiqa</p>
                    {l.room_name && <p className="text-xs">{l.room_name}</p>}
                  </div>
                </div>
                {l.comment && <p className="text-sm text-slate-400 mt-2 ml-[76px]">{l.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
