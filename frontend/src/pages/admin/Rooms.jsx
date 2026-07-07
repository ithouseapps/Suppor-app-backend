import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../api';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const load = () => getRooms().then((r) => setRooms(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateRoom(editing.id, { name });
    } else {
      await createRoom({ name });
    }
    setShowModal(false);
    setEditing(null);
    setName('');
    load();
  };

  const handleEdit = (r) => {
    setEditing(r);
    setName(r.name);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Rostdan ochirish?')) {
      await deleteRoom(id);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xonalar</h1>
        <button onClick={() => { setEditing(null); setName(''); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Xona qoshish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${room.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {room.is_active ? 'Aktiv' : 'Noaktiv'}
              </span>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t text-sm">
              <button onClick={() => handleEdit(room)} className="text-blue-600 hover:text-blue-800">Tahrirlash</button>
              <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800">Ochirish</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Tahrirlash' : 'Xona qoshish'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Xona nomi" value={name} onChange={(e) => setName(e.target.value)}
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
