import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, generateSecretId } from '../../api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', first_name: '', last_name: '', phone: '' });

  const load = () => getUsers({ role: 'student' }).then((r) => setStudents(r.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, role: 'student' };
    if (editing) {
      if (!data.password) delete data.password;
      await updateUser(editing.id, data);
    } else {
      await createUser(data);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ username: '', password: '', first_name: '', last_name: '', phone: '' });
    load();
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({ username: s.username, password: '', first_name: s.first_name, last_name: s.last_name, phone: s.phone || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Rostdan ochirish?')) {
      await deleteUser(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Studentlar</h1>
        <button onClick={() => { setEditing(null); setForm({ username: '', password: '', first_name: '', last_name: '', phone: '' }); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Student qoshish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Username</th>
                  <th className="text-left px-4 py-3 font-medium">Ism</th>
                  <th className="text-left px-4 py-3 font-medium">Familiya</th>
                  <th className="text-left px-4 py-3 font-medium">Telefon</th>
                  <th className="text-left px-4 py-3 font-medium">Maxfiy ID</th>
                  <th className="text-right px-4 py-3 font-medium">Harakat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.username}</td>
                    <td className="px-4 py-3 text-gray-600">{s.first_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.last_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="font-mono font-bold text-blue-700">{s.secret_id || '-'}</span>
                      <button onClick={async () => {
                        try {
                          const res = await generateSecretId(s.id);
                          alert(`Yangi maxfiy ID: ${res.data.secret_id}`);
                          load();
                        } catch (err) {
                          alert('Xatolik');
                        }
                      }} className="ml-2 text-xs text-blue-600 hover:text-blue-800">
                        {s.secret_id ? 'Yangilash' : 'Yaratish'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 mr-3">Tahrirlash</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">Ochirish</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Tahrirlash' : 'Student qoshish'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input placeholder="Parol" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required={!editing} />
              <input placeholder="Ism" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Familiya" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  {editing ? 'Saqlash' : 'Qoshish'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
