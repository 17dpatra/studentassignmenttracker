import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        //Validation: Incomplete info
        if (!e.target.username.value || !e.target.password.value) {
            alert("Both fields are required and must be filled in.");
            return;
        }

        //POST request to backend
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password}),
            });
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                //set the tokens in local storage
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("username", data.username);

                alert("Login successful!");
                navigate("/courses"); //redirect to courses page
            } else {
                alert(data.error || "Login failed.");
            }
        }
        catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login. Please try again later.");
        }
    };

    return (
        <div>
            <div className='login-form-container'>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
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
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;