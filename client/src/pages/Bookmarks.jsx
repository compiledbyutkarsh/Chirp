import { useState, useEffect } from 'react';
import api from '../api/axios';
import TweetCard from '../components/TweetCard';

export default function Bookmarks() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/tweets/bookmarks');
      setTweets(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Bookmarks</h1>
        <p className="text-gray-500 text-sm">{tweets.length} saved</p>
      </div>
      {loading
        ? <div className="text-center text-gray-500 py-20">Loading...</div>
        : tweets.length === 0
          ? <div className="text-center text-gray-500 py-20">
              <p className="text-3xl mb-2">📌</p>
              <p>No bookmarks yet</p>
            </div>
          : tweets.map(tweet => (
              <TweetCard key={tweet._id} tweet={tweet}
                onUpdate={fetchBookmarks}
                bookmarkedIds={tweets.map(t => t._id)}/>
            ))
      }
    </div>
  );
}
