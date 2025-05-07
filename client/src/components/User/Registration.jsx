import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { showError, showSuccess } from '../../utils/toasts'
import Header from "../Header/Header";
import Password from "./Password";

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
      const response = await fetch(`${process.env.REACT_APP_API ?? ''}/api/users/register`, {
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
      <h1 className='text-center font-[Graffiti] text-blue-900 text-6xl lg:text-7xl mt-3 lg:mt-5'>
        SELFIE
      </h1>
      <div className="w-3/5 lg:w-1/5 mx-auto mt-12">
        <h2 className="text-3xl text-center">
          Registrazione
        </h2>
        <Form
          className="mt-10 flex flex-col items-center gap-4"
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
          <Password
            value={psw}
            setValue={setPsw}
            isRequired={true}
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
          <Button className="w-28 lg:w-32 mt-4" type="submit" color="primary" variant="solid">
            Registrati
          </Button>
        </Form>
      </div>
    </div>
  )
}

export default Registration;
