import { useState, useEffect } from 'react';
import { getLessons } from '../../api';

export default function StudentHistory() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    getLessons().then((r) => setLessons(r.data));
  }, []);

  const completed = lessons.filter((l) => !l.is_active);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-slate-800">Dars tarixi</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
        <div className="p-4 border-b border-slate-200/60 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Jami: <strong>{completed.length}</strong> ta dars
          </div>
        </div>
        <div className="divide-y divide-slate-200/60">
          {completed.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Hali dars otilmagan</div>
          ) : (
            completed.map((l) => (
              <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 text-blue-600 rounded-lg px-3 py-1.5 text-sm font-semibold min-w-[60px] text-center border border-blue-200/60">
                      {l.start_time}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{l.support_name}</p>
                      <p className="text-sm text-slate-600">{l.topic}</p>
                      {l.subject_name && (
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded mt-1">
                          {l.subject_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{l.duration_minutes} daqiqa</p>
                    <p className="text-xs">{l.date}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
