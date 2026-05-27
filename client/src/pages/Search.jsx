import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/users/search/users?q=${val}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-white">Search</h1>
      </div>
      <div className="p-4">
        <input
          type="text" value={query} onChange={handleSearch}
          placeholder="Search people..."
          className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-full focus:outline-none focus:border-sky-500"
        />
      </div>
      <div>
        {loading && <p className="text-center text-gray-500 py-4">Searching...</p>}
        {results.map(u => (
          <Link key={u._id} to={`/profile/${u.username}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition border-b border-gray-800">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold">
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{u.name}</p>
              <p className="text-gray-500 text-sm">@{u.username}</p>
            </div>
          </Link>
        ))}
        {!loading && query && results.length === 0 && (
          <p className="text-center text-gray-500 py-8">No users found for "{query}"</p>
        )}
      </div>
    </div>
  );
}
