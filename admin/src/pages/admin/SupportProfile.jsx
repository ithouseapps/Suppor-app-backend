import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupportProfile } from '../../api';

export default function AdminSupportProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    getSupportProfile(id).then((r) => setProfile(r.data)).catch(() => navigate('/admin/supports'));
  }, [id]);

  if (!profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { support, students, total_students, total_lessons, total_completed, total_minutes } = profile;
  const initial = (support?.user?.first_name || support?.user?.username)?.[0]?.toUpperCase() || 'S';

  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/supports')} className="text-slate-500 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-800">Support profili</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{support?.user?.username}</h2>
            <p className="text-sm text-slate-500">{(support?.user?.first_name || '') + (support?.user?.last_name ? ' ' + support?.user?.last_name : '') || '--'}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {support?.subjects?.map((sub) => (
                <span key={sub.id} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-medium">{sub.name}</span>
              ))}
              {(!support?.subjects || support.subjects.length === 0) && (
                <span className="text-[10px] text-slate-400">Fanlar mavjud emas</span>
              )}
            </div>
          </div>
          <div className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded-full ${
            support?.is_banned ? 'bg-red-50 text-red-600 border border-red-200' : support?.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {support?.is_banned ? 'Bloklangan' : support?.is_active ? 'Aktiv' : 'Noaktiv'}
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
          Studentlar ({total_students})
        </h2>
        <div className="space-y-2">
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Hali studentlari yoq</p>
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
                      <p className="font-medium text-slate-800 text-sm">
                        {item.student.username}
                        {item.student.is_group && <span className="text-blue-600 ml-1">({item.student.student_count}ta)</span>}
                      </p>
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
                                {lesson.student_count && <span>| {lesson.student_count} o'quvchi</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400 shrink-0 ml-3">
                            <p>{lesson.date}</p>
                            <p>{lesson.start_time}{lesson.end_time ? ` - ${lesson.end_time}` : ''}</p>
                            {lesson.duration_minutes && <p className="font-medium text-slate-500">{lesson.duration_minutes} min</p>}
                            {lesson.student_count && <p className="font-medium text-slate-500">{lesson.student_count} ta student</p>}
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