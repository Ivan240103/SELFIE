import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;


function Registration(){
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    function handleRegister(e){
        e.preventDefault();

        const URI = `${window.location.origin}/api/users/register`;
        const requestBody = {
            username:usr,
            password:psw,
            name: name,
            surname: surname,
            email: email
        }
        
        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        }
        
        fetch(URI, request)
            .then((res) => {
                if (res.ok){
                    console.log("Registration completed!");
                    setUsr("");
                    setPsw("");
                    setName("");
                    setSurname("");
                    setEmail("");
                    setErr("")
                    navigate("/");
                }
            })
            .catch((err) => {
                //messaggio di errore
                setErr("Registration failed: " + err.message);
            });
    }

    return(
        <div className="log">
            <h1>Register</h1>
            <p>{err}</p>
            <form onSubmit={handleRegister}>
                <label htmlFor="username" id="username"><b>Username</b></label>
                <input id="usr" type="text" placeholder="Enter Username" value={usr} onChange={(e) => setUsr(e.target.value)} required/>
                <label htmlFor="password" id="password"><b>Password</b></label>
                <input id="psw" type="password" placeholder="Enter Password" value={psw} onChange={(e) => setPsw(e.target.value)} required/>
                <label htmlFor="name"><b>Name</b></label>
                <input id="name" type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
                <label htmlFor="surname"><b>Surname</b></label>
                <input id="surname" type="text" placeholder="Enter Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                <label htmlFor="email"><b>Email</b></label>
                <input id="email" type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Registration