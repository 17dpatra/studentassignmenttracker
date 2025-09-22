import React, { useState, useEffect } from "react";

function AssignmentsTab() {
  //add assignment, edit assignment
  const [displayForm, setDisplayForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  //form fields
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("1");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  //get assignments
  const [assignments, setAssignments] = useState([]);

  //get courses for dropdown
  const [courses, setCourses] = useState([]);

  //sorting
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");

  //fetch assignments from backend on component mount
  const getAssignments = async () => {
    try {
      const response = await fetch("http://localhost:5000/assignments", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
      else {
        console.error("Failed to get assignments:", response.statusText);
      }
    }
    catch (error) {
      console.error("Error getting assignments:", error);
    }
  };

  //get assignments on component mount
  useEffect(() => {
    getAssignments();
  }, []);

  //get courses for dropdown when adding an assignment or editing
  const getCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/courses", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error("Failed to get courses:", response.statusText);
      }
    } catch (error) {
      console.error("Error getting courses:", error);
    }
  };

  //reset form fields and state
  const resetForm = () => {
    setAssignmentTitle("");
    setAssignmentDescription("");
    setDueDate("");
    setPriority("");
    setEditingAssignment(null);
    setDisplayForm(false);
  };

  //handle adding a new assignment or editing an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();

    //validation - all are required
    if (!assignmentTitle || !dueDate) {
      alert("Fill the required fields.");
      return;
    }

    //validation - check if due date is within the course dates
    const selectedCourse = courses.find(course => course.id === selectedCourseId);
    if (selectedCourse) {
      const courseStart = new Date(selectedCourse.start_date);
      const courseEnd = new Date(selectedCourse.end_date);
      const assignmentDue = new Date(dueDate);
      if (assignmentDue < courseStart || assignmentDue > courseEnd) {
        alert(`Due date must be within the course dates: ${courseStart.toLocaleDateString()} - ${courseEnd.toLocaleDateString()}`);
        return;
      }
    }

    //determine if adding or editing
    const url = editingAssignment ? `http://localhost:5000/editassignment/${editingAssignment.id}` : "http://localhost:5000/addassignment";
    const method = editingAssignment ? "PUT" : "POST";

    //request to backend to add course
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: assignmentTitle,
          description: assignmentDescription,
          due_date: dueDate,
          priority: priority,
          course_id: selectedCourseId
        }),
      });

      if (response.ok) {
        getAssignments();   //get updated list of assignments
        resetForm();    //reset all fields on form
        alert(editingAssignment ? "Assignment updated!" : "Assignment added successfully!");
      }
      else {
        const data = await response.json();
        alert("Failed to save assignment.");
        console.error("Failed to save assignment:", data.error);
      }
    }
    catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding/updating an assignment.");
    }
  };

  //populate form with existing data for editing
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description);
    setDueDate(assignment.due_date);
    setPriority(assignment.priority);
    setSelectedCourseId(assignment.course_id);
    setDisplayForm(true);
    getCourses(); //get courses when edit form triggered
  };

  //handle deleting an assignment
  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const response = await fetch(`http://localhost:5000/deleteassignment/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        getAssignments();   //get updated list of assignments
        alert("Assignment deleted successfully!");
      }
      else {
        const data = await response.json();
        alert("Failed to delete assignment.");
        console.error("Failed to delete assignment:", data.error);
      }
    }
    catch (error) {
      console.error("Error deleting assignment:", error);
      alert("An error occurred while deleting the assignment.");
    }
  };

  //handle sorting by name, start date, end date
  const sortedAssignments = [...assignments].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "due_date") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  //map priority numbers to text
  const priorityLabels = {
    1: "Low",
    2: "Medium",
    3: "High"
  };

  return (
    <div>
      <h2>Your Assignments</h2>
      {/* Sorting controls */}
      <div className="mb-3">
        <label>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="form-select d-inline w-auto mx-2"
        >
          <option value="title">Title</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="form-select d-inline w-auto mx-2"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Only display the create assignment form if displayForm=true
      displayForm is toggled onclick of the Add Assignment button
      Also allow for editing an assignment */}
      {!displayForm && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setDisplayForm(true);
            getCourses(); // fetch courses only when form opens
          }}
        >
          {editingAssignment ? "Edit Assignment" : "+ Add Assignment"}
        </button>
      )}

      {displayForm && (
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Assignment Title</label>
            <input
              type="text"
              className="form-control"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Assignment Description</label>
            <input
              type="text"
              className="form-control"
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Course</label>
            <select
              className="form-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
            >
              <option value="">-- Select a Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-success me-2">
            {editingAssignment ? "Update Assignment" : "Save Assignment"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table of courses */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length > 0 ? (
              sortedAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.description}</td>
                  <td>{assignment.due_date}</td>
                  <td>{priorityLabels[assignment.priority]}</td>
                  <td>{courses.find(course => course.id === assignment.course_id)?.name || "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(assignment)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No assignments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentsTab;