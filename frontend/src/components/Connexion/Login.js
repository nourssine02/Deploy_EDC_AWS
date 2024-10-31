import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [identite, setIdentite] = useState("");
  const [mot_de_passe, setMot_de_passe] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://comptaonline.line.pm/api/login", {
        identite,
        mot_de_passe,
      });

      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", token);
      setMessage("Connexion réussie");
      setMessageType("success");
      setUser(user);
      navigate("/home");
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("Identifiants invalides ou problème de connexion");
      setMessageType("error");
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
              <h4>Hello! Let's get started</h4>
              <h6 className="font-weight-light">Sign in to continue.</h6>
              <form className="pt-3" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={identite}
                    placeholder="Identité"
                    onChange={(e) => setIdentite(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={mot_de_passe}
                    placeholder="Mot de Passe"
                    onChange={(e) => setMot_de_passe(e.target.value)}
                  />
                </div>
                <br />
                {message && (
                  <div className={`message ${messageType === "success" ? "text-success" : "text-danger"}`}>
                    {message}
                  </div>
                )}
                <div className="mt-3">
                  <button
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    type="submit"
                  >
                    SIGN IN
                  </button>
                </div>
                <br />
                <div className="my-3 d-flex justify-content-between align-items-center">
                  <a href="/forget_pass" className="auth-link text-black">
                    Forgot password?
                  </a>
                </div>
                <div className="text-center mt-4 font-weight-light">
                  Don't have an account?{" "}
                  <a href="/register" className="text-primary">
                    Create
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
