import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/home.componet';
import Schedule from './Schedule/schedule.component';
import './App.css';
import SectorConfig from './SectorConfig/sector-config.component';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/sector/:id" element={<SectorConfig />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
