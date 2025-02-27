import './App.css'
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CharacterView from './pages/CharacterView';
import Home from './pages/Home';
import CharacterCreate from './pages/CharacterCreate';
import CountiesView from './pages/CountiesView';
import SkillsView from './pages/SkillsView';
import ClassesView from './pages/ClassesView';

function App() {
  return (
    <>
      <Navbar />
      <div style={{ overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classes" element={<ClassesView />} />
          <Route path="/skills" element={<SkillsView />} />
          <Route path="/counties" element={<CountiesView />} />
          <Route path="/characters/:characterId" element={<CharacterView />} />
          <Route path="/characters/create" element={<CharacterCreate />} />
        </Routes>
      </div>
    </>
  );
}

export default App
