import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardSupports, getDashboardRooms, getSupportDelays } from '../../api';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{ borderLeftColor: color }}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [supports, setSupports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [delays, setDelays] = useState([]);

  useEffect(() => {
    getDashboardStats().then((r) => setStats(r.data));
    getDashboardSupports().then((r) => setSupports(r.data));
    getDashboardRooms().then((r) => setRooms(r.data));
    getSupportDelays().then((r) => setDelays(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Bugungi studentlar" value={stats.today_students} color="#3B82F6" />
          <StatCard label="Bugungi darslar" value={stats.today_lessons} color="#10B981" />
          <StatCard label="Bugungi bronlar" value={stats.today_bookings} color="#F59E0B" />
          <StatCard label="Bosh supportlar" value={stats.free_supports} color="#10B981" />
          <StatCard label="Band supportlar" value={stats.busy_supports} color="#EF4444" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Academic Supportlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supports.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{s.user.username}</h3>
                <div className="flex items-center gap-2">
                  {s.is_banned && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Bloklangan</span>}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.status === 'free' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {s.status === 'free' ? 'Bosh' : 'Dars otyapti'}
                  </span>
                </div>
              </div>
              {s.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {s.subjects.map((sub) => (
                    <span key={sub.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{sub.name}</span>
                  ))}
                </div>
              )}
              {s.current_lesson && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm space-y-1">
                  <p><span className="text-gray-500">Student:</span> <span className="font-medium">{s.current_lesson.student}</span></p>
                  <p><span className="text-gray-500">Mavzu:</span> {s.current_lesson.topic}</p>
                  <p><span className="text-gray-500">Boshlangan:</span> {s.current_lesson.start_time}</p>
                  {s.current_lesson.room && <p><span className="text-gray-500">Xona:</span> {s.current_lesson.room}</p>}
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                <span>Bugun: {s.today_lessons_count} dars</span>
                <span>{s.today_students_count} student</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Xonalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{room.name}</h3>
                <span className={`w-3 h-3 rounded-full ${room.status === 'free' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              {room.current_lesson && (
                <div className="mt-3 text-sm space-y-1 bg-gray-50 rounded-lg p-3">
                  <p>Support: {room.current_lesson.support_name}</p>
                  <p>Student: {room.current_lesson.student_name}</p>
                  <p>Mavzu: {room.current_lesson.topic}</p>
                  <p>Boshlangan: {room.current_lesson.start_time}</p>
                </div>
              )}
              {room.status === 'free' && <p className="text-green-600 text-sm mt-2">Bosh</p>}
            </div>
          ))}
        </div>
      </div>

      {delays.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Dars kechikish/ertalik statistikasi</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Support</th>
                    <th className="text-center px-4 py-3 font-medium">Jami dars</th>
                    <th className="text-center px-4 py-3 font-medium">Kechikkan</th>
                    <th className="text-center px-4 py-3 font-medium">Erta boshlangan</th>
                    <th className="text-center px-4 py-3 font-medium">Oz vaqtida</th>
                    <th className="text-center px-4 py-3 font-medium">Ortacha kechikish</th>
                    <th className="text-center px-4 py-3 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {delays.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{d.username}</td>
                      <td className="px-4 py-3 text-center">{d.total_lessons}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.delayed_lessons > 0 ? 'text-red-600 font-medium' : ''}>{d.delayed_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.early_lessons > 0 ? 'text-blue-600 font-medium' : ''}>{d.early_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={d.on_time_lessons > 0 ? 'text-green-600 font-medium' : ''}>{d.on_time_lessons}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.avg_delay_minutes > 0 ? `${d.avg_delay_minutes} min` : '0 min'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.is_banned ? (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Bloklangan</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Aktiv</span>
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