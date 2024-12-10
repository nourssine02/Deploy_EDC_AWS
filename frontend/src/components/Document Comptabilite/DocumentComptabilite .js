import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import ReactPaginate from "react-paginate";

const DocumentComptabilite = ({isSidebarOpen}) => {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");


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
    const fetchDocuments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.linkpc.net/api/documents_comptabilite", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            code_entreprise: selectedClient || undefined, // Ajouter le code_entreprise à la requête
          },
        });
        setDocuments(res.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, [selectedClient]);

  const VoirDocument = (id) => {
    const document = documents.find((doc) => doc.id === id);
    const imageUrl = document && document.document_fichier;
    console.log(imageUrl);

    if (imageUrl) {
      setShowModal(true);
      setModalImageUrl(imageUrl);
    } else {
      console.error("Document image URL not found");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImageUrl("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  
  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
    setCurrentPage(0);
  };


  const filtered = documents.filter((document) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      document.nature.toLowerCase().includes(searchTermLower) ||
      document.designation.toLowerCase().includes(searchTermLower) ||
      document.destinataire.toLowerCase().includes(searchTermLower) ||
      new Date(document.date).toLocaleDateString().includes(searchTermLower) ||
      document.priorite.toLowerCase().includes(searchTermLower) 
    );
  });

  const offset = currentPage * itemsPerPage;
  const currentItems = filtered.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };


  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
      <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="titre text-center">Liste des Documents pour la Comptabilité</h2>
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
                    <Link to="/addDocCompta">
                      <button type="button" className="btn btn-dark">
                        Ajouter un Document
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
                <div className="table-responsive pt-3">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                      {user.role === "comptable" && <th>Ajouté par</th>}
                        <th>Date</th>
                        <th>Nature</th>
                        <th>Désignation</th>
                        <th>Destinataire</th>
                        <th>Priorité</th>
                        <th>Observations</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((doc) => (
                        <tr key={doc.id}>
                          {user.role === "comptable" && (
                            <td>{doc.identite}</td>
                          )}
                          <td>
                          {new Date(doc.date).toLocaleDateString()}
                          </td>
                          
                          <td>{doc.nature}</td>
                          <td>{doc.designation}</td>
                          <td>{doc.destinataire}</td>
                          <td>{doc.priorite}</td>
                          <td>{doc.observations}</td>
                          <td>
                          {user.role !== "comptable" && (

                            <Link to={`/updateDocCompta/${doc.id}`}>
                              <button className="btn btn-success">Modifier</button>
                            </Link>
                          )}
                            <button className="btn btn-danger ml-2" onClick={() => VoirDocument(doc.id)}>
                              Voir Document
                            </button>
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

      {showModal && (
        <div className="modal" style={{ display: "block" , marginTop: "-30px"}}>
          <div className="modal-dialog modal-ms">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Document</h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
                <img src={modalImageUrl} alt="Document" style={{ width: "100%", height : "100%" }} />
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentComptabilite;
