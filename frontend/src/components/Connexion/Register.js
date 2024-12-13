import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [userData, setUserData] = useState({
    role: "", // "utilisateur" ou "comptable"
    email: "",
    identite: "",
    mot_de_passe: "",
    tel: "",
    position: "",
  });

  const [comptableData, setComptableData] = useState({
    code_comptable: "",
    code_entreprise: "",
    email: "",
    identite: "",
    mot_de_passe: "",
    tel: "",
  });

  const [entrepriseCodes, setEntrepriseCodes] = useState([]);
  const [comptableCodes, setComptableCodes] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setUserData((prev) => ({ ...prev, role: value }));
    setErrors({});
  };

  const handleChange = (e, setData) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const currentData = userData.role === "utilisateur" ? userData : comptableData;
    const validationErrors = {};
    // Champs communs
    if (!currentData.email || !/\S+@\S+\.\S+/.test(currentData.email)) {
      validationErrors.email = "Email invalide";
    }
    if (!currentData.identite) {
      validationErrors.identite = "Identité est obligatoire";
    }
    if (!currentData.mot_de_passe || currentData.mot_de_passe.length < 4) {
      validationErrors.mot_de_passe = "Mot de passe doit contenir au moins 4 caractères";
    }
    if (!currentData.tel || !/^\d{8}$/.test(currentData.tel)) {
      validationErrors.tel = "Téléphone doit contenir exactement 8 chiffres";
    }

    // Champs spécifiques
    if (userData.role === "utilisateur") {
      if (!userData.position) {
        validationErrors.position = "Position est obligatoire";
      }
    } else if (userData.role === "comptable") {
      if (!comptableData.code_comptable) {
        validationErrors.code_comptable = "Code comptable est obligatoire";
      }
      if (!comptableData.code_entreprise) {
        validationErrors.code_entreprise = "Code entreprise est obligatoire";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = userData.role === "utilisateur" ? userData : comptableData;

    try {
      await axios.post("https://comptaonline.linkpc.net/api/register", payload);
      navigate("/");
    } catch (error) {
      if (error.response?.data?.sqlMessage) {
        setServerError(error.response.data.sqlMessage);
      } else {
        console.error("Erreur :", error);
      }
    }
  };

  useEffect(() => {
    const fetchEntrepriseCodes = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/code_entreprises");
        setEntrepriseCodes(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchComptableCodes = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/comptables");
        setComptableCodes(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEntrepriseCodes();
    fetchComptableCodes();
  }, []);

  return (
      <div className="container-scroller">
        <div className="content-wrapper d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-6 mx-auto">
              <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                <h4>Inscription</h4>
                {serverError && <div className="alert alert-danger">{serverError}</div>}
                <form className="pt-3" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <select
                        name="role"
                        className={`form-control ${errors.role ? "is-invalid" : ""}`}
                        value={userData.role}
                        onChange={handleRoleChange}
                    >
                      <option value="">Choisir un rôle...</option>
                      <option value="utilisateur">Utilisateur</option>
                      <option value="comptable">Comptable</option>
                    </select>
                    {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                  </div>

                  {userData.role === "utilisateur" && (
                      <>
                        <div className="form-group">
                          <input
                              type="text"
                              name="position"
                              className={`form-control ${errors.position ? "is-invalid" : ""}`}
                              placeholder="Position"
                              value={userData.position}
                              onChange={(e) => handleChange(e, setUserData)}
                          />
                          {errors.position && <div className="invalid-feedback">{errors.position}</div>}
                        </div>
                      </>
                  )}

                  {userData.role === "comptable" && (
                      <>
                        <div className="form-group">
                          <select
                              name="code_entreprise"
                              className={`form-control ${errors.code_entreprise ? "is-invalid" : ""}`}
                              value={comptableData.code_entreprise}
                              onChange={(e) => handleChange(e, setComptableData)}
                          >
                            <option value="">Sélectionner Code Entreprise</option>
                            {entrepriseCodes.map((code) => (
                                <option key={code.code_entreprise} value={code.code_entreprise}>
                                  {code.code_entreprise}
                                </option>
                            ))}
                          </select>
                          {errors.code_entreprise && (
                              <div className="invalid-feedback">{errors.code_entreprise}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <select
                              name="code_comptable"
                              className={`form-control ${errors.code_comptable ? "is-invalid" : ""}`}
                              value={comptableData.code_comptable}
                              onChange={(e) => handleChange(e, setComptableData)}
                          >
                            <option value="">Sélectionner Code Comptable</option>
                            {comptableCodes.map((code) => (
                                <option key={code.code_comptable} value={code.code_comptable}>
                                  {code.identite} - {code.code_comptable}
                                </option>
                            ))}
                          </select>
                          {errors.code_comptable && (
                              <div className="invalid-feedback">{errors.code_comptable}</div>
                          )}
                        </div>
                      </>
                  )}

                  {/* Champs communs */}
                  <div className="form-group">
                    <input
                        type="text"
                        name="identite"
                        className={`form-control ${errors.identite ? "is-invalid" : ""}`}
                        placeholder="Identité"
                        value={
                          userData.role === "utilisateur"
                              ? userData.identite
                              : comptableData.identite
                        }
                        onChange={(e) =>
                            userData.role === "utilisateur"
                                ? handleChange(e, setUserData)
                                : handleChange(e, setComptableData)
                        }
                    />
                    {errors.identite && <div className="invalid-feedback">{errors.identite}</div>}
                  </div>
                  <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        placeholder="Email"
                        value={
                          userData.role === "utilisateur"
                              ? userData.email
                              : comptableData.email
                        }
                        onChange={(e) =>
                            userData.role === "utilisateur"
                                ? handleChange(e, setUserData)
                                : handleChange(e, setComptableData)
                        }
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="form-group">
                    <input
                        type="password"
                        name="mot_de_passe"
                        className={`form-control ${errors.mot_de_passe ? "is-invalid" : ""}`}
                        placeholder="Mot de Passe"
                        value={
                          userData.role === "utilisateur"
                              ? userData.mot_de_passe
                              : comptableData.mot_de_passe
                        }
                        onChange={(e) =>
                            userData.role === "utilisateur"
                                ? handleChange(e, setUserData)
                                : handleChange(e, setComptableData)
                        }
                    />
                    {errors.mot_de_passe && (
                        <div className="invalid-feedback">{errors.mot_de_passe}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <input
                        type="tel"
                        name="tel"
                        className={`form-control ${errors.tel ? "is-invalid" : ""}`}
                        placeholder="Téléphone"
                        value={
                          userData.role === "utilisateur"
                              ? userData.tel
                              : comptableData.tel
                        }
                        onChange={(e) =>
                            userData.role === "utilisateur"
                                ? handleChange(e, setUserData)
                                : handleChange(e, setComptableData)
                        }
                    />
                    {errors.tel && <div className="invalid-feedback">{errors.tel}</div>}
                  </div>

                  <button className="btn btn-primary btn-block mt-3" type="submit">
                    Inscription
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;
