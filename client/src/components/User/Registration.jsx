import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { showError, showSuccess } from '../../utils/toasts'
import Header from "../Header/Header";

import { Form, Input, Button } from '@heroui/react'

function Registration() {
  const navigate = useNavigate();
  const [usr, setUsr] = useState("");
  const [psw, setPsw] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    const requestBody = {
      username: usr,
      password: CryptoJS.SHA1(psw).toString(CryptoJS.enc.Hex),
      name: name,
      surname: surname,
      email: email
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        showSuccess('Registrazione effettuata')
        navigate("/login")
      } else {
        throw new Error()
      }
    } catch (error) {
      showError('Registrazione fallita')
    }
  }

  return (
    <div>
      <Header />
      <h2>Registrazione</h2>
      <Form
        className="flex flex-col items-center"
        validationBehavior="native"
        onSubmit={handleRegister}
      >
        <Input
          type="text"
          label='Username'
          value={usr}
          onChange={(e) => setUsr(e.target.value)}
          isRequired
        />
        <Input
          type="password"
          label='Password'
          value={psw}
          onChange={(e) => setPsw(e.target.value)}
          isRequired
        />
        <Input
          type="text"
          label='Nome'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="text"
          label='Cognome'
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <Input
          type="email"
          label='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isRequired
        />
        <Button type="submit" color="primary" variant="solid">
          Registrati
        </Button>
      </Form>
    </div>
  )
}

export default Registration;
