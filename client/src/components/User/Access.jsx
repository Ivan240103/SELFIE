import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import { Link } from "react-router-dom"; //Importa il linking per la registrazione dell'utente
import CryptoJS from 'crypto-js'

import "../../css/Access.css";

function Access() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Inizializza useNavigate

    function createEvent(e){
        e.preventDefault();

        const URI = `${process.env.REACT_APP_API}/api/users/login`;
        const requestBody = {
            username: usr,
            password: CryptoJS.SHA1(psw).toString(CryptoJS.enc.Hex)
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
                localStorage.setItem("token", data);
                navigate("/");
            })
            .catch((err) => {
                //messaggio di errore
                setError("Login failed: " + err.response.data || 'no response');
            });
    }

    return(
        <div className="corpo">
            <div className="log">
                <h1>Login</h1>
                <p>{error}</p>
                <form onSubmit={createEvent}>
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