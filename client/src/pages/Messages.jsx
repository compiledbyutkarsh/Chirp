import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (selected) fetchMessages(selected._id); }, [selected]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      const { data } = await api.post(`/messages/${selected._id}`, { text });
      setMessages([...messages, data]);
      setText('');
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) { setSearchResults([]); return; }
    try {
      const { data } = await api.get(`/users/search/users?q=${val}`);
      setSearchResults(data.filter(u => u._id !== user?.id));
    } catch (err) { console.error(err); }
  };

  const startConversation = (u) => {
    setSelected(u);
    setSearch('');
    setSearchResults([]);
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  };

  return (
    <div className="flex h-screen">
      {/* Left — Conversations */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3">
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>
        <div className="p-3">
          <input value={search} onChange={handleSearch}
            placeholder="Search people..."
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-full text-sm outline-none focus:border-sky-500"/>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
              {searchResults.map(u => (
                <div key={u._id} onClick={() => startConversation(u)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer">
                  {u.avatar
                    ? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt=""/>
                    : <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-bold">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                  }
                  <div>
                    <p className="text-white text-sm font-bold">{u.name}</p>
                    <p className="text-gray-500 text-xs">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c, i) => (
            <div key={i} onClick={() => setSelected(c.user)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-900 transition border-b border-gray-800 ${selected?._id === c.user._id ? 'bg-gray-900' : ''}`}>
              {c.user.avatar
                ? <img src={c.user.avatar} className="w-10 h-10 rounded-full object-cover" alt=""/>
                : <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
                    {c.user.name?.[0]?.toUpperCase()}
                  </div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{c.user.name}</p>
                <p className="text-gray-500 text-xs truncate">{c.lastMessage.text}</p>
              </div>
              <span className="text-gray-500 text-xs">{timeAgo(c.lastMessage.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Chat */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
              {selected.avatar
                ? <img src={selected.avatar} className="w-8 h-8 rounded-full object-cover" alt=""/>
                : <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
              }
              <div>
                <p className="text-white font-bold">{selected.name}</p>
                <p className="text-gray-500 text-xs">@{selected.username}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => {
                const mine = msg.sender._id === user?.id || msg.sender === user?.id;
                return (
                  <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-sky-500 text-white' : 'bg-gray-800 text-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>
            <form onSubmit={sendMessage} className="border-t border-gray-800 p-4 flex gap-3">
              <input value={text} onChange={e => setText(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-full outline-none focus:border-sky-500"/>
              <button type="submit" disabled={!text.trim()}
                className="bg-sky-500 text-white px-5 py-2 rounded-full font-bold hover:bg-sky-600 disabled:opacity-50">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-xl font-bold text-white">Your Messages</p>
              <p className="text-sm mt-1">Search someone to start a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
