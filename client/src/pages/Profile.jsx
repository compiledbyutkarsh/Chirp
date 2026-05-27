import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import TweetCard from '../components/TweetCard';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${username}`);
      setProfile(data.user);
      setTweets(data.tweets);
      setFollowing(data.user.followers?.some(f => f._id === user?.id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [username]);

  const handleFollow = async () => {
    try {
      await api.put(`/users/${profile._id}/follow`);
      fetchProfile();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center text-gray-500 py-20">Loading...</div>;
  if (!profile) return <div className="text-center text-gray-500 py-20">User not found</div>;

  const isOwner = user?.username === username;

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <p className="text-gray-500 text-sm">{tweets.length} Chirps</p>
      </div>

      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-sky-900 to-sky-600 relative overflow-hidden">
        {profile.coverImage && <img src={profile.coverImage} className="w-full h-full object-cover" alt=""/>}
      </div>

      {/* Avatar + Actions */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-black bg-sky-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden" style={{marginTop: '-50px', position: 'relative', zIndex: 10}}>
            {profile.avatar
              ? <img src={profile.avatar} className="w-full h-full object-cover" alt=""/>
              : profile.name?.[0]?.toUpperCase()
            }
          </div>
          {isOwner
            ? <Link to="/edit-profile"
                className="border border-gray-600 text-white px-5 py-2 rounded-full font-bold hover:bg-gray-900 transition mt-2">
                Edit Profile
              </Link>
            : <button onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-bold transition mt-2 ${
                  following
                    ? 'border border-gray-600 text-white hover:border-red-500 hover:text-red-500'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}>
                {following ? 'Following' : 'Follow'}
              </button>
          }
        </div>

        <h2 className="text-xl font-bold text-white">{profile.name}</h2>
        <p className="text-gray-500">@{profile.username}</p>
        {profile.bio && <p className="text-white mt-2">{profile.bio}</p>}

        <div className="flex gap-4 mt-3">
          <span className="text-white font-bold">{profile.following?.length}
            <span className="text-gray-500 font-normal"> Following</span>
          </span>
          <span className="text-white font-bold">{profile.followers?.length}
            <span className="text-gray-500 font-normal"> Followers</span>
          </span>
        </div>
      </div>

      <div className="border-t border-gray-800">
        {tweets.length === 0
          ? <div className="text-center text-gray-500 py-20">
              <p className="text-2xl mb-2">🐦</p>
              <p>No chirps yet</p>
            </div>
          : tweets.map(tweet => (
              <TweetCard key={tweet._id} tweet={tweet} onUpdate={fetchProfile}/>
            ))
        }
      </div>
    </div>
  );
}
