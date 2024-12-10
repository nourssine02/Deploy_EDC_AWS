import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    role: "",
  });
  const [errors, setErrors] = useState({
    code_entreprise: "",
    code_comptable: "",
    code_user: "",
    identite: "",
    position: "",
    tel: "",
    email: "",
    mot_de_passe: "",
  });
  const [serverError, setServerError] = useState("");
  const [inputValidity, setInputValidity] = useState({
    code_user: false,
    identite: false,
    position: false,
    tel: false,
    email: false,
    mot_de_passe: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role" && value === "comptable") {
      setUserData({ ...userData, [name]: value, code_entreprise: "", code_comptable: "" });
    } else {
      setUserData({ ...userData, [name]: value });
    }

    // Reset errors on change
    setErrors({ ...errors, [name]: "" });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let valid;
    switch (name) {
      case "code_user":
        valid = value !== "";
        setErrors((prev) => ({
          ...prev,
          code_user: valid ? "" : "Code Utilisateur is required",
        }));
        break;
      case "identite":
        valid =
          value !== "" &&
          !identites.some((item) => item.identite === value);
        setErrors((prev) => ({
          ...prev,
          identite: valid ? "" : "Identite déjà existe ou vide",
        }));
        break;
      case "position":
        valid = value !== "";
        setErrors((prev) => ({
          ...prev,
          position: valid ? "" : "Position is required",
        }));
        break;
      case "tel":
        valid = /^\d{8}$/.test(value);
        setErrors((prev) => ({
          ...prev,
          tel: valid ? "" : "Telephone must be 8 digits",
        }));
        break;
      case "email":
        valid = /\S+@\S+\.\S+/.test(value);
        setErrors((prev) => ({
          ...prev,
          email: valid ? "" : "Email must be valid",
        }));
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

    // Validate all fields before submission
    Object.keys(userData).forEach((key) => validateField(key, userData[key]));

    // Check if all inputs are valid
    if (Object.values(inputValidity).every((valid) => valid)) {
      try {
        await axios.post("https://comptaonline.linkpc.net/api/register", userData);
        navigate("/");
      } catch (error) {
        if (error.response && error.response.data && error.response.data.sqlMessage) {
          setServerError(error.response.data.sqlMessage);
        } else {
          console.error("Erreur :", error);
        }
      }
    }
  };

  useEffect(() => {
    const fetchEntrepriseCodes = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/code_entreprises");
        setEntrepriseCodes(res.data);
        console.log(res.data);
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
        console.log(res.data);
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
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchIdentites();
  }, []);

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-6 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <img src="assets/images/logo-compta.png" alt="logo" />
                </div>
                <h4>New here?</h4>
                <h6 className="font-weight-light">
                  Signing up is easy. It only takes a few steps
                </h6>
                <form className="pt-3" onSubmit={handleSubmit}>
                  {serverError && (
                    <div className="alert alert-danger">{serverError}</div>
                  )}
                  <div className="form-row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className={`form-control form-control-lg ${
                            inputValidity.code_user
                              ? "is-valid"
                              : errors.code_user
                              ? "is-invalid"
                              : ""
                          }`}
                          name="code_user"
                          value={userData.code_user}
                          onChange={handleChange}
                          placeholder="Code Utilisateur"
                        />
                        {errors.code_user && (
                          <div className="invalid-feedback">
                            {errors.code_user}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className={`form-control form-control-lg ${
                            inputValidity.identite
                              ? "is-valid"
                              : errors.identite
                              ? "is-invalid"
                              : ""
                          }`}
                          name="identite"
                          value={userData.identite}
                          onChange={handleChange}
                          placeholder="Identite"
                        />
                        {errors.identite && (
                          <div className="invalid-feedback">
                            {errors.identite}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          className={`form-control form-control-lg ${
                            inputValidity.position
                              ? "is-valid"
                              : errors.position
                              ? "is-invalid"
                              : ""
                          }`}
                          name="position"
                          value={userData.position}
                          onChange={handleChange}
                          placeholder="Position"
                        />
                        {errors.position && (
                          <div className="invalid-feedback">
                            {errors.position}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="tel"
                          className={`form-control form-control-lg ${
                            inputValidity.tel
                              ? "is-valid"
                              : errors.tel
                              ? "is-invalid"
                              : ""
                          }`}
                          name="tel"
                          value={userData.tel}
                          onChange={handleChange}
                          placeholder="Telephone"
                        />
                        {errors.tel && (
                          <div className="invalid-feedback">{errors.tel}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          className={`form-control form-control-lg ${
                            inputValidity.email
                              ? "is-valid"
                              : errors.email
                              ? "is-invalid"
                              : ""
                          }`}
                          name="email"
                          value={userData.email}
                          onChange={handleChange}
                          placeholder="Email"
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <select
                          style={{ color: "black" }}
                          className={`form-control ${
                            inputValidity.role
                              ? "is-valid"
                              : errors.role
                              ? "is-invalid"
                              : ""
                          }`}
                          name="role"
                          value={userData.role}
                          onChange={handleChange}
                        >
                          <option value="">Sélectionnez le role...</option>
                          <option value="comptable">Comptable</option>
                          <option value="utilisateur">Utilisateur</option>
                        </select>
                        {errors.role && (
                          <div className="invalid-feedback">{errors.role}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {userData.role === "utilisateur" && (
                    <div className="form-row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <select
                            className={`form-control form-control-lg ${
                              inputValidity.code_entreprise
                                ? "is-valid"
                                : errors.code_entreprise
                                ? "is-invalid"
                                : ""
                            }`}
                            style={{ color: "black" }}
                            name="code_entreprise"
                            value={userData.code_entreprise}
                            onChange={handleChange}
                          >
                            <option value="" style={{ color: "gray" }}>
                              Code Entreprise
                            </option>
                            {entrepriseCodes.map((entrepriseCode) => (
                              <option
                                key={entrepriseCode.code_entreprise}
                                value={entrepriseCode.code_entreprise}
                                style={{ color: "black" }}
                              >
                                {entrepriseCode.code_entreprise}
                              </option>
                            ))}
                          </select>
                          {errors.code_entreprise && (
                            <div className="invalid-feedback">
                              {errors.code_entreprise}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                          <div className="form-group">
                            <select
                              className={`form-control form-control-lg ${
                                inputValidity.code_comptable
                                  ? "is-valid"
                                  : errors.code_comptable
                                  ? "is-invalid"
                                  : ""
                              }`}
                              style={{ color: "black" }}
                              name="code_comptable"
                              value={userData.code_comptable}
                              onChange={handleChange}
                            >
                              <option value="" style={{ color: "gray" }}>
                                Identite et code Comptable
                              </option>
                              {comptableCodes.map((comptable) => (
                                <option
                                  key={comptable.code_comptable}
                                  value={comptable.code_comptable}
                                  style={{ color: "black" }}
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
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <input
                      type="password"
                      className={`form-control form-control-lg ${
                        inputValidity.mot_de_passe
                          ? "is-valid"
                          : errors.mot_de_passe
                          ? "is-invalid"
                          : ""
                      }`}
                      name="mot_de_passe"
                      value={userData.mot_de_passe}
                      onChange={handleChange}
                      placeholder="Mot de Passe"
                    />
                    {errors.mot_de_passe && (
                      <div className="invalid-feedback">
                        {errors.mot_de_passe}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      type="submit"
                    >
                      SIGN UP
                    </button>
                  </div>

                  <div className="text-center mt-4 font-weight-light">
                    Already have an account?{" "}
                    <a href="/" className="text-primary">
                      Login
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
