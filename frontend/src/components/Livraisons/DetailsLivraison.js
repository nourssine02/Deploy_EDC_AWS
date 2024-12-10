import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../Connexion/UserProvider";

const DetailsLivraison = ({ isSidebarOpen }) => {
  const { id } = useParams();
  const { user } = useContext(UserContext);

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
      .get(`https://comptaonline.linkpc.net/api/livraison/${id}`)
      .then((res) => {
        const data = res.data[0];
        setLivraison({
          date_BL: data.date_BL,
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

  const handleCancel = () => {
    navigate("/livraisons");
  };

  function openDocumentInNewWindow(livraison) {
    var newWindow = window.open("", "_blank");

    if (newWindow) {
      newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <style>  
                img {
                    margin-left: 400px;
                }
                .print{
                  margin-left: 500px;
                }
            </style>
            </head>
            <body>
                <img src="${livraison.document_fichier}" alt="Document Image">
                <br></br><br></br>
                <div class="print">
                <button onclick="window.print()" >Print</button>
                <a href="${livraison.document_fichier}" download="document_image.jpg"><button>Download</button></a>
                </div>
            </body>
            </html>
        `);
      newWindow.document.close();
    } else {
      alert(
        "The new window could not be opened. Please check your browser settings."
      );
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://comptaonline.linkpc.net/api/livraison/${id}`);
      toast.success("Livraison supprimée avec succès !");
      navigate("/livraisons"); // Navigate back after deletion
    } catch (err) {
      if (err.response && err.response.status === 500) {
        // Si l'erreur est une contrainte de clé étrangère ou un problème serveur
        toast.error(
          "Impossible de supprimer cette livraison. Elle est liée à d'autres données."
        );
      } else {
        // Autres erreurs possibles
        toast.error("Erreur lors de la suppression de la livraison.");
      }
      console.error("Error deleting livraison:", err);
    }
  };

  const confirmDelete = (id) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cette livraison ?"
    );
    if (confirmDelete) {
      handleDelete(id);
    }
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <h3 className="title text-center">
                        Détails de la Livraison
                      </h3>
                      <br />
                      <ul className="list-arrow" style={{ fontSize: "15px" }}>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Date du Bon de Livraison:
                          </strong>
                          {new Date(livraison.date_BL).toLocaleDateString()}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            N° du Bon de Livraison:
                          </strong>{" "}
                          {livraison.num_BL}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Code Tiers:
                          </strong>{" "}
                          {livraison.code_tiers}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Tiers à Saisir:
                          </strong>{" "}
                          {livraison.tiers_saisie}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Référence Commande:
                          </strong>{" "}
                          {livraison.reference_commande}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Montant HT du Bon de Livraison:
                          </strong>{" "}
                          {livraison.montant_HT_BL}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            TVA du Bon de Livraison:
                          </strong>{" "}
                          {livraison.TVA_BL}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Montant Total du Bon de Livraison:
                          </strong>{" "}
                          {livraison.montant_total_BL}
                        </li>
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Observations:
                          </strong>{" "}
                          {livraison.observations}
                        </li>{" "}
                        <li>
                          <strong
                            style={{ color: "#118ab2", fontWeight: "bold" }}
                          >
                            Document / Fichier à Insérer:
                          </strong>{" "}
                          <button
                            onClick={() => openDocumentInNewWindow(livraison)}
                            className="btn btn-btn-outline-dribbble"
                          >
                            Voir Document
                          </button>
                        </li>
                      </ul>
                      <div className="d-flex justify-content-center">
                        {user.role !== "comptable" && (
                          <>
                            <Link
                              to={`/updateLivraison/${id}`}
                              className="mr-2"
                            >
                              <button type="button" className="btn btn-success">
                                Modifier
                              </button>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-danger mr-2"
                              onClick={() => confirmDelete(livraison.id)}
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="btn btn-warning mr-2"
                          onClick={handleCancel}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsLivraison;
