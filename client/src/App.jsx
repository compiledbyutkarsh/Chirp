import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import EditProfile from './pages/EditProfile';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto flex">
        <div className="w-16 xl:w-72 fixed h-screen border-r border-gray-800">
          <Sidebar />
        </div>
        <main className="flex-1 ml-16 xl:ml-72 max-w-2xl border-r border-gray-800 min-h-screen">
          {children}
        </main>
        <div className="hidden lg:block w-80 xl:w-96 ml-4 py-4 px-2">
          <div className="bg-gray-900 rounded-2xl p-4 sticky top-4">
            <h2 className="text-white font-bold text-xl mb-3">Welcome to Chirp 🐦</h2>
            <p className="text-gray-400 text-sm">Share your thoughts with the world. Connect with people. Be heard.</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>🐦</span><span>Post chirps up to 280 characters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>🖼️</span><span>Share images with your chirps</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>❤️</span><span>Like and retweet chirps</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>💬</span><span>Send direct messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Layout><Search /></Layout></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Layout><Messages /></Layout></PrivateRoute>} />
        <Route path="/bookmarks" element={<PrivateRoute><Layout><Bookmarks /></Layout></PrivateRoute>} />
        <Route path="/profile/:username" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/edit-profile" element={<PrivateRoute><Layout><EditProfile /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
