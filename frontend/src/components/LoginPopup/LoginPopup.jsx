import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../asset/assets';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext); // ✅ include setToken
  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let response;

      if (currState === "Login") {
        response = await axios.post(`${url}/api/user/login`, {
          email: data.email,
          password: data.password,
        });
        toast.success("✅ Logged in successfully!");
      } else {
        response = await axios.post(`${url}/api/user/register`, {
          name: data.name,
          email: data.email,
          password: data.password,
        });
        toast.success("🎉 Account created successfully!");
      }

      console.log("Server response:", response.data);

      // ✅ Save token in context + localStorage
      if (response.data.token) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
      }

      // Close popup after success
      setShowLogin(false);
    } catch (error) {
      console.error("Auth error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="loginpopup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign up" && (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="Your name"
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password"
            required
          />
        </div>

        <button type="submit">
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>
            By continuing, I agree to the terms of use & privacy policy
          </p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
