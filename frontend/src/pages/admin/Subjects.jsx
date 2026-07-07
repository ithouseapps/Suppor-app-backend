import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const load = () => getSubjects().then((r) => setSubjects(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateSubject(editing.id, { name });
    } else {
      await createSubject({ name });
    }
    setShowModal(false);
    setEditing(null);
    setName('');
    load();
  };

  const handleEdit = (s) => {
    setEditing(s);
    setName(s.name);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Rostdan ochirish?')) {
      await deleteSubject(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fanlar</h1>
        <button onClick={() => { setEditing(null); setName(''); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Fan qoshish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nomi</th>
              <th className="text-left px-4 py-3 font-medium">Holati</th>
              <th className="text-right px-4 py-3 font-medium">Harakat</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Aktiv' : 'Noaktiv'}
                  </span>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Tahrirlash' : 'Fan qoshish'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Fan nomi" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
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
