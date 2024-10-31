import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://comptaonline.line.pm/api/forgot-password", { email });
      alert("Password reset link sent to your email.");
    } catch (error) {
      alert("Error sending reset link.");
    }
  };

  return (
    <div className="container-fluid page-body-wrapper full-page-wrapper">
      <div className="content-wrapper d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">
            <div className="auth-form-light text-left py-5 px-4 px-sm-5">
              <div className="brand-logo">
                <img src="assets/images/logo-compta.png" alt="logo" />
              </div>
              <form onSubmit={handleSubmit} className="pt-3">
                <h2>Forgot Password</h2>
                <br />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-control"
                  required
                />
                <br />
                <button type="submit" className="btn btn-primary">Send Reset Link</button> &nbsp;
                <a href="/" className="btn btn-light" >Login</a>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
