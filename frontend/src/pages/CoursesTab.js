import React, { useState, useEffect } from "react";

function CoursesTab() {
    //add course, edit course
    const [displayForm, setDisplayForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    //form fields
    const [courseName, setCourseName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    //get courses
    const [courses, setCourses] = useState([]);

    //sorting
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const token = localStorage.getItem("token");
    
    //fetch courses from backend on component mount
    const getCourses = async () => {
        try {
            const response = await fetch("http://localhost:5000/courses", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } 
            else {
                console.error("Failed to get courses:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error getting courses:", error);
        }
    };

    //get courses on component mount
    useEffect(() => {
        getCourses();
    }, []);

    //reset form fields and state
    const resetForm = () => {
        setCourseName("");
        setStartDate("");
        setEndDate("");
        setEditingCourse(null);
        setDisplayForm(false);
    };

    //handle adding a new course or editing an existing one
    const handleSubmit = async (e) => {
        e.preventDefault();

        //validation - all are required
        if (!courseName || !startDate || !endDate) {
            alert("All fields are required.");
            return;
        }

        //validation - end date must be after start date
        if (new Date(startDate) >= new Date(endDate)) {
            alert("End date must be after start date.");
            return;
        }

        //determine if adding or editing
        const url = editingCourse ? `http://localhost:5000/editcourse/${editingCourse.id}` : "http://localhost:5000/addcourse";
        const method = editingCourse ? "PUT" : "POST";

        //request to backend to add course
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: courseName, start_date: startDate, end_date: endDate }),
            });

            if (response.ok) {
                getCourses();   //get updated list of courses
                resetForm();    //reset all fields on form
                alert(editingCourse ? "Course updated!":"Course added successfully!");
            }
            else {
                const data = await response.json();
                alert("Failed to save course.");
                console.error("Failed to save course:", data.error);
            }
        } 
        catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding/updating a course.");
        }
    };

    //populate form with existing data for editing
    const handleEdit = (course) => {
        setEditingCourse(course);
        setCourseName(course.name);
        setStartDate(course.start_date);
        setEndDate(course.end_date);
        setDisplayForm(true);
    };

    //handle deleting a course
    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? If yes, it will delete all the corresponding assignments with it as well")) return;

        try {
            const response = await fetch(`http://localhost:5000/deletecourse/${courseId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.ok) {
                getCourses();   //get updated list of courses
                alert("Course deleted successfully!");
            } 
            else {
                const data = await response.json();
                alert("Failed to delete course.");
                console.error("Failed to delete course:", data.error);
            }
        } 
        catch (error) {
            console.error("Error deleting course:", error);
            alert("An error occurred while deleting the course.");
        }
    };

    //handle sorting by name, start date, end date
    const sortedCourses = [...courses].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === "start_date" || sortBy === "end_date") {
        valA = new Date(valA);
        valB = new Date(valB);
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });


    return (
        <div>
            <h2>Your Courses</h2>
            {/* Sorting controls */}
            <div className="mb-3">
                <label>Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select d-inline w-auto mx-2"
                >
                    <option value="name">Name</option>
                    <option value="start_date">Start Date</option>
                    <option value="end_date">End Date</option>
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

            {/* Only display the create course form if displayForm=true
            displayForm is toggled onclick of the Add Course button
            Also allow for editing a course */}
            {!displayForm && (
            <button className="btn btn-primary mb-3" onClick={() => setDisplayForm(true)}>
                {editingCourse ? "Edit Course" : "+ Add Course"}
                </button>
            )}

            {displayForm && (
                <form className="mt-4"  onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Course Name</label>
                        <input
                        type="text"
                        className="form-control"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        />
                    </div>

                    <button type="submit" className="btn btn-success me-2">
                        {editingCourse ? "Update Course" : "Save Course"}
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
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCourses.length > 0 ? (
                            sortedCourses.map((course) => (
                                <tr key={course.id}>
                                    <td>{course.name}</td>
                                    <td>{course.start_date}</td>
                                    <td>{course.end_date}</td>
                                    <td>
                                        <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEdit(course)}
                                        >
                                        Edit
                                        </button>
                                        <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(course.id)}
                                        >
                                        Delete
                                        </button>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No courses found.</td>
                                </tr>
                                )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CoursesTab;