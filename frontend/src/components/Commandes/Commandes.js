import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";

const Commandes = ({isSidebarOpen}) => {
  const [commandes, setCommandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");


  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }
        const res = await axios.get("https://comptaonline.line.pm/api/commandes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        console.log(res.data);
        setCommandes(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await axios.get("https://comptaonline.line.pm/api/clients");
        setClients(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCommandes();
    fetchClients();
  }, [selectedClient]);

  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };


  const filteredCommandes = commandes.filter((commande) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
      !selectedClient || commande.code_entreprise === selectedClient; // Filtrer par code_entreprise
  
    return (
      isInClient &&
    (commande.num_commande.toLowerCase().includes(searchTermLower) ||
      commande.code_tiers.toLowerCase().includes(searchTermLower) ||
      new Date(commande.date_commande)
        .toLocaleDateString()
        .includes(searchTermLower) ||
      commande.tiers_saisie.toLowerCase().includes(searchTermLower) ||
      commande.montant_commande.toString().includes(searchTermLower))
    );
  });
  

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredCommandes.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredCommandes.length / itemsPerPage);


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
                <h2 className="titre text-center">Liste des Commandes</h2>
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
                    <Link to="/addCommande">
                      <button type="button" className="btn btn-dark ml-2">
                        Ajouter une Commande
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
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                      {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date de la commande</th>
                        <th>N° de la commande</th>
                        <th>Code Tiers</th>
                        <th>Montant de la Commande</th>
                        <th>Date de livraison <br></br>prevue</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((commande, index) => (
                        <tr key={index}>
                          {user.role === "comptable" && (
                            <td>{commande.identite}</td>
                          )}
                          <td>
                            {new Date(
                              commande.date_commande
                            ).toLocaleDateString()}
                          </td>
                          <td>{commande.num_commande}</td>
                          <td>{commande.code_tiers}</td>
                          <td>{commande.montant_commande} DT</td>
                          <td>
                            {new Date(
                              commande.date_livraison_prevue
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            <Link to={`/detailsCommande/${commande.id}`}>
                              <button type="button" className="btn btn-primary">
                                Détails
                              </button>
                            </Link>
                            &nbsp; &nbsp;
                            <Link to={`/updateCommande/${commande.id}`}>
                              <button type="button" className="btn btn-success">
                                Modifier
                              </button>
                            </Link>
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

export default Commandes;
