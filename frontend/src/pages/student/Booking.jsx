import { useState, useEffect } from 'react';
import { getStudentSupports, getSupportSchedules, getAvailableSlots, createBooking, getBookings, rateLesson, getLessons } from '../../api';

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

export default function StudentBooking() {
  const [supports, setSupports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [myBookings, setMyBookings] = useState([]);
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [tab, setTab] = useState('supports');
  const [manualSupportId, setManualSupportId] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const load = async () => {
    getStudentSupports().then((r) => setSupports(r.data)).catch(() => {});
    getSupportSchedules().then((r) => setSchedules(r.data)).catch(() => {});
    getBookings().then((r) => setMyBookings(r.data)).catch(() => {});
    getLessons().then((r) => {
      const completed = r.data.filter((l) => !l.is_active);
      setMyLessons(completed);
      const unrated = completed.find((l) => !l.rating);
      if (unrated) setRatingModal(unrated);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selectedSupport) {
      setSlotsLoading(true);
      setSlots([]);
      getAvailableSlots(selectedSupport, date)
        .then((r) => setSlots(r.data))
        .catch(() => setSlots([]))
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedSupport, date]);

  const handleBook = async () => {
    if (!selectedSupport && !manualSupportId) return;
    if (!selectedSlot || !date) return;
    setLoading(true);
    setMessage('');
    try {
      await createBooking({
        support: manualSupportId || selectedSupport,
        date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      });
      setMessage('Bron qilindi! Support tasdiqlashini kuting.');
      setMessageType('success');
      setSelectedSlot(null);
      setManualSupportId('');
      getBookings().then((r) => setMyBookings(r.data));
      getAvailableSlots(manualSupportId || selectedSupport, date).then((r) => setSlots(r.data));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Xatolik yuz berdi');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handleRate = async () => {
    if (!ratingModal) return;
    try {
      await rateLesson({ lesson_id: ratingModal.id, score: ratingScore, comment: ratingComment });
      setRatingModal(null);
      setRatingScore(5);
      setRatingComment('');
      getLessons().then((r) => {
        const completed = r.data.filter((l) => !l.is_active);
        setMyLessons(completed);
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const getDaySchedule = (sch) => {
    const today = new Date().getDay();
    const dayMap = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    return sch.schedules.filter((s) => s.day_of_week === dayMap[today]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-xl font-bold text-slate-800">Student panel</h1>

      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRatingModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-slate-200/60 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Darsni baholash</h2>
            <div className="text-sm mb-4 text-slate-600">
              <p>Support: <strong className="text-slate-800">{ratingModal.support_name}</strong></p>
              <p>Mavzu: <strong className="text-slate-800">{ratingModal.topic}</strong></p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Baho</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRatingScore(s)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${s <= ratingScore ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <input placeholder="Izoh (ixtiyoriy)" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2 pt-2">
                <button onClick={handleRate} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Baholash
                </button>
                <button onClick={() => setRatingModal(null)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">
                  Keyin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
          messageType === 'error' ? 'bg-red-50 text-red-600 border-red-200/60' : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
        }`}>
          {messageType === 'error' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4 w-fit">
          <button onClick={() => setTab('supports')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'supports' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Supportlar va darslar
          </button>
          <button onClick={() => setTab('bron')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'bron' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Bron qilish
          </button>
          <button onClick={() => setTab('my')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'my' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Mening darslarim
          </button>
        </div>

        {tab === 'supports' && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Supportlar va dars jadvali</h2>
            {schedules.length === 0 ? (
              <p className="text-sm text-slate-500">Hech qanday support topilmadi</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {schedules.map((s) => {
                  const todaySch = getDaySchedule(s);
                  return (
                    <div key={s.id} className="border border-slate-200/60 rounded-lg p-3 text-sm">
                      <h3 className="font-semibold text-slate-800">{s.user.first_name || s.user.username}</h3>
                      {s.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.subjects.map((sub) => (
                            <span key={sub.id} className="bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5 rounded">{sub.name}</span>
                          ))}
                        </div>
                      )}
                      {todaySch.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {todaySch.map((sch) => (
                            <div key={sch.id} className="bg-slate-50 rounded p-2 text-xs">
                              <span className="font-medium text-slate-700">{sch.start_time} - {sch.end_time}</span>
                              {sch.room_name && <span className="text-slate-400 ml-2">Xona: {sch.room_name}</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Bugungi darslar yoq</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'bron' && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Bron qilish</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-slate-200/60 p-3">
                  <h3 className="font-medium text-sm text-slate-700 mb-2">Support tanlang</h3>
                  {supports.map((s) => (
                    <button key={s.id} onClick={() => { setSelectedSupport(s.id); setManualSupportId(''); setSelectedSlot(null); }}
                      disabled={s.is_busy}
                      className={`w-full text-left p-2.5 rounded-lg mb-1.5 text-sm transition-colors ${
                        s.is_busy
                          ? 'bg-red-50 border border-red-200/60 opacity-70 cursor-not-allowed'
                          : selectedSupport === s.id && !manualSupportId
                            ? 'bg-blue-50 border border-blue-200/60'
                            : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.is_busy ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        <p className="font-medium text-slate-800">{s.user.username}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          s.is_busy ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {s.is_busy ? 'Band' : 'Bosh'}
                        </span>
                      </div>
                      {s.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 ml-5">
                          {s.subjects.map((sub) => (
                            <span key={sub.id} className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded">{sub.name}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 p-3">
                  <h3 className="font-medium text-sm text-slate-700 mb-2">Qolda kiritish</h3>
                  <input
                    value={manualSupportId}
                    onChange={(e) => { setManualSupportId(e.target.value); setSelectedSupport(null); setSelectedSlot(null); }}
                    placeholder="Support ID ni kiriting"
                    type="number"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                {(selectedSupport || manualSupportId) ? (
                  <>
                    <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                      <h2 className="font-semibold text-slate-800 mb-3">Vaqt tanlash</h2>
                      <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                      {slotsLoading ? (
                        <p className="text-sm text-slate-400 text-center py-4">Yuklanmoqda...</p>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Bu sana uchun vaqt mavjud emas. Boshqa sanani tanlang.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {slots.map((slot, idx) => (
                            <button key={idx} onClick={() => !slot.is_booked && setSelectedSlot(slot)} disabled={slot.is_booked}
                              className={`p-3 rounded-lg text-sm border transition-colors ${
                                slot.is_booked
                                  ? 'bg-red-50 text-red-400 cursor-not-allowed border-red-200/60 line-through'
                                  : selectedSlot?.start_time === slot.start_time
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-200/60 hover:border-blue-300 hover:bg-blue-50'
                              }`}>
                              <span className="font-medium">{slot.start_time}</span>
                              <span className={`block text-xs mt-0.5 ${slot.is_booked ? 'text-red-500' : 'text-slate-400'}`}>{slot.is_booked ? 'Band' : 'Bosh'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedSlot && (
                      <div className="bg-white rounded-xl border border-slate-200/60 p-4">
                        <h2 className="font-semibold text-slate-800 mb-3">Bronni tasdiqlash</h2>
                        <div className="text-sm text-slate-600 space-y-2 mb-4">
                          <p>Vaqt: <strong className="text-slate-800">{selectedSlot.start_time} - {selectedSlot.end_time}</strong></p>
                          <p>Sana: <strong className="text-slate-800">{date}</strong></p>
                        </div>
                        <button onClick={handleBook} disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm">
                          {loading ? 'Yuborilmoqda...' : 'Bron qilish'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200/60 p-8 text-center text-slate-500">
                    Iltimos, chap tomondan Support tanlang yoki ID kiriting
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'my' && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Mening bronlarim</h2>
            {myBookings.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Hali bronlaringiz yoq</p>
            ) : (
              <div className="space-y-2">
                {myBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{b.support_name}</p>
                      <p className="text-slate-500">{b.date} | {b.start_time} - {b.end_time}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {b.status_display}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h2 className="font-semibold text-slate-800 mt-6 mb-3">Tugagan darslar</h2>
            {myLessons.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Hali dars otilmagan</p>
            ) : (
              <div className="space-y-2">
                {myLessons.map((l) => (
                  <div key={l.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{l.support_name}</p>
                        <p className="text-slate-500">{l.topic}{l.subject_name ? ` - ${l.subject_name}` : ''}</p>
                        <p className="text-xs text-slate-400">{l.date} {l.start_time} - {l.end_time} ({l.duration_minutes} min)</p>
                      </div>
                      {l.rating ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          Baholangan: {l.rating.score}/5
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs">Baholanmagan</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
