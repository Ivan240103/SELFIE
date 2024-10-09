import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import "./Access.css";

function Accesso() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [err, setError] = useState("");
    const navigate = useNavigate(); // Inizializza useNavigate

    function createEvent(e){
        e.preventDefault();

        const URI = "http://localhost:3000/login";
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
                if (res.ok) return res.json();
            })
            .then((data) => {
                if(data.success){
                    console.log("Access completed!");
                    navigate("/calendario");
                }
            })
            .catch((err) => {
                //Qua se sei un coglione e sbagli i dati
                setError("Login failed: " + err.message);
            });
    }

    return(
        <body>
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="#" class="navbar-logo">MyLogo</a>
                    <ul class="navbar-menu">
                        <li class="navbar-item"><a href="#" class="navbar-link">Home</a></li>
                        <li class="navbar-item"><a href="#" class="navbar-link">About</a></li>
                        <li class="navbar-item"><a href="#" class="navbar-link">Services</a></li>
                        <li class="navbar-item"><a href="#" class="navbar-link">Contact</a></li>
                    </ul>
                </div>
            </nav>
            <div class="log">
                <form onSubmit={createEvent}>
                    <label><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" value={usr} onChange={(e) => setUsr(e.target.value)} required/>
                    <label><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" value={psw} onChange={(e) => setPsw(e.target.value)} required/>
                    <button type="submit">Accedi</button>
                </form>
            </div>
        </body>
    )
}

export default Accesso;