import React, { useContext, useState } from 'react'

import './signup.scss';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function Signup() {

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer"
  });

  const [error, setError] = useState("");

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Invalid email format!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be of min 6 characters!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong!")
        return;
      }

      if(data.success){
        localStorage.setItem("token", data.token);
        const user = { email: data.email, name: data.name, role: data.role }
        localStorage.setItem("user", user);
        console.log(data);
        console.log(user);
        login(user, data.token);
        alert("User registered successfully");
        navigate('/');
      }
      else{
        alert("User registration failed!");
      }

    } catch (error) {
      console.log(error)
      setError("Server error. Please try again later!")
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="signup" onSubmit={submitHandler}>
      <h3>Signup</h3>
      {error && <p className='error'>{error}</p>}
      <label>Username</label>
      <input type="text" name='name' onChange={onChangeHandler} />
      <label>Email</label>
      <input type="text" name='email' onChange={onChangeHandler} />
      <label>Password</label>
      <input type="password" name='password' onChange={onChangeHandler} />
      <label>Confirm Password</label>
      <input type="password" name='confirmPassword' onChange={onChangeHandler} />
      <div className="radio-buttons">
        <label>Select Role:</label>
        <input type="radio" id='buyer-button' value="buyer" name='role' onChange={onChangeHandler} checked={formData.role === "buyer"} />
        <label htmlFor="buyer-button"> Buyer</label>
        <input type="radio" id='seller-button' value="seller" name='role' onChange={onChangeHandler} />
        <label htmlFor="seller-button"> Seller</label>
      </div>
      <button type="submit" disabled={loading} className={`auth-button ${loading && 'loading-state'}`}>
        {loading ? 'Signing up...' : 'Signup'}
      </button>
      <span className='desc'>New user ? <Link to='/login' className='link'><span>Login</span></Link> here</span>
    </form>
  )
}
