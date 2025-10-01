import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CoursesLayout from './pages/Courses';
import CoursesTab from "./pages/CoursesTab";
import AssignmentsTab from "./pages/AssignmentsTab";
import CalendarTab from "./pages/CalendarTab";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CoursesLayout />}>
            <Route index element={<CoursesTab />} />
            <Route path="assignments" element={<AssignmentsTab />} />
            <Route path="calendar" element={<CalendarTab />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;