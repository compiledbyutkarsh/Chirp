import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function EditProfile() {
  const { user, login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, [field]: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile/update', form);
      login({ ...user, ...data }, localStorage.getItem('chirp_token'));
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user.username}`), 1000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">←</button>
        <h1 className="text-xl font-bold text-white">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {success && <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-xl">Profile updated!</div>}

        {/* Cover Image */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Cover Image</label>
          <div className="relative h-32 bg-gradient-to-r from-sky-900 to-sky-600 rounded-xl overflow-hidden">
            {form.coverImage && <img src={form.coverImage} className="w-full h-full object-cover" alt=""/>}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition">
              <span className="text-white text-2xl">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('coverImage')}/>
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Profile Photo</label>
          <div className="relative w-20 h-20">
            {form.avatar
              ? <img src={form.avatar} className="w-20 h-20 rounded-full object-cover" alt=""/>
              : <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition">
              <span className="text-white text-xl">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('avatar')}/>
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500"/>
        </div>

        {/* Bio */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Bio</label>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
            maxLength={160} rows={3}
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 resize-none"/>
          <p className="text-gray-500 text-xs mt-1">{160 - form.bio.length} characters remaining</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
