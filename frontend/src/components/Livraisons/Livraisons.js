import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";

const Livraisons = ({isSidebarOpen}) => {
  const [livraisons, setLivraisons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");


  useEffect(() => {
    const fetchLivraisons = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/livraisons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        console.log(res.data);
        setLivraisons(res.data);
      } catch (err) {
        console.log(err);
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

    fetchLivraisons();
    fetchClients();
  }, [selectedClient]);



  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const filteredLivraisons = livraisons.filter((livraison) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
        !selectedClient || livraison.code_entreprise === selectedClient; // Filtrer par code_entreprise

    return (
        isInClient &&
        (livraison.num_BL.toLowerCase().includes(searchTermLower) ||
            livraison.code_tiers.toLowerCase().includes(searchTermLower) ||
            livraison.tiers_saisie.toLowerCase().includes(searchTermLower) ||
            livraison.reference_commande.toLowerCase().includes(searchTermLower) ||
            new Date(livraison.date_BL)
                .toLocaleDateString()
                .includes(searchTermLower) ||
            livraison.montant_total_BL.toString().includes(searchTermLower))
    );
  });


  const offset = currentPage * itemsPerPage;
  const currentItems = filteredLivraisons.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredLivraisons.length / itemsPerPage);


  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };


  return (
      <div className="main-panel">
        <div className={`content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="titre text-center">Liste des Livraisons</h2>
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
                        <Link to="/addLivraison">
                          <button type="button" className="btn btn-dark ml-2">
                            Ajouter une Livraison
                          </button>
                        </Link>
                    )}{" "}

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
                    <table className="table table-sm">
                      <thead>
                      <tr>
                        {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date du Bon de Livraison</th>
                        <th>N° du Bon de Livraison</th>
                        <th>Code Tiers</th>
                        <th>Reference Commande</th>
                        <th>
                          Montant Total du <br></br>Bon de Livraison
                        </th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((livraison, index) => (
                          <tr key={index}>
                            {user.role === "comptable" && (
                                <td>{livraison.identite}</td>
                            )}
                            <td>
                              {new Date(livraison.date_BL).toLocaleDateString()}
                            </td>
                            <td>{livraison.num_BL}</td>
                            <td>{livraison.code_tiers}</td>
                            <td>{livraison.reference_commande}</td>
                            <td>{livraison.montant_total_BL} DT</td>
                            <td>
                              <Link to={`/detailsLivraison/${livraison.id}`}>
                                <button type="button" className="btn btn-primary">
                                  Détails
                                </button>
                              </Link>
                              &nbsp; &nbsp;
                              {user.role === "utilisateur" && (
                                  <Link to={`/updateLivraison/${livraison.id}`} >
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

export default Livraisons;
