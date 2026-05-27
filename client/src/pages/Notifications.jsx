import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const icons = {
  like: '❤️', retweet: '🔁', follow: '👤', comment: '💬', message: '💬'
};

const messages = {
  like: 'liked your chirp',
  retweet: 'retweeted your chirp',
  follow: 'followed you',
  comment: 'commented on your chirp',
  message: 'sent you a message'
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
        await api.put('/notifications/read');
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
      </div>
      {loading
        ? <div className="text-center text-gray-500 py-20">Loading...</div>
        : notifications.length === 0
          ? <div className="text-center text-gray-500 py-20">
              <p className="text-3xl mb-2">🔔</p>
              <p>No notifications yet</p>
            </div>
          : notifications.map((n, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-900/30 transition ${!n.read ? 'bg-sky-500/5' : ''}`}>
                <span className="text-2xl">{icons[n.type]}</span>
                <div className="flex-1">
                  <Link to={`/profile/${n.from?.username}`} className="font-bold text-white hover:underline">
                    {n.from?.name}
                  </Link>
                  <span className="text-gray-400"> {messages[n.type]}</span>
                </div>
                <span className="text-gray-500 text-sm">{timeAgo(n.createdAt)}</span>
              </div>
            ))
      }
    </div>
  );
}
