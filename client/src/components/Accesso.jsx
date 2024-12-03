import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;

function Accesso() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [err, setError] = useState("");
    const navigate = useNavigate(); // Inizializza useNavigate

    function createEvent(e){
        e.preventDefault();

        const URI = "http://localhost:8000/api/users/login";
        const requestBody = {
            username:usr,
            password:psw
        }
        
        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        }
        
        fetch(URI, request)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                localStorage.setItem('token', data)
                console.log("Access completed!");
                console.log(localStorage.getItem('token'))
            })
            .catch((err) => {
                //Qua se sei un coglione e sbagli i dati
                setError("Login failed: " + err.message);
            });
    }

    return(
        <div>
            <nav className="navbar">
                <div className="navbar-container">
                    <a href="#" className="navbar-logo">MyLogo</a>
                    <ul className="navbar-menu">
                        <li className="navbar-item"><a href="#" className="navbar-link">Home</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">About</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">Services</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">Contact</a></li>
                    </ul>
                </div>
            </nav>
            <div className="log">
                <form onSubmit={createEvent}>
                    <label><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" value={usr} onChange={(e) => setUsr(e.target.value)} required/>
                    <label><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" value={psw} onChange={(e) => setPsw(e.target.value)} required/>
                    <button type="submit">Accedi</button>
                </form>
            </div>
        </div>
    )
}

export default Accesso;