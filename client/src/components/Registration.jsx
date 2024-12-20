import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;


function Registration(){
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [date, setDate] = useState("");
    const [err, setError] = useState("");
    const navigate = useNavigate();

    function createEvent(e){
        e.preventDefault();

        const URI = "http://localhost:8000/api/users/register";
        const requestBody = {
            username:usr,
            password:psw,
            name: name,
            surname: surname,
            birthday: date
        }
        
        const request = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        }
        
        fetch(URI, request)
            .then((res) => {
                if (res.ok){
                    return res.json();
                }
            })
            .then((data) => {
                console.log("Registration completed!");
                navigate("/login");
                setUsr("");
                setPsw("");
                setName("");
                setSurname("");
                setDate("");
            })
            .catch((err) => {
                //messaggio di errore
                setError("Registration failed: " + err.message);
            });
    }

    return(
        <div className="log">
            <h1>Register</h1>
            <form method="post" action="http://localhost:8000/register" onSubmit={createEvent}>
                <label for="username" id="username"><b>Username</b></label>
                <input id="usr" type="text" placeholder="Enter Username" value={usr} onChange={(e) => setUsr(e.target.value)} required/>
                <label for="password" id="password"><b>Password</b></label>
                <input id="psw" type="password" placeholder="Enter Password" value={psw} onChange={(e) => setPsw(e.target.value)} required/>
                <label for="name"><b>Name</b></label>
                <input id="name" type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} />
                <label for="surname"><b>Surname</b></label>
                <input id="surname" type="text" placeholder="Enter Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                <label for="date"><b>Date of birth</b></label>
                <input id="date" type="date" placeholder="Enter date of birth" value={date} onChange={(e) => setDate(e.target.value)} />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default Registration