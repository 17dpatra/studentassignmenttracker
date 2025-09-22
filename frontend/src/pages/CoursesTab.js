import React, { useState } from "react";

function CoursesTab() {
    const [displayForm, setDisplayForm] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleAddCourse = async (e) => {
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

        //POST request to backend to add course
        try {
            const token = localStorage.getItem("token");
            console.log("Token being sent: ", token);
            const response = await fetch("http://localhost:5000/addcourse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: courseName, start_date: startDate, end_date: endDate }),
            });
            if (response.ok) {
                alert("Course added successfully!");
                setCourseName("");
                setStartDate("");
                setEndDate("");
                setDisplayForm(false);
            }
            else {
                alert("Failed to add course.");
                console.error("Failed to add course:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding course:", error);
            alert("An error occurred while adding the course.");
        }
    };


    return (
        <div>
            <h2>Your Courses</h2>
            {/* Only display the create course form if displayForm=true
            displayForm is toggled onclick of the Add Course button*/}
            {!displayForm && (
            <button className="btn btn-primary mb-3" onClick={() => setDisplayForm(true)}>
                + Add Course
                </button>
            )}

            {displayForm && (
                <form className="mt-4"  onSubmit={handleAddCourse}>
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
                        Save Course
                    </button>
                    <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDisplayForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default CoursesTab;