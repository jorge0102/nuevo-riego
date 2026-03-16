import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import Home from './Home/home.componet';
import Schedule from './Schedule/schedule.component';
import './App.css';
import SectorConfig from './SectorConfig/sector-config.component';
import Settings from './Settings/settings.component';
import { isDarkModeAtom } from './Home/home.module';

function App() {
  const isDarkMode = useAtomValue(isDarkModeAtom);
  return (
    <Router>
      <div className={`App${isDarkMode ? ' dark' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/sector/:id" element={<SectorConfig />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
