import { useState, useEffect } from 'react';
import { getStudentSupports, getSupportSchedules, getAvailableSlots, createBooking, getBookings, rateLesson, getLessons } from '../../api';

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
  const [step, setStep] = useState('support');
  const [tab, setTab] = useState('bron');
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
    setMessageType('success');
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
      setStep('support');
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
        setMyLessons(r.data.filter((l) => !l.is_active));
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const selectedSupportId = manualSupportId && manualSupportId !== '0' ? Number(manualSupportId) : selectedSupport;
  const selectedSupportData = supports.find((s) => s.id === selectedSupportId);

  const getDaySchedule = (sch) => {
    const today = new Date().getDay();
    const dayMap = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    return sch.schedules.filter((s) => s.day_of_week === dayMap[today]);
  };

  return (
    <div className="space-y-4 pb-4">
      {ratingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setRatingModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-bold text-slate-800 mb-1">Darsni baholash</h2>
            <p className="text-sm text-slate-500">Support: <span className="font-medium text-slate-700">{ratingModal.support_name}</span></p>
            <p className="text-sm text-slate-500 mb-5">Mavzu: <span className="font-medium text-slate-700">{ratingModal.topic}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">Baho</label>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRatingScore(s)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        s <= ratingScore ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <input placeholder="Izoh (ixtiyoriy)" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              <div className="flex gap-2 pt-1">
                <button onClick={handleRate} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors active:scale-[0.98]">
                  Baholash
                </button>
                <button onClick={() => setRatingModal(null)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Keyin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm ${
          messageType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
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

      <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-100 flex">
        {[
          { key: 'bron', label: 'Bron' },
          { key: 'jadval', label: 'Jadval' },
          { key: 'darslar', label: 'Darslar' },
        ].map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === item.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'jadval' && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">Supportlar dars jadvali</h2>
          {schedules.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-slate-400">Hech qanday malumot yoq</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => {
                const todaySch = getDaySchedule(s);
                return (
                  <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-slate-800">{s.user.first_name || s.user.username}</h3>
                    {s.subjects?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.subjects.map((sub) => (
                          <span key={sub.id} className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">{sub.name}</span>
                        ))}
                      </div>
                    )}
                    {todaySch.length > 0 ? (
                      <div className="mt-3 space-y-1.5">
                        {todaySch.map((sch) => (
                          <div key={sch.id} className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium text-slate-700">{sch.start_time} - {sch.end_time}</span>
                            </div>
                            {sch.room_name && <span className="text-slate-400">Xona: {sch.room_name}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">Bugungi darslar yoq</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'bron' && (
        <>
          {step === 'support' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">Supportlar</h2>
              </div>
              <div className="space-y-3">
                {supports.map((s) => (
                  <button key={s.id}
                    onClick={() => { setSelectedSupport(s.id); setManualSupportId(''); setSelectedSlot(null); setStep('slot'); }}
                    className={`w-full bg-white rounded-2xl p-4 text-left shadow-sm border transition-all active:scale-[0.98] ${
                      s.is_busy ? 'border-amber-100' : 'border-slate-100 hover:border-blue-200 hover:shadow-md'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base">
                          {s.user.first_name?.[0] || s.user.username[0].toUpperCase()}
                        </div>
                        <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          s.is_busy ? 'bg-red-400' : 'bg-green-400'
                        }`}></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{s.user.first_name || s.user.username}</p>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            s.is_busy ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                          }`}>
                            {s.is_busy ? 'Band' : 'Bosh'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.subjects?.map((sub) => (
                            <span key={sub.id} className="bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-full font-medium">{sub.name}</span>
                          ))}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mt-3">
                <h3 className="text-sm font-medium text-slate-600 mb-3">Qolda kiritish</h3>
                <div className="relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                  <input value={manualSupportId} onChange={(e) => { setManualSupportId(e.target.value); setSelectedSupport(null); setSelectedSlot(null); setStep('slot'); }}
                    placeholder="Support ID ni kiriting" type="number"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
              </div>
            </div>
          )}

          {step === 'slot' && selectedSupportData && (
            <div>
              <button onClick={() => setStep('support')} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-4 hover:text-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Supportlar
              </button>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {selectedSupportData.user.first_name?.[0] || selectedSupportData.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedSupportData.user.first_name || selectedSupportData.user.username}</p>
                    {selectedSupportData.subjects?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {selectedSupportData.subjects.map((sub) => (
                          <span key={sub.id} className="bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-full font-medium">{sub.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                <label className="block text-sm font-medium text-slate-600 mb-2">Sana</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Vaqtni tanlang</h3>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <svg className="w-5 h-5 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6">
                    <svg className="w-8 h-8 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-slate-400">Bu sana uchun vaqt mavjud emas. Boshqa sanani tanlang.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, idx) => (
                      <button key={idx} onClick={() => !slot.is_booked && setSelectedSlot(slot)} disabled={slot.is_booked}
                        className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                          slot.is_booked
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : selectedSlot?.start_time === slot.start_time
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200 active:scale-95'
                        }`}>
                        {slot.start_time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 shadow-lg mt-4">
                  <h3 className="text-white font-semibold mb-2">Bronni tasdiqlash</h3>
                  <div className="text-blue-100 text-sm space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                    </div>
                  </div>
                  <button onClick={handleBook} disabled={loading}
                    className="w-full bg-white text-blue-700 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-50 disabled:opacity-50 transition-all active:scale-[0.98]">
                    {loading ? 'Yuborilmoqda...' : 'Bron qilish'}
                  </button>
                </div>
              )}
            </div>
          )}
          {step === 'slot' && !selectedSupportData && (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100 text-center">
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-slate-400">Support topilmadi. ID ni tekshirib qayta kiriting.</p>
              <button onClick={() => setStep('support')} className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-700">
                Supportlar royxatiga qaytish
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'darslar' && (
        <div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Mening bronlarim</h2>
            {myBookings.length === 0 ? (
              <div className="text-center py-6">
                <svg className="w-8 h-8 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-slate-400">Hali bronlaringiz yoq</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {b.support_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{b.support_name}</p>
                        <p className="text-xs text-slate-400">{b.date} | {b.start_time} - {b.end_time}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                      b.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      b.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                      b.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {b.status_display}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mt-4">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Tugagan darslar</h2>
            {myLessons.length === 0 ? (
              <div className="text-center py-6">
                <svg className="w-8 h-8 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm text-slate-400">Hali dars otilmagan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myLessons.map((l) => (
                  <div key={l.id} className="bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {l.support_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{l.support_name}</p>
                          <p className="text-xs text-slate-500">{l.topic}</p>
                          <p className="text-xs text-slate-400">{l.date} {l.start_time} ({l.duration_minutes} min)</p>
                        </div>
                      </div>
                      {l.rating ? (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">{l.rating.score}/5</span>
                      ) : (
                        <span className="text-xs text-slate-400">Baholanmagan</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
