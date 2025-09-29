import React, {useState, useEffect} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";


function CalendarTab() {
  const [assignments, setAssignments] = useState([]);
  const token = localStorage.getItem("token");

  //get all assignments
  const getAssignments = async () => {
    try {
      const response = await fetch("http://localhost:5000/assignments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
        //console.log(data);
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

  //convert each assignment into a FullCalendar events
  const events = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    date: a.due_date, //must be in YYYY-MM-DD format
  }));


  return (
    <div>
      <h2>Your Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />
    </div>
  );

}

export default CalendarTab;