import { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import TweetCard from '../components/TweetCard';

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const { user } = useAuthStore();

  const fetchTweets = async () => {
    try {
      const { data } = await api.get('/tweets');
      setTweets(data);
    } catch (err) { console.error(err); }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/tweets/bookmarks');
      setBookmarkedIds(data.map(t => t._id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTweets(); fetchBookmarks(); }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const postTweet = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const { data } = await api.post('/tweets', { content, image });
      setTweets([data, ...tweets]);
      setContent(''); setImage(''); setImagePreview('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </div>

      {/* Composer */}
      <div className="border-b border-gray-800 p-4">
        <form onSubmit={postTweet} className="flex gap-3">
          <div>
            {user?.avatar
              ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt=""/>
              : <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What's happening?"
              className="w-full bg-transparent text-white text-xl placeholder-gray-500 resize-none outline-none min-h-[80px]"
              value={content} onChange={e => setContent(e.target.value)} maxLength={280}
            />
            {imagePreview && (
              <div className="relative mt-2">
                <img src={imagePreview} className="rounded-2xl max-h-60 w-full object-cover" alt="preview"/>
                <button type="button" onClick={() => { setImage(''); setImagePreview(''); }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black">
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 border-t border-gray-800 pt-3">
              <div className="flex gap-3">
                <label className="text-sky-500 cursor-pointer hover:text-sky-400 transition">
                  🖼️
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage}/>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${content.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>
                  {280 - content.length}
                </span>
                <button type="submit" disabled={loading || (!content.trim() && !image)}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2 rounded-full transition disabled:opacity-50">
                  {loading ? 'Posting...' : 'Chirp'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div>
        {tweets.length === 0
          ? <div className="text-center text-gray-500 py-20"><p className="text-2xl mb-2">🐦</p><p>No chirps yet. Be the first!</p></div>
          : tweets.map(tweet => (
              <TweetCard key={tweet._id} tweet={tweet} onUpdate={() => { fetchTweets(); fetchBookmarks(); }} bookmarkedIds={bookmarkedIds}/>
            ))
        }
      </div>
    </div>
  );
}
