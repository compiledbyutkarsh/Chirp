import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function TweetCard({ tweet, onUpdate, bookmarkedIds = [] }) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const isLiked = tweet.likes?.includes(user?.id);
  const isRetweeted = tweet.retweets?.includes(user?.id);
  const isBookmarked = bookmarkedIds.includes(tweet._id);

  const handleLike = async () => {
    try { await api.put(`/tweets/${tweet._id}/like`); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const handleRetweet = async () => {
    try { await api.put(`/tweets/${tweet._id}/retweet`); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const handleBookmark = async () => {
    try { await api.put(`/tweets/${tweet._id}/bookmark`); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/tweets/${tweet._id}/comment`, { text: comment });
      setComment(''); onUpdate();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/tweets/${tweet._id}`); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
  };

  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-900/30 transition">
      <div className="flex gap-3">
        <Link to={`/profile/${tweet.author?.username}`}>
          {tweet.author?.avatar
            ? <img src={tweet.author.avatar} className="w-10 h-10 rounded-full object-cover" alt=""/>
            : <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {tweet.author?.name?.[0]?.toUpperCase()}
              </div>
          }
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/profile/${tweet.author?.username}`} className="font-bold text-white hover:underline">
              {tweet.author?.name}
            </Link>
            <span className="text-gray-500 text-sm">@{tweet.author?.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{timeAgo(tweet.createdAt)}</span>
            {user?.id === tweet.author?._id && (
              <button onClick={handleDelete} className="ml-auto text-gray-500 hover:text-red-500 text-sm">✕</button>
            )}
          </div>

          {tweet.content && <p className="text-white mt-1 break-words">{tweet.content}</p>}

          {tweet.image && (
            <img src={tweet.image} alt="tweet" className="mt-3 rounded-2xl max-h-80 w-full object-cover border border-gray-800"/>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-3">
            <button onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-500 hover:text-sky-500 transition text-sm">
              💬 <span>{tweet.comments?.length || 0}</span>
            </button>
            <button onClick={handleRetweet}
              className={`flex items-center gap-1 transition text-sm ${isRetweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}>
              🔁 <span>{tweet.retweets?.length || 0}</span>
            </button>
            <button onClick={handleLike}
              className={`flex items-center gap-1 transition text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
              {isLiked ? '❤️' : '🤍'} <span>{tweet.likes?.length || 0}</span>
            </button>
            <button onClick={handleBookmark}
              className={`flex items-center gap-1 transition text-sm ${isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}>
              {isBookmarked ? '🔖' : '📌'} 
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-3">
              <form onSubmit={handleComment} className="flex gap-2 mb-3">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-full text-sm outline-none focus:border-sky-500"/>
                <button type="submit"
                  className="bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-sky-600">
                  Reply
                </button>
              </form>
              {tweet.comments?.map((c, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  {c.user?.avatar
                    ? <img src={c.user.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt=""/>
                    : <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.user?.name?.[0]?.toUpperCase()}
                      </div>
                  }
                  <div className="bg-gray-900 rounded-2xl px-3 py-2 flex-1">
                    <span className="text-white font-bold text-sm">{c.user?.name} </span>
                    <span className="text-gray-400 text-sm">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
