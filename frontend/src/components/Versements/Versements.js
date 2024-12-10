import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Connexion/UserProvider";
import ReactPaginate from "react-paginate";

const Versements = ({isSidebarOpen}) => {
  const [versements, setVersements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");


  useEffect(() => {
    const fetchVersements = async () => {

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/versements", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        setVersements(res.data);
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

    fetchVersements();
    fetchClients();
  }, [selectedClient]);

  const openImageViewer = (documentUrl) => {
    const imageWindow = window.open("", "_blank");
    const img = document.createElement("img");
    img.src = documentUrl;
    img.style.width = "40%";
    img.style.height = "100%";
    img.style.marginLeft = "350px";
    imageWindow.document.body.appendChild(img);
  };



  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const filteredVersements = versements.filter((versement) => {
    const searchTermLower = searchTerm.toLowerCase();
    const isInClient =
        !selectedClient || versement.code_entreprise === selectedClient; // Filtrer par code_entreprise

    return (
        isInClient &&(
            new Date(versement.date_versement)
                .toLocaleDateString()
                .includes(searchTermLower) ||
            versement.reference_bordereau_bulletin.toLowerCase().includes(searchTermLower))

    );
  });

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredVersements.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredVersements.length / itemsPerPage);



  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://comptaonline.linkpc.net/api/versement/${id}`);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting versement:", err);
    }
  };

  const confirmDelete = (id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce versement ?");
    if (confirmDelete) {
      handleDelete(id);
    }
  };

  return (
      <div className="main-panel">
        <div className={`content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="titre text-center">Liste des Versements</h2>
                  <br></br>
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
                    {user.role === "utilisateur" && (
                        <Link to="/addVersement">
                          <button type="button" className="btn btn-dark">
                            Ajouter un Versement
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
                    <table className="table table-sm">
                      <thead>
                      <tr>
                        {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date de Versement</th>
                        <th>Reference Bordereau/Bulletin</th>
                        <th>Document/Fichier à Inserer</th>
                      </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((versement, index) => (
                          <tr key={index}>
                            {user.role === "comptable" && (
                                <td>{versement.identite}</td>
                            )}
                            <td>
                              {versement.date_versement
                                  ? new Date(
                                      versement.date_versement
                                  ).toLocaleDateString()
                                  : ""}
                            </td>
                            <td>{versement.reference_bordereau_bulletin}</td>
                            <td>
                              <button
                                  type="button"
                                  className="btn btn-link"
                                  onClick={() =>
                                      openImageViewer(versement.document_fichier)
                                  }
                              >
                                View Document
                              </button>
                            </td>

                            <td>
                              <Link to={`/detailsVersement/${versement.id}`}>
                                <button type="button" className="btn btn-primary">
                                  Détails
                                </button>
                              </Link>
                              &nbsp; &nbsp;

                              {user.role === "utilisateur" && (
                                  <>
                                    <Link to={`/updateVersement/${versement.id}`}>
                                      <button type="button" className="btn btn-success">
                                        Modifier
                                      </button>
                                    </Link>
                                    &nbsp; &nbsp;

                                    <button
                                        type="button"
                                        className="btn btn-danger mr-2"
                                        onClick={() => confirmDelete(versement.id)}
                                    >
                                      Supprimer
                                    </button>
                                  </>
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

export default Versements;
