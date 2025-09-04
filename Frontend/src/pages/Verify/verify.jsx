import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./verify.css";

const Verify = () => {
  const navigate = useNavigate();
  const { url, token, setShowLogin } = useContext(StoreContext);

  const [status, setStatus] = useState("Processing your payment, please wait...");

  // Read query params from URL
  const queryParams = new URLSearchParams(window.location.search);
  const success = queryParams.get("success");
  const orderId = queryParams.get("orderId");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!token) {
        if (setShowLogin) setShowLogin(true);
        setStatus("You need to log in to verify payment.");
        return;
      }

      try {
        const response = await axios.post(
          `${url}/api/orders/verify`,
          { orderId, success },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setStatus("✅ Payment successful! Redirecting to your orders...");
          setTimeout(() => navigate("/myorders"), 2000);
        } else {
          setStatus("❌ Payment failed. Redirecting to home...");
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (error) {
        console.error("🔥 Verify Payment Error:", error.response?.data || error.message);
        setStatus("⚠️ Verification failed. Redirecting to home...");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    if (orderId) {
      verifyPayment();
    } else {
      setStatus("⚠️ Invalid verification link. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [orderId, success, token, url, navigate, setShowLogin]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>{status}</p>
    </div>
  );
};

export default Verify;
