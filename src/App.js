import './App.css';
import Calendar from './calendar';
import Dashboard from "./dashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
// import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <Router>
        <header style={{backgroundColor: 'lightblue', padding: '10px'}}>
            <nav>
              <ul>
                <li>
                  <Link to="/">Dashboard</Link>
                </li>
                <li>
                  <Link to="/calendar">Calendar</Link>
                </li>
              </ul>
            </nav>
        </header>

        <main>
          <Routes>
            <Route exact path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </main>

      </Router>
      
    </div>
  );
}

export default App;