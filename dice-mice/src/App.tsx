import './App.css'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CharacterView from './pages/CharacterView';
import Home from './pages/Home';
import CharacterCreate from './pages/CharacterCreate';
import CountiesView from './pages/CountiesView';
import SkillsView from './pages/SkillsView';
import ClassesView from './pages/ClassesView';
import AuthCallback from './pages/AuthCallback';
import { useUser } from './context/UserDataProvider';
import { JSX, useEffect } from 'react';
import House from './features/house/House';
import Logout from './pages/Logout';

function App() {

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get("code");

      if (code) {
        console.log("Redirecting to /auth/discord/callback with code:", code);
        navigate(`/auth/discord/callback?code=${code}`); // Redirect properly if from discord
      }
    }, [location, navigate]);

    if (loading) return <p>Loading...</p>; // Show loading state
    return user ? children : <Navigate to="/" />;
  };

  return (
    <>
      <Navbar />
      <div style={{ overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/discord/callback" element={<AuthCallback />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/house" element={<ProtectedRoute><House /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><ClassesView /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><SkillsView /></ProtectedRoute>} />
          <Route path="/counties" element={<ProtectedRoute><CountiesView /></ProtectedRoute>} />
          <Route path="/characters/:characterId" element={<ProtectedRoute><CharacterView /></ProtectedRoute>} />
          <Route path="/characters/create" element={<ProtectedRoute><CharacterCreate /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App
