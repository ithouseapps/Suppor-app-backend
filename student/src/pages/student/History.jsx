import { useState, useEffect } from 'react';
import { getLessons } from '../../api';

export default function StudentHistory() {
  const [lessons, setLessons] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getLessons().then((r) => setLessons(r.data));
  }, []);

  const completed = lessons.filter((l) => !l.is_active);

  const getFiltered = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return completed.filter((l) => {
      const lessonDate = new Date(l.date);
      if (filter === 'bugun') return lessonDate >= startOfDay;
      if (filter === 'hafta') return lessonDate >= startOfWeek;
      if (filter === 'oy') return lessonDate >= startOfMonth;
      return true;
    });
  };

  const filtered = getFiltered();

  const filters = [
    { key: 'all', label: 'Hammasi' },
    { key: 'bugun', label: 'Bugun' },
    { key: 'hafta', label: 'Hafta' },
    { key: 'oy', label: 'Oy' },
  ];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Dars tarixi</h2>
        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
          Jami: {completed.length}
        </span>
      </div>

      <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-100 flex">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm text-slate-400">Hali dars otilmagan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white rounded-xl px-3 py-2 text-center min-w-[56px]">
                  <p className="text-sm font-bold leading-tight">{l.start_time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{l.support_name}</p>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{l.topic}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{l.duration_minutes} daq</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {l.subject_name && (
                      <span className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">{l.subject_name}</span>
                    )}
                    <span className="bg-slate-100 text-slate-500 text-[11px] px-2.5 py-0.5 rounded-full font-medium">{l.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
