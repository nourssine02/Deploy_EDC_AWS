import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddUser = ({ isSidebarOpen }) => {
  const [user, setUser] = useState({
    code_entreprise: "",
    code_user: "",
    identite: "",
    position: "",
    tel: "",
    email: "",
    mot_de_passe: "",
    role: ""
  });
  const [entrepriseCodes, setEntrepriseCodes] = useState([]);
  const [errors, setErrors] = useState({
    code_entreprise: "",
    code_user: "",
    identite: "",
    position: "",
    tel: "",
    email: "",
    mot_de_passe: "",
    role: ""
  });
  const [inputValidity, setInputValidity] = useState({
    code_user: false,
    identite: false,
    position: false,
    tel: false,
    email: false,
    mot_de_passe: false,
    role: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

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
        valid = value !== "";
        setErrors((prev) => ({
          ...prev,
          identite: valid ? "" : "Identité is required",
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
          tel: valid ? "" : "Téléphone must be 8 digits",
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
      case "role":
        valid = value !== "";
        setErrors((prev) => ({
          ...prev,
          role: valid ? "" : "Role is required",
        }));
        break;
      default:
        break;
    }
    setInputValidity((prev) => ({ ...prev, [name]: valid }));
  };

  const handleCancel = () => {
    navigate("/users");
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

  const handleClick = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    Object.keys(user).forEach((key) => validateField(key, user[key]));

    // Check if all inputs are valid
    if (Object.values(inputValidity).every((valid) => valid)) {
      try {
        await axios.post("https://comptaonline.linkpc.net/api/users", user);
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Utilisateur ajoutée avec succès.",
        });
        navigate("/users");
      } catch (error) {
          console.error("Erreur :", error);
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "L'ajout de l'Utilisateur a échoué.",
          });
      }
    }
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="card">
          <div className="card-body">
            <h2 className="text-center">Ajouter un Utilisateur</h2>
            <br /><br />
            <form className="forms-sample">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Code Entreprise:</label>
                    <select
                      className={`form-control form-control-lg ${
                        errors.code_entreprise ? "is-invalid" : ""
                      }`}
                      name="code_entreprise"
                      style={{ color: "black" }}
                      value={user.code_entreprise}
                      onChange={handleChange}
                    >
                      <option value="" style={{ color: "black" }}>
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
                  <div className="form-group">
                    <label>Code Utilisateur:</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.code_user ? "is-invalid" : ""
                      }`}
                      name="code_user"
                      value={user.code_user}
                      onChange={handleChange}
                      placeholder="Code Utilisateur"
                    />
                    {errors.code_user && (
                      <div className="invalid-feedback">
                        {errors.code_user}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Role:</label>
                    <select
                      style={{ color: "black" }}
                      className={`form-control ${
                        errors.role ? "is-invalid" : ""
                      }`}
                      name="role"
                      value={user.role}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="comptable">Comptable</option>
                      <option value="utilisateur">Utilisateur</option>
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback">{errors.role}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Identité :</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.identite ? "is-invalid" : ""
                      }`}
                      name="identite"
                      value={user.identite}
                      onChange={handleChange}
                      placeholder="Identité"
                    />
                    {errors.identite && (
                      <div className="invalid-feedback">
                        {errors.identite}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Position :</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.position ? "is-invalid" : ""
                      }`}
                      name="position"
                      value={user.position}
                      onChange={handleChange}
                      placeholder="Position"
                    />
                    {errors.position && (
                      <div className="invalid-feedback">
                        {errors.position}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Mot de Passe :</label>
                    <input
                      type="password"
                      className={`form-control ${
                        errors.mot_de_passe ? "is-invalid" : ""
                      }`}
                      name="mot_de_passe"
                      value={user.mot_de_passe}
                      onChange={handleChange}
                      placeholder="Mot de passe"
                    />
                    {errors.mot_de_passe && (
                      <div className="invalid-feedback">
                        {errors.mot_de_passe}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Téléphone :</label>
                    <input
                      type="tel"
                      className={`form-control ${
                        errors.tel ? "is-invalid" : ""
                      }`}
                      name="tel"
                      value={user.tel}
                      onChange={handleChange}
                      placeholder="Téléphone"
                    />
                    {errors.tel && (
                      <div className="invalid-feedback">{errors.tel}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email :</label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      name="email"
                      value={user.email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>
              </div>
              <br />
              <div className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-primary mr-2"
                  onClick={handleClick}
                >
                  Submit
                </button>
                &nbsp; &nbsp;
                <button className="btn btn-light" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
