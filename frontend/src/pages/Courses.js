import React from "react";
import { NavLink, Outlet } from "react-router-dom";

function CoursesLayout() {
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Welcome to the Student Assignment Tracker</h1>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <NavLink 
            to="" 
            end 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Courses
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="assignments" 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Assignments
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="calendar" 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Calendar
          </NavLink>
        </li>
      </ul>

      <div className="card card-body">
        <Outlet />
      </div>
    </div>
  );
}

export default CoursesLayout;