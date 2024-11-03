import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import "./Access.css";

function Access() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [err, setError] = useState("");
    const navigate = useNavigate(); // Inizializza useNavigate

    function createEvent(e){
        e.preventDefault();

        const URI = "http://localhost:8000/login";
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
            //qua ho messo temporaneamente che va direttamente al calendario
            .then((data) => {
                if(data.success){
                    console.log("Access completed!");
                    navigate("/calendario");
                }
            })
            .catch((err) => {
                //messaggio di errore
                setError("Login failed: " + err.message);
            });
    }

    return(
        <div className="corpo">
            <nav className="navbar">
                <div className="navbar-container">
                    <a href="#" className="navbar-logo">MyLogo</a>
                    <ul className="navbar-menu">
                        <li className="navbar-item"><a href="#" className="navbar-link">Calendario</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">Note</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">Pomodoro</a></li>
                        <li className="navbar-item"><a href="#" className="navbar-link">Contatti</a></li>
                    </ul>
                </div>
            </nav>
            <div className="log">
                <form method="post" action="http://localhost:8000/login" onSubmit={createEvent}>
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

export default Access;