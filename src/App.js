import logo from "./logo.svg";
import "./App.css";
import Register from "./components/Register/Register";
import Admin from "./components/Admin/Admin";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

function App() {
  return (
    <div className="App">
      <NotificationContainer/>
      <Router>
  
        <Routes>
          <Route exact path="/" element={<Register/>}/>
          <Route exact path="/admin" element={<Admin/>}/>
          <Route path="*" element={<Register/>}/>
        </Routes>
    
    </Router>
      {/* <Register/> */}
    </div>
  );
}

export default App;
