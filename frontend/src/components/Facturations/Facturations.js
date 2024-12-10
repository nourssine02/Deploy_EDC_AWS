import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";

const Facturations = ({ isSidebarOpen }) => {
  const [factures, setFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  useEffect(() => {
    const fetchFactures = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/facturations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        setFactures(res.data);
      } catch (err) {
        console.error("Error fetching factures:", err);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/clients");
        setClients(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFactures();
    fetchClients();
    
  }, [selectedClient]);

  const handlePaymentStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.put(`https://comptaonline.linkpc.net/api/facture/${id}/etat_payement`, {
        etat_payement: newStatus,
      });
      setFactures((prevFactures) =>
        prevFactures.map((facture) =>
          facture.id === id ? { ...facture, etat_payement: newStatus } : facture
        )
      );
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const filteredFactures = factures.filter((facture) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
    !selectedClient || facture.code_entreprise === selectedClient; // Filtrer par code_entreprise

  return (
    isInClient &&
      (facture.num_facture.toLowerCase().includes(searchTermLower) ||
      facture.code_tiers.toLowerCase().includes(searchTermLower) ||
      new Date(facture.date_facture).toLocaleDateString().includes(searchTermLower) ||
      facture.reference_livraison.toString().includes(searchTermLower) ||
      facture.montant_total_facture.toString().includes(searchTermLower))
    );
  });


  const offset = currentPage * itemsPerPage;
  const currentItems = filteredFactures.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredFactures.length / itemsPerPage);


  
  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };


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
                <h2 className="titre text-center">Liste des Facturations</h2>
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
                  {user?.role === "utilisateur" && (
                    <Link to="/addFacture">
                      <button type="button" className="btn btn-dark">
                        Ajouter une Facture
                      </button>
                    </Link>
                  )}

                   {user.role === "comptable" && (
                    <select
                      className="form-control form-control-ms w-auto mx-2"
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

                <div className="table-responsive pt-3">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                      {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date de la Facture</th>
                        <th>N° de la Facture</th>
                        <th>Code Tiers</th>
                        <th>Référence de la Livraison</th>
                        <th>
                          Montant Total de<br />la Facture
                        </th>
                        <th>État de Paiement</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((facture) => (
                        <tr key={facture.id}>
                          {user.role === "comptable" && (
                            <td>{facture.identite}</td>
                          )}
                          <td>{new Date(facture.date_facture).toLocaleDateString()}</td>
                          <td>{facture.num_facture}</td>
                          <td>{facture.code_tiers}</td>
                          <td>{facture.reference_livraison}</td>
                          <td>{facture.montant_total_facture} DT</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={facture.etat_payement}
                              onChange={() =>
                                handlePaymentStatusChange(
                                  facture.id,
                                  facture.etat_payement
                                )
                              }
                            />
                            <span
                              style={{
                                color: facture.etat_payement ? "green" : "red",
                                fontWeight: "bold",
                              }}
                            >
                              {facture.etat_payement ? " Payée" : " Non Payée"}
                            </span>
                          </td>
                          <td>
                            <Link to={`/detailsFacture/${facture.id}`}>
                              <button type="button" className="btn btn-primary">
                                Détails
                              </button>
                            </Link>
                            &nbsp;&nbsp;
                            {user?.role === "utilisateur" && (
                              <Link to={`/updateFacture/${facture.id}`}>
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

export default Facturations;
