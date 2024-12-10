import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import ReactPaginate from "react-paginate";

const ReglementsEmis = ({ isSidebarOpen }) => {
  const [reglements, setReglements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
    const fetchReglements = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/reglements_emis", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        console.log(res.data);
        setReglements(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReglements();
  }, [user, selectedClient]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/clients");
        setClients(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClients();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };

  // Filtrer les règlements en fonction du client sélectionné et des critères de recherche
  const filteredReglements = reglements.filter((reglement) => {
    const searchTermLower = searchTerm.toLowerCase();

    // Si aucun client n'est sélectionné, afficher tous les règlements
    const isInClient = !selectedClient || reglement.code_entreprise === selectedClient;

    return (
      isInClient &&
      (new Date(reglement.date_saisie)
        .toLocaleDateString()
        .includes(searchTermLower) ||
      reglement.code_tiers.toLowerCase().includes(searchTermLower) ||
      reglement.tiers_saisie.toLowerCase().includes(searchTermLower) ||
      reglement.montant_brut.toString().includes(searchTermLower) ||
      reglement.taux_retenue_source.toString().includes(searchTermLower) ||
      reglement.montant_net.toString().includes(searchTermLower))
    );
  });

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredReglements.slice(
    offset,
    offset + itemsPerPage
  );
  const pageCount = Math.ceil(filteredReglements.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="font-medium text-center mb-5">Liste des Règlements Émis</h2>
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
                    <Link to="/addReglement">
                      <button type="button" className="btn btn-dark">
                        Ajouter un Règlement Émis
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
                        <option key={client.code_entreprise} value={client.code_entreprise}>
                          {`${client.code_entreprise} - ${client.identite}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <br />
                <div className="table-responsive pt-3">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date de Saisie</th>
                        <th>Code Tiers</th>
                        <th>Montant Brut</th>
                        <th>Taux de la Retenue <br></br>à la Source</th>
                        <th>Montant Net</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((reglement, index) => (
                        <tr key={index}>
                          {user.role === "comptable" && (
                            <td>{reglement.identite}</td>
                          )}
                          <td>{new Date(reglement.date_saisie).toLocaleDateString()}</td>
                          <td>{reglement.code_tiers}</td>
                          <td>{reglement.montant_brut} DT</td>
                          <td>{reglement.taux_retenue_source}%</td>
                          <td>{reglement.montant_net} DT</td>
                          <td>
                            <Link to={`/detailsReglement/${reglement.id}`}>
                              <button type="button" className="btn btn-primary">
                                Détails
                              </button>
                            </Link>
                            &nbsp;
                            {user.role === "utilisateur" && (
                            <Link to={`/updateReglement/${reglement.id}`}>
                              <button type="button" className="btn btn-success">
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

export default ReglementsEmis;
