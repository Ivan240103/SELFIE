import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { useAuth } from "../../contexts/AuthenticationContext";
import { showError } from '../../utils/toasts'
import Header from "../Header/Header";
import Password from "./Password";

import {
  Form,
  Input,
  Button,
  Link
} from '@heroui/react'

function Access() {
  const navigate = useNavigate();
  const { login } = useAuth()
  const [usr, setUsr] = useState("");
  const [psw, setPsw] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/api/users/login`, {
        username: usr,
        password: CryptoJS.SHA1(psw).toString(CryptoJS.enc.Hex)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      login(response.data);
      navigate("/");
    } catch (error) {
      showError("Login failed");
    }
  }

  return (
    <div>
      <Header />
      <h2>Login</h2>
      <Form
        className="flex flex-col items-center"
        validationBehavior="native"
        onSubmit={handleLogin}
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
        <p>
          Non hai un profilo? <Link href="/register" color="primary" underline="focus">Registrati</Link>
        </p>
        <Button type="submit" color="primary" variant="solid">
          Accedi
        </Button>
      </Form>
    </div>
  )
}

export default Access;
