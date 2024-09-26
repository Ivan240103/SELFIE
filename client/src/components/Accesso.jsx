import React, { useState } from "react";

function Accesso() {
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [err, setError] = useState("");

    function createEvent(e){
        e.preventDefault();

        //Ora bisognerebbe fare la fect con il GET (quindi senza request body ecc.) confrontando l'username e la password
        
        fetch("http://localhost:5000/login?username=${username}&password=${password}")
            .then((res) => {
                if (res.ok) return res.json();
                if (res.status === 400) throw new Error("Errore: Richiesta non valida");
                if (res.status === 404) throw new Error("Errore: Risorsa non trovata");
                if (res.status === 500) throw new Error("Errore interno del server");
                if (res.status === 502) throw new Error("Errore: Bad Gateway");
                throw new Error("Errore: risposta non valida");
            })
            .then((data) => {
                //Qua bisogna settare i dati dopo i login se ha avuto successo
                setUsr(data.usr);
                setPsw(data.psw)
                setError("");
            })
            .catch((err) => {
                //Qua se sei un coglione e sbagli i dati
                setError(err.message);
            });
    }

    return(
        <div>
            <form onSubmit={createEvent}>
                <label>Username</label>
                <input type="text" value={usr} onChange={(e) => setUsr(e.target.value)}/>
                <label>Password</label>
                <input type="text" value={usr} onChange={(e) => setPsw(e.target.value)}/>
                <button type="submit">Accedi</button>
            </form>
        </div>
    )
}

export default Accesso;