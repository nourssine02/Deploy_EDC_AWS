import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import TiersSaisie from "../TiersSaisie";

const UpdateLivraison = ({ isSidebarOpen }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [livraison, setLivraison] = useState({
    date_BL: "",
    num_BL: "",
    code_tiers: "",
    tiers_saisie: "",
    reference_commande: "",
    montant_HT_BL: "",
    TVA_BL: "",
    montant_total_BL: "",
    observations: "",
    document_fichier: "",
  });

  useEffect(() => {
    axios
      .get(`https://comptaonline.line.pm/api/livraison/${id}`)
      .then((res) => {
        const data = res.data[0];
        setLivraison({
          date_BL: data.date_BL ? data.date_BL.split('T')[0] : "",
          num_BL: data.num_BL,
          code_tiers: data.code_tiers,
          tiers_saisie: data.tiers_saisie,
          reference_commande: data.reference_commande,
          montant_HT_BL: data.montant_HT_BL,
          TVA_BL: data.TVA_BL,
          montant_total_BL: data.montant_total_BL,
          observations: data.observations,
          document_fichier: data.document_fichier,
        });
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "document_fichier" && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLivraison((prev) => ({ ...prev, document_fichier: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setLivraison((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "tiers_saisie" && value === "") {
      setShowModal(true);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://comptaonline.line.pm/api/livraison/${id}`, livraison);
      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Livraison mis à jour avec succès.",
      });
      navigate("/livraisons");
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la mise à jour du Livraison.Veuillez réessayer.",
      });
    }
  };

  const [codeTiers, setCodeTiers] = useState([]);

  useEffect(() => {
    const fetchCodeTiers = async () => {
      try {
        const res = await axios.get("https://comptaonline.line.pm/api/code_tiers");
        setCodeTiers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCodeTiers();
  }, []);

  const [refCommandes, setRefCommandes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleModalShow = () => setShowModal(true);

  useEffect(() => {
    const fetchRefCommande = async () => {
      try {
        const res = await axios.get("https://comptaonline.line.pm/api/reference_commande");
        setRefCommandes(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRefCommande();
  }, []);

  const handleCancel = () => {
    navigate("/livraisons");
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="card">
          <div className="card-body">
            <h2 className="text-center">Modifier une Livraison</h2>
            <br />
            <form className="forms-sample">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Date du Bon de Livraison :</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date_BL"
                      onChange={handleChange}
                      value={livraison.date_BL}
                    />
                  </div>

                  <div className="form-group">
                    <label>Référence Commande:</label>
                    <select
                      style={{ color: "black" }}
                      className="form-control form-control-lg"
                      name="reference_commande"
                      onChange={handleChange}
                      value={livraison.reference_commande}
                    >
                      <option value="" style={{ color: "black" }}>
                        Référence Commande
                      </option>
                      {refCommandes.map((refCommande) => (
                        <option
                          key={refCommande.num_commande}
                          value={refCommande.num_commande}
                          style={{ color: "black" }}
                        >
                          {refCommande.num_commande}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="col-md-4">
              
                  <div className="form-group">
                    <label>Code Tiers:</label>
                    <select
                      style={{ color: "black" }}
                      className="form-control form-control-lg"
                      name="code_tiers"
                      onChange={handleChange}
                      value={livraison.code_tiers}
                    >
                      <option value="" style={{ color: "black" }}>
                        Sélectionner le Code Tiers
                      </option>
                      {codeTiers.map((tier) => (
                        <option
                          key={tier.id}
                          value={tier.id}
                        >
                          {`${tier.code_tiers} - ${tier.identite}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>N° du Bon de Livraison:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="num_BL"
                      onChange={handleChange}
                      placeholder="N° du Bon de Livraison"
                      value={livraison.num_BL}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>Tiers à ajouter:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tiers_saisie"
                      onChange={handleChange}
                      onClick={handleModalShow}
                      value={livraison.tiers_saisie}
                      disabled={!!livraison.code_tiers}
                    />
                  </div>

                  <div className="form-group">
                    <label>Montant HT du Bon de Livraison:</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-control"
                      name="montant_HT_BL"
                      onChange={handleChange}
                      placeholder="Montant HT du BL"
                      value={livraison.montant_HT_BL}
                    />
                     &nbsp;
                      <span>DT</span>
                    </div>
                  </div>
                 
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>TVA du Bon de Livraison:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="TVA_B"
                      onChange={handleChange}
                      placeholder="TVA du BL"
                      value={livraison.TVA_BL}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>Montant Total du Bon de Livraison:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="montant_total_BL"
                      onChange={handleChange}
                      placeholder="Montant Total du BL"
                      value={livraison.montant_total_BL}
                    />
                  </div>
                </div>


                <div className="col-md-4">
                  <div className="form-group">
                    <label>Observations:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="observations"
                      onChange={handleChange}
                      placeholder="Entrez vos observations ici..."
                      value={livraison.observations}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                <div className="form-group">
                    <label>Document / Fichier à Insérer :</label>
                    <input
                      type="file"
                      className="form-control"
                      name="document_fichier" 
                      onChange={handleChange}
                    />
                    {livraison.document_fichier && (
                      <img
                      src={livraison.document_fichier}
                      alt="Facture Document"
                      style={{
                        width: "100px",
                        height: "auto",
                        cursor: "pointer",
                      }}
                    />
                    
                    )}
                  </div>
                  </div>
                                 
                  

                
              </div>
              <div className="d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-primary mr-2"
                  onClick={handleClick}
                >
                  Enregistrer
                </button>
                <button className="btn btn-light" onClick={handleCancel}>
                  Annuler
                </button>
              </div>
            </form>
            <TiersSaisie showModal={showModal} setShowModal={setShowModal} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLivraison;
