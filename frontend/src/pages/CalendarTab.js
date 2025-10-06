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

  //convert each assignment into a FullCalendar event
  const events = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    start: a.due_date, //must be in YYYY-MM-DD format and FullCalendar needs it to be called 'start' for comparison
  }));


  return (
    <div>
      <h2>Your Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventDidMount={(data) => {
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const dueDateOfEvent = new Date(data.event.start);

          if (dueDateOfEvent < todayDate) {
            data.el.style.backgroundColor = '#e0e0e0';    //change to grey if the due date has passed
          }
        }}
      />
    </div>
  );

}

export default CalendarTab;