import React, { useState } from "react";

// ivan: "se si può per favore nominiamo tutto in inglese pleaseee, per mantenere conformità"
function Accesso() {
    // ivan: "queste tre variabili non dovrebbero servire, user e psw vengono mantenuti nel backend e l'errore ce l'hai quando serve nel ramo .cacth della fetch"
    const [usr, setUsr] = useState("");
    const [psw, setPsw] = useState("");
    const [err, setError] = useState("");

    function createEvent(e){
        e.preventDefault();

        // ivan: "INVIARE I DATI AL BACKEND CON IL POST === DATI SEGRETI" -> chiamare i campi 'usr' e 'psw'
        // la route dovebbe essere http://localhost:8000/login
        //Ora bisognerebbe fare la fect con il GET (quindi senza request body ecc.) confrontando l'username e la password
        
        fetch("http://localhost:5000/login?username=${username}&password=${password}")
            .then((res) => {
                // ivan: "i controlli degli errori non servono perchè se c'è errore non entri qui"
                if (res.ok) return res.json();
                if (res.status === 400) throw new Error("Errore: Richiesta non valida");
                if (res.status === 404) throw new Error("Errore: Risorsa non trovata");
                if (res.status === 500) throw new Error("Errore interno del server");
                if (res.status === 502) throw new Error("Errore: Bad Gateway");
                throw new Error("Errore: risposta non valida");
            })
            .then((data) => {
                //Qua bisogna settare i dati dopo i login se ha avuto successo
                // ivan: "login con successo quindi mostrare la dashboard della homepage (un placeholder per ora)"
                setUsr(data.usr);
                setPsw(data.psw);
                setError("");
            })
            .catch((err) => {
                //Qua se sei un coglione e sbagli i dati
                // ivan: "mostrare un messaggio di errore con il codice ed il testo"
                setError(err.message);
            });
    }

    return(
        <div>
            {/* Molto bello mi piasce, voto DIESCI */}
            {/* DEBUG: <form method="post" action="http://localhost:8000/login"> */}
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