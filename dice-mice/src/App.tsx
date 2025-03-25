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
import { CircularProgress } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Characters from './features/character/Characters';
import { CharacterCreateProvider } from './context/CharacterSheetContext';
import CreateCharacter from './features/character/CreateCharacter';

function App() {

  // Discord Auth will get sent to the home page by default
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    // Only redirect to /auth/discord/callback when on "/" and code exists
    if (code && location.pathname === "/") {
      navigate(`/auth/discord/callback?code=${code}`, { replace: true });
    }
  }, [location, navigate]);

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading, loadingLoggedInUser } = useUser();

    if (loading || loadingLoggedInUser) return <CircularProgress />;
    return user ? children : <Navigate to="/" />;
  };

  return (
    <>
      <Navbar />
      <div style={{ overflow: 'auto', height: 'calc(100vh - 68.5px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/discord/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/house" element={<ProtectedRoute><House /></ProtectedRoute>} />
          <Route path="/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><ClassesView /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><SkillsView /></ProtectedRoute>} />
          <Route path="/counties" element={<ProtectedRoute><CountiesView /></ProtectedRoute>} />
          <Route path="/characters/:characterId" element={<ProtectedRoute><CharacterView /></ProtectedRoute>} />
          <Route path="/characters/create" element={<ProtectedRoute><CharacterCreateProvider><CreateCharacter /></CharacterCreateProvider></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App
