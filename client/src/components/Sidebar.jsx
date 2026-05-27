import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { icon: '🏠', label: 'Home', to: '/' },
    { icon: '🔍', label: 'Search', to: '/search' },
    { icon: '🔔', label: 'Notifications', to: '/notifications' },
    { icon: '💬', label: 'Messages', to: '/messages' },
    { icon: '📌', label: 'Bookmarks', to: '/bookmarks' },
    { icon: '👤', label: 'Profile', to: `/profile/${user?.username}` },
  ];

  return (
    <div className="flex flex-col h-full px-3 py-4">
      <Link to="/" className="text-3xl mb-6 px-3">🐦</Link>
      <nav className="flex-1 space-y-1">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className={`flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-900 transition text-xl font-medium ${location.pathname === link.to ? 'text-white font-bold' : 'text-gray-300'}`}>
            <span>{link.icon}</span>
            <span className="hidden xl:block">{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-gray-900 transition cursor-pointer" onClick={handleLogout}>
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.avatar
            ? <img src={user.avatar} className="w-full h-full object-cover" alt=""/>
            : user?.name?.[0]?.toUpperCase()
          }
        </div>
        <div className="hidden xl:block">
          <p className="text-white font-bold text-sm">{user?.name}</p>
          <p className="text-gray-500 text-sm">@{user?.username}</p>
        </div>
        <span className="hidden xl:block ml-auto text-gray-500">↩</span>
      </div>
    </div>
  );
}
