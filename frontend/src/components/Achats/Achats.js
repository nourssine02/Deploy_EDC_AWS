import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import ReactPaginate from "react-paginate";
import "./Achats.css";

const Achats = ({ isSidebarOpen }) => {
  const [achats, setAchats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("https://comptaonline.line.pm/api/clients");
        setClients(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchAchats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }

      try {
        const res = await axios.get("https://comptaonline.line.pm/api/achats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        setAchats(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("Jeton invalide, redirection vers la page de connexion.");
          window.location.href = "/";
        } else {
          setError("Erreur lors de la récupération des achats.");
          console.error(
            "Erreur lors de la récupération des Achats",
            err
          );
        }
      }
    };

    fetchAchats();
  }, [selectedClient]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Filtrer les achats par terme de recherche et client sélectionné
  const filteredAchats = achats.filter((achat) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
      !selectedClient || achat.code_entreprise === selectedClient; // Filtrer par code_entreprise

    return (
      isInClient &&
      (achat.identite.toLowerCase().includes(searchTermLower) ||
        new Date(achat.date_saisie)
          .toLocaleDateString()
          .includes(searchTermLower) ||
        achat.montant_total_piece.toString().includes(searchTermLower) ||
        achat.statut.toLowerCase().includes(searchTermLower) ||
        achat.num_piece.toLowerCase().includes(searchTermLower) ||
        achat.code_tiers.toLowerCase().includes(searchTermLower) ||
        achat.type_piece.toLowerCase().includes(searchTermLower) ||
        achat.ajoute_par.toLowerCase().includes(searchTermLower) ||
        new Date(achat.date_piece)
          .toLocaleDateString()
          .includes(searchTermLower))
    );
  });

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredAchats.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredAchats.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (!user) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="titre text-center">
                  Liste des Achats de Biens et de Services
                </h2>
                <br />
                <br />
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="input-group" style={{ maxWidth: "300px" }}>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                    </div>
                  </div>
                  {user.role !== "comptable" && (
                    <Link to="/addAchat">
                      <button type="button" className="btn btn-dark">
                        Ajouter un Achat
                      </button>
                    </Link>
                  )}
                  {user.role === "comptable" && (
                    <select
                      className="form-control w-auto mx-2"
                      style={{ color: "black" }}
                      value={selectedClient}
                      onChange={handleClientChange}
                    >
                      <option value="">Tous les Entreprises</option>
                      {clients.map((client) => (
                        <option
                          key={client.code_entreprise}
                          value={client.code_entreprise}
                        >
                          {`${client.code_entreprise} - ${client.identite}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div className="table-responsive pt-4">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date de Saisie</th>
                        <th>Code Tiers</th>
                        <th>Type de Pièce</th>
                        <th>N° de Pièce</th>
                        <th>Date de Pièce</th>
                        <th>Statut</th>
                        <th>
                          Montant Total<br></br>de la Pièce
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((achat) => (
                        <tr key={achat.id}>
                          {user.role === "comptable" && (
                            <td>{achat.identite}</td>
                          )}
                          <td>
                            {new Date(achat.date_saisie).toLocaleDateString()}
                          </td>
                          <td>{achat.code_tiers}</td>
                          <td>{achat.type_piece}</td>
                          <td>{achat.num_piece}</td>
                          <td>
                            {new Date(achat.date_piece).toLocaleDateString()}
                          </td>
                          <td
                            style={{
                              color:
                                achat.statut === "non réglée"
                                  ? "red"
                                  : achat.statut === "partiellement réglée"
                                  ? "#ff7f00 "
                                  : "green",
                            }}
                          >
                            {achat.statut}
                          </td>

                          <td>{achat.montant_total_piece} DT</td>
                          <td>
                            <Link to={`/detailsAchat/${achat.id}`}>
                              <button
                                type="button"
                                className="btn btn-primary ml-2"
                              >
                                Détails
                              </button>
                            </Link>
                            &nbsp;
                            {user.role === "utilisateur" && (
                              <Link to={`/updateAchat/${achat.id}`}>
                                <button
                                  type="button"
                                  className="btn btn-success"
                                >
                                  Modifier
                                </button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <br />
                <div className="d-flex justify-content-center mt-5">
                  <ReactPaginate
                    previousLabel={"← Précédent"}
                    nextLabel={"Suivant →"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination justify-content-center"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achats;
