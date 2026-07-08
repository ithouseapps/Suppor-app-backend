import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminSupportProfile } from '../../api';

export default function AdminSupportProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    if (id) getAdminSupportProfile(id).then((r) => setProfile(r.data));
  }, [id]);

  if (!profile) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  const { support, students, total_students, total_lessons } = profile;
  const completedLessons = students.reduce((sum, s) => sum + s.completed_lessons, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/admin/supports" className="text-blue-600 text-sm hover:underline">&larr; Supportlar</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {support.user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{support.user.username}</h2>
            <p className="text-gray-500">{support.user.first_name} {support.user.last_name}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {support.subjects?.map((sub) => (
                <span key={sub.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{sub.name}</span>
              ))}
            </div>
            {support.is_banned && (
              <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded mt-2">Bloklangan</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{total_students}</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{total_lessons}</p>
              <p className="text-xs text-gray-500">Jami dars</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{completedLessons}</p>
              <p className="text-xs text-gray-500">Tugagan</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Studentlar ({total_students})
        </h2>
        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              Hali studentlar yoq
            </div>
          ) : (
            students.map((item) => (
              <div key={item.student.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedStudent(expandedStudent === item.student.id ? null : item.student.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                      {item.student.username[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{item.student.first_name || item.student.username}</p>
                      <p className="text-sm text-gray-500">{item.student.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{item.total_lessons}</p>
                      <p className="text-xs text-gray-500">Dars</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{item.completed_lessons}</p>
                      <p className="text-xs text-gray-500">Tugagan</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedStudent === item.student.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedStudent === item.student.id && (
                  <div className="border-t divide-y">
                    {item.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 hover:bg-gray-50 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${lesson.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="font-medium">{lesson.topic}</p>
                            <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                              {lesson.subject_name && <span>{lesson.subject_name}</span>}
                              {lesson.room_name && <span>| {lesson.room_name}</span>}
                              {lesson.student_count && <span>| {lesson.student_count} o'quvchi</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{lesson.date}</p>
                          <p>{lesson.start_time}{lesson.end_time ? ` - ${lesson.end_time}` : ''}</p>
                          {lesson.duration_minutes && <p className="font-medium">{lesson.duration_minutes} min</p>}
                          {lesson.student_count && <p className="font-medium">{lesson.student_count} ta student</p>}
                        </div>
                      </div>
                    ))}
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