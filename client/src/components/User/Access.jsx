import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import { Link } from "react-router-dom"; //Importa il linking per la registrazione dell'utente
import CryptoJS from 'crypto-js'
import { useAuth } from "../Auth/AuthenticationContext";
import axios from 'axios'
import eyeIcon from "../../images/eye.png";
import hideIcon from "../../images/hide.png";
import "../../css/Access.css";

function Access() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // Inizializza useNavigate
    const { login } = useAuth()

    async function handleLogin(e){
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/api/users/login`, {
                username: usr,
                password: CryptoJS.SHA1(psw).toString(CryptoJS.enc.Hex)
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            localStorage.setItem("token", response.data);
            login();
            navigate("/");
        } catch (error) {
            setError("Login failed: " + error.response.data || 'no response');
        }
    }

    function showPwd(){
        var input = document.getElementById('psw');
        if (input.type === "password") {
          input.type = "text";
        } else {
          input.type = "password";
        }
    }

    return(
        <div className="corpo">
            <div className="log">
                <h1>Login</h1>
                <p>{error}</p>
                <form onSubmit={handleLogin}>
                    <label
                        htmlFor="username"
                        id="username"
                    >
                        <b>Username</b>
                    </label>
                    <input
                        id="usr"
                        type="text"
                        placeholder="Enter Username"
                        value={usr}
                        onChange={(e) => setUsr(e.target.value)}
                        required />
                    <label
                        htmlFor="password"
                        id="password"
                    >
                        <b>Password</b>
                    </label>
                    <div className="password-container">
                        <input
                            id="psw"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            value={psw}
                            onChange={(e) => setPsw(e.target.value)}
                            required />
                        <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img 
                                    src={showPassword ? hideIcon : eyeIcon} 
                                    alt={showPassword ? "Nascondi password" : "Mostra password"} 
                                />
                        </button>
                    </div>
                    <button className="btt" type="submit">Login</button>
                </form>
                {/*Per registrare un nuovo utente*/}
                <p> Not registered yet? <Link to="/register">Click here</Link> </p>
            </div>
        </div>
    )
}

export default Access;