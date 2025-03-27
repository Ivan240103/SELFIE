import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate;
import CryptoJS from 'crypto-js'

import '../../css/Registration.css'

function Registration() {
  const [usr, setUsr] = useState("");
  const [psw, setPsw] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function handleRegister(e) {
    e.preventDefault();

    const URI = `${process.env.REACT_APP_API}/api/users/register`;
    const requestBody = {
      username: usr,
      password: CryptoJS.SHA1(psw).toString(CryptoJS.enc.Hex),
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
        if (res.ok) {
          alert("Registration completed!");
          navigate("/login");
        }
      })
      .catch((err) => {
        //messaggio di errore
        setErr("Registration failed: " + err.message || 'no response');
      });
  }

  return (
    <div className="register-container">
      <h1>Registrazione</h1>
      {err && <p>{err}</p>}
      <form onSubmit={handleRegister} className="register-form">
        <div className="register-group">
          <label htmlFor="username" className="register-label">
            <b>Username</b>
          </label>
          <input
            type="text"
            placeholder="Inserisci l'username"
            className="register-input"
            value={usr}
            onChange={(e) => setUsr(e.target.value)}
            required />
        </div>
        <div className="register-group">
          <label htmlFor="password" className="register-label">
            <b>Password</b>
          </label>
          <input
            type="password"
            placeholder="Inserisci la password"
            className="register-input"
            value={psw}
            onChange={(e) => setPsw(e.target.value)} required />
        </div>
        <div className="register-group">
          <label htmlFor="name" className="register-label">
            <b>Nome</b>
          </label>
          <input
            type="text"
            placeholder="Inserisci il nome"
            className="register-input"
            value={name}
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="register-group">
          <label htmlFor="surname" className="register-label">
            <b>Cognome</b>
          </label>
          <input
            type="text"
            placeholder="Inserisci il cognome"
            className="register-input"
            value={surname}
            onChange={(e) => setSurname(e.target.value)} />
        </div>
        <div className="register-group">
          <label htmlFor="email" className="register-label">
            <b>Email</b>
          </label>
          <input
            type="email"
            placeholder="Inserisci l'email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Registrami!</button>
      </form>
    </div>
  )
}

export default Registration