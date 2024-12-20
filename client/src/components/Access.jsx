import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import { Link } from "react-router-dom"; //Importa il linking per la registrazione dell'utente
import "../css/Access.css";

function Access() {
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
                if (res.ok) return res.json();
            })
            //Avevo messo un console.log per vedere cosa mi diceva il server
            .then((data) => {
                if (typeof data === "string") {
                    console.log("Risposta come stringa:", data);
                    localStorage.setItem("token", data);
                    navigate("/dashboard");
                } else if (data.token) {
                    console.log("Token trovato nell'oggetto:", data.token);
                    localStorage.setItem("token", data.token);
                    navigate("/dashboard");
                }
            })
            .catch((err) => {
                //messaggio di errore
                setError("Login failed: " + err.message);
            });
    }

    return(
        <div className="corpo">
            <div className="log">
                <h1>Login</h1>
                <form method="post" action="http://localhost:8000/login" onSubmit={createEvent}>
                    <label for="username" id="username"><b>Username</b></label>
                    <input id="usr" type="text" placeholder="Enter Username" value={usr} onChange={(e) => setUsr(e.target.value)} required/>
                    <label for="password" id="password"><b>Password</b></label>
                    <input id="psw" type="password" placeholder="Enter Password" value={psw} onChange={(e) => setPsw(e.target.value)} required/>
                    <button type="submit">Login</button>
                </form>
                {/*Per registrare un nuovo utente*/}
                <p> Not registered yet? <Link to="/register">Click here</Link> </p>
            </div>
        </div>
    )
}

export default Access;