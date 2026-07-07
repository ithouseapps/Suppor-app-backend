import { useState, useEffect } from 'react';
import { getBotConfig, updateBotConfig } from '../../api';

export default function TelegramSettings() {
  const [chatId, setChatId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    getBotConfig().then((r) => {
      setChatId(r.data.chat_id);
      setBotToken(r.data.bot_token || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotif(null);
    try {
      const r = await updateBotConfig({ chat_id: chatId, bot_token: botToken });
      setNotif({ type: 'success', text: r.data.message || 'Saqlandi' });
    } catch (err) {
      setNotif({ type: 'error', text: 'Xatolik yuz berdi' });
    } finally {
      setSaving(false);
      setTimeout(() => setNotif(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 ${
          notif.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notif.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {notif.text}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-800">Telegram sozlamalari</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Chat ID</label>
            <input type="text" value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" required />
            <p className="text-xs text-slate-400 mt-1.5">Bot habarlari yuboriladigan Telegram chat ID</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bot Token</label>
            <input type="text" value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" required />
            <p className="text-xs text-slate-400 mt-1.5">Telegram bot tokeni (BotFather dan olingan)</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
