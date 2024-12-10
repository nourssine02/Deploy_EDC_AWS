import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UploadFile from "./UploadFile";
import { UserContext } from "../Connexion/UserProvider";
import "jspdf-autotable";
import ReactPaginate from "react-paginate";

const FichePaie = ({ isSidebarOpen }) => {
  const [fiches, setFiches] = useState([]);
  const [detailsVisible, setDetailsVisible] = useState({});
  const { user } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedFiches, setSelectedFiches] = useState([]);
  const [error, setError] = useState("");


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

  useEffect(() => {
    const fetchFiches = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/pointage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined,
          },
        });
        setFiches(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("Jeton invalide, redirection vers la page de connexion.");
          window.location.href = "/";
        } else {
          setError("Erreur lors de la récupération des fiches de paie.");
          console.error("Erreur lors de la récupération des fiches de paie", err);
        }
      }
    };
  
    fetchFiches();
  }, [selectedClient]); // Only include selectedClient as a dependency
  

   // Handle checkbox selection
   const handleSelectFiche = (id) => {
    setSelectedFiches((prevSelectedFiches) => {
      if (prevSelectedFiches.includes(id)) {
        return prevSelectedFiches.filter((ficheId) => ficheId !== id);
      } else {
        return [...prevSelectedFiches, id];
      }
    });
  };

   // Handle "Select All" checkbox
   const handleSelectAll = () => {
    if (selectedFiches.length === currentItems.length) {
      setSelectedFiches([]); // Deselect all if all are selected
    } else {
      setSelectedFiches(currentItems.map((fiche) => fiche.id)); // Select all visible items
    }
  };


   // Handle deletion of selected fiches
   const handleDeleteSelected = async () => {
    try {
      await axios.delete("https://comptaonline.linkpc.net/api/pointage", {
        data: { ids: selectedFiches }, // Send selected IDs to be deleted
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFiches((prevFiches) => prevFiches.filter((fiche) => !selectedFiches.includes(fiche.id)));
      setSelectedFiches([]); // Reset selected items
    } catch (err) {
      console.log(err);
    }
  };

  // Filter fiches by search term and selected client
  const filteredFiches = fiches.filter((fiche) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
      !selectedClient || fiche.code_entreprise === selectedClient;

    return (
      isInClient &&
      (fiche["CODE TIERS"].toLowerCase().includes(searchTermLower) ||
        fiche["NBRES DE JOURS OU D'H TRAVAILLES"]
          .toString()
          .includes(searchTermLower) ||
        fiche["NBRES DE JOURS OU D'H SUPP."]
          .toString()
          .includes(searchTermLower) ||
        fiche["IDENTITE DU TIERS"].toLowerCase().includes(searchTermLower) ||
        fiche["TYPE DE PAIE"].toLowerCase().includes(searchTermLower))
    );
  });

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredFiches.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredFiches.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const toggleDetails = (ficheId) => {
    setDetailsVisible((prevDetailsVisible) => ({
      ...prevDetailsVisible,
      [ficheId]: !prevDetailsVisible[ficheId],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="card">
          <div className="card-body">
            <h2 className="text-center mb-5">Table du Pointage Personnel</h2>
            <br />
            <div className="d-flex justify-content-between align-items-center mb-5">
              {/* Search and client selection components */}
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
              {user.role === "utilisateur" && <UploadFile />}
              {user.role === "comptable" && (
                <select
                  className="form-control w-auto mx-2"
                  style={{ color: "black" }}
                  value={selectedClient}
                  onChange={handleClientChange}
                >
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
  
            <button
              className="btn btn-danger mb-3 btn-sm"
              onClick={handleDeleteSelected}
              disabled={selectedFiches.length === 0}
            >
              <i className="fas fa-trash-alt"></i> Supprimer sélectionnés
            </button>
  
            {/* Table and pagination */}
            <div className="table-responsive table-sm pt-3">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedFiches.length === currentItems.length && currentItems.length > 0}
                      />
                    </th>
                    <th>Code Tiers</th>
                    <th>Identité du Tiers</th>
                    <th>Type de Paie</th>
                    <th>Jours/H Travaillés</th>
                    <th>Jours/H Supp</th>
                    <th>Jours/H d'Absence</th>
                    <th>Congé Annuel</th>
                    <th>Autres Congés</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((fiche) => (
                    <React.Fragment key={fiche.id}>
                      <tr>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedFiches.includes(fiche.id)}
                            onChange={() => handleSelectFiche(fiche.id)}
                          />
                        </td>
                        <td>{fiche["CODE TIERS"]}</td>
                        <td>{fiche["IDENTITE DU TIERS"]}</td>
                        <td>{fiche["TYPE DE PAIE"]}</td>
                        <td>{fiche["NBRES DE JOURS OU D'H TRAVAILLES"]}</td>
                        <td>{fiche["NBRES DE JOURS OU D'H SUPP."]}</td>
                        <td>{fiche["NBRES DE JOURS OU D'H D'ABSENCE"]}</td>
                        <td>{fiche["NBRES DE JOURS OU D'H DE CONGE ANNUEL"]}</td>
                        <td>{fiche["NBRES DE JOURS OU D'H AUTRES CONGES"]}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => toggleDetails(fiche.id)}
                          >
                            {detailsVisible[fiche.id] ? "-" : "+"}
                          </button>
                        </td>
                      </tr>
                      {detailsVisible[fiche.id] && (
                        <tr>
                          <td colSpan="9">
                            <div className="details-section mt-3" style={{ display: "flex", flexDirection: "row", marginBottom: "10px" }}>
                              <div style={{ marginLeft: "10px" }}>
                                <strong>Supplement Reçu:</strong>{" "}
                                {fiche["SUPPLEMENT RECU"]}
                              </div>
                              <div style={{ marginLeft: "10px" }}>
                                <strong>Avances sur Salaires:</strong>{" "}
                                {fiche["AVANCES SUR SALAIRES"]}
                              </div>
                              <div style={{ marginLeft: "10px" }}>
                                <strong>Remboursement de Prets:</strong>{" "}
                                {fiche["REMBOURSEMENTS DE PRÊTS"]}
                              </div>
                              <div style={{ marginLeft: "10px" }}>
                                <strong>Autres Déductions:</strong>{" "}
                                {fiche["AUTRES DEDUCTIONS"]}
                              </div>
                              <div style={{ marginLeft: "10px" }}>
                                <strong>Observations:</strong> {fiche["OBSERVATIONS"]}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
  
              {/* Pagination */}
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
  );
  
};

export default FichePaie;
