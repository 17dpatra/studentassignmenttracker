import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        //validation: incomplete info
        if (!e.target.username.value || !e.target.password.value) {
            alert("Both fields are required and must be filled in.");
            return;
        }

        //POST request to backend
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            console.log(data);
            
            if (response.ok) {
                alert("Registration successful! Please log in.");
                navigate('/login'); //redirect to login page
            } else {
                alert(data.error || "Registration failed.");
            }
        }
        catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration. Please try again later.");
        }
    };

    return (
        <div>
            <div className='register-form-container'>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className='form-group'>
                        <label htmlFor='username'>Username:</label>
                        <input 
                        type='text' 
                        id='username' 
                        name='username' 
                        className='form-control'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password:</label>
                        <input 
                        type='password' 
                        id='password' 
                        name='password' 
                        className='form-control'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required />
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;