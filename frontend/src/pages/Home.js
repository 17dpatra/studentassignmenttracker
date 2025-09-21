import React from 'react';
import {Link} from 'react-router-dom';


function Home() {
    return (
        <div>
            <h1>Welcome to the Student Assignment Tracker</h1>
            <div style={{ marginTop: "20px" }}>
                <Link to="/login">
                <button style={{ marginRight: "10px" }}>Login</button>
                </Link>
                <Link to="/register">
                <button>Register</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;