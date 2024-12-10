import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [entrepriseCodes, setEntrepriseCodes] = useState([]);
  const [comptableCodes, setComptableCodes] = useState([]);
  const [identites, setIdentites] = useState([]);
  const [userData, setUserData] = useState({
    code_entreprise: "",
    code_comptable: "",
    code_user: "",
    identite: "",
    position: "",
    tel: "",
    email: "",
    mot_de_passe: "",
    role: "utilisateur", // Role par défaut
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [inputValidity, setInputValidity] = useState({});
  const [roleSelected, setRoleSelected] = useState("utilisateur"); // Par défaut utilisateur
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && value === "comptable") {
      setUserData({ ...userData, [name]: value, code_entreprise: "", code_comptable: "" });
    } else {
      setUserData({ ...userData, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
    validateField(name, value);
  };

  const handleRoleChange = (role) => {
    setRoleSelected(role);
    setUserData({ ...userData, role }); // Update userData with the selected role
  };

  const validateField = (name, value) => {
    let valid;
    switch (name) {
      case "code_user":
        valid = value !== "";
        setErrors((prev) => ({ ...prev, code_user: valid ? "" : "Code Utilisateur is required" }));
        break;
      case "identite":
        valid = value !== "" && !identites.some((item) => item.identite === value);
        setErrors((prev) => ({
          ...prev,
          identite: valid ? "" : "Identite déjà existe ou vide",
        }));
        break;
      case "tel":
        valid = /^\d{8}$/.test(value);
        setErrors((prev) => ({ ...prev, tel: valid ? "" : "Telephone must be 8 digits" }));
        break;
      case "email":
        valid = /\S+@\S+\.\S+/.test(value);
        setErrors((prev) => ({ ...prev, email: valid ? "" : "Email must be valid" }));
        break;
      case "mot_de_passe":
        valid = value.length >= 4;
        setErrors((prev) => ({
          ...prev,
          mot_de_passe: valid ? "" : "Mot de Passe must be at least 4 characters",
        }));
        break;
      default:
        break;
    }
    setInputValidity((prev) => ({ ...prev, [name]: valid }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!["utilisateur", "comptable"].includes(userData.role)) {
      setServerError("Rôle invalide sélectionné.");
      return;
    }

    // Validate all fields before submission
    Object.keys(userData).forEach((key) => validateField(key, userData[key]));

    if (Object.values(inputValidity).every((valid) => valid)) {
      try {
        await axios.post("https://comptaonline.linkpc.net/api/register", userData);
        navigate("/");
      } catch (error) {
        setServerError(error.response?.data?.sqlMessage || "Erreur lors de l'inscription");
      }
    }
  };

  useEffect(() => {
    const fetchEntrepriseCodes = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/code_entreprises");
        setEntrepriseCodes(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEntrepriseCodes();
  }, []);

  useEffect(() => {
    const fetchComptableCodes = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/comptables");
        setComptableCodes(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchComptableCodes();
  }, []);

  useEffect(() => {
    const fetchIdentites = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/identite");
        setIdentites(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchIdentites();
  }, []);

  return (
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0 pt-4">
          <div className="row w-100 mx-0">
            <div className="col-lg-6 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                <div className="brand-logo mb-3">
                  <img src="assets/images/logo-compta.png" alt="logo" />
                </div>
                <h4>New here?</h4>
                <h6 className="font-weight-light">Signing up is easy. It only takes a few steps</h6>
                <form className="pt-3" onSubmit={handleSubmit}>
                  {serverError && <div className="alert alert-danger">{serverError}</div>}

                  {/* Role Toggle Buttons */}
                  <div className="form-group text-center mb-4">
                    <button
                        type="button"
                        className={`btn btn-toggle ${roleSelected === "utilisateur" ? "btn-active" : ""}`}
                        onClick={() => handleRoleChange("utilisateur")}
                    >
                      Utilisateur
                    </button>
                    <button
                        type="button"
                        className={`btn btn-toggle ${roleSelected === "comptable" ? "btn-active" : ""}`}
                        onClick={() => handleRoleChange("comptable")}
                    >
                      Comptable
                    </button>
                  </div>


                  {/* Role-Specific Fields */}
                  {roleSelected === "utilisateur" && (
                      <div className="form-group">
                        <div className="row">
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.code_user ? "is-invalid" : ""}`}
                                name="code_user"
                                value={userData.code_user}
                                onChange={handleChange}
                                placeholder="Code Utilisateur"
                            />
                            {errors.code_user && <div className="invalid-feedback">{errors.code_user}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.identite ? "is-invalid" : ""}`}
                                name="identite"
                                value={userData.identite}
                                onChange={handleChange}
                                placeholder="Identité"
                            />
                            {errors.identite && <div className="invalid-feedback">{errors.identite}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.position ? "is-invalid" : ""}`}
                                name="position"
                                value={userData.position}
                                onChange={handleChange}
                                placeholder="Position"
                            />
                            {errors.position && <div className="invalid-feedback">{errors.position}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="tel"
                                className={`form-control rounded ${errors.tel ? "is-invalid" : ""}`}
                                name="tel"
                                value={userData.tel}
                                onChange={handleChange}
                                placeholder="Téléphone"
                            />
                            {errors.tel && <div className="invalid-feedback">{errors.tel}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="email"
                                className={`form-control rounded ${errors.email ? "is-invalid" : ""}`}
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                          </div>
                          <div className="col-md-6">
                            <select
                                style={{color: "black"}}
                                className="form-control rounded"
                                name="code_entreprise"
                                value={userData.code_entreprise}
                                onChange={handleChange}
                            >
                              <option value="">Code Entreprise</option>
                              {entrepriseCodes.map((code) => (
                                  <option key={code.code_entreprise} value={code.code_entreprise}>
                                    {code.code_entreprise}
                                  </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <select
                                className={`form-control rounded ${
                                    inputValidity.code_comptable
                                        ? "is-valid"
                                        : errors.code_comptable
                                            ? "is-invalid"
                                            : ""
                                }`}
                                style={{color: "black"}}
                                name="code_comptable"
                                value={userData.code_comptable}
                                onChange={handleChange}
                            >
                              <option value="" style={{color: "gray"}}>
                                Code Comptable
                              </option>
                              {comptableCodes.map((comptable) => (
                                  <option
                                      key={comptable.code_comptable}
                                      value={comptable.code_comptable}
                                      style={{color: "black"}}
                                  >
                                    {`${comptable.identite} - ${comptable.code_user}`}

                                  </option>
                              ))}
                            </select>
                            {errors.code_comptable && (
                                <div className="invalid-feedback">
                                  {errors.code_comptable}
                                </div>
                            )}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="password"
                                className={`form-control rounded ${errors.mot_de_passe ? "is-invalid" : ""}`}
                                name="mot_de_passe"
                                value={userData.mot_de_passe}
                                onChange={handleChange}
                                placeholder="Mot de Passe"
                            />
                            {errors.mot_de_passe && <div className="invalid-feedback">{errors.mot_de_passe}</div>}
                          </div>
                        </div>
                      </div>


                  )}

                  {roleSelected === "comptable" && (
                      <div className="form-group">
                        <div className="row">
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.code_user ? "is-invalid" : ""}`}
                                name="code_user"
                                value={userData.code_user}
                                onChange={handleChange}
                                placeholder="Code Comptable"
                            />
                            {errors.code_user && <div className="invalid-feedback">{errors.code_user}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.identite ? "is-invalid" : ""}`}
                                name="identite"
                                value={userData.identite}
                                onChange={handleChange}
                                placeholder="Identité"
                            />
                            {errors.identite && <div className="invalid-feedback">{errors.identite}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="text"
                                className={`form-control rounded ${errors.position ? "is-invalid" : ""}`}
                                name="position"
                                value={userData.position}
                                onChange={handleChange}
                                placeholder="Position"
                            />
                            {errors.position && <div className="invalid-feedback">{errors.position}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="tel"
                                className={`form-control rounded ${errors.tel ? "is-invalid" : ""}`}
                                name="tel"
                                value={userData.tel}
                                onChange={handleChange}
                                placeholder="Téléphone"
                            />
                            {errors.tel && <div className="invalid-feedback">{errors.tel}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="email"
                                className={`form-control rounded ${errors.email ? "is-invalid" : ""}`}
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                          </div>
                          <div className="col-md-6">
                            <input
                                type="password"
                                className={`form-control rounded ${errors.mot_de_passe ? "is-invalid" : ""}`}
                                name="mot_de_passe"
                                value={userData.mot_de_passe}
                                onChange={handleChange}
                                placeholder="Mot de Passe"
                            />
                            {errors.mot_de_passe && <div className="invalid-feedback">{errors.mot_de_passe}</div>}
                          </div>
                        </div>
                      </div>
                  )}


                  <div className="mt-3">
                    <button type="submit" className="btn btn-primary btn-lg btn-block">
                      SIGN UP
                    </button>
                  </div>
                </form>
                <div className="text-center mt-4 font-weight-light">
                  Already have an account? <a href="/" className="text-primary">Login</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
