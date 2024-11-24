import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import {UserContext} from "./UserProvider";

const Tiers = ({ isSidebarOpen }) => {
  const [tiers, setTiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(4);
  const [banksVisible, setBanksVisible] = useState({}); // To track which tier has banks visible
  const { user } = useContext(UserContext);

  useEffect(() => {

    const fetchTiers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("https://comptaonline.line.pm/api/tiers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTiers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTiers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://comptaonline.line.pm/api/tiers/${id}`);
      setTiers(tiers.filter((tier) => tier.id !== id));
      toast.success("Tier supprimé avec succès");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error(err.response.data.error);
      } else if (err.response && err.response.status === 500) {
        toast.error("Le tier ne peut pas être supprimé car il est associé à d'autres données.");
      } else {
        toast.error("Erreur lors de la suppression du tier.");
      }
      console.error(err);
    }
  };

  const confirmDelete = (id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce Tier ?");
    if (confirmDelete) {
      handleDelete(id);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const filtered = tiers.filter((tier) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
        tier.code_tiers.toLowerCase().includes(searchTermLower) ||
        new Date(tier.date_creation).toLocaleDateString().includes(searchTermLower) ||
        tier.type.toString().includes(searchTermLower) ||
        tier.identite.toString().includes(searchTermLower) ||
        tier["MF/CIN"].toString().includes(searchTermLower) ||
        tier.tel.toString().includes(searchTermLower)
    );
  });

  const offset = currentPage * itemsPerPage;
  const currentItems = filtered.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Toggle banks visibility for a specific tier
  const toggleBanks = async (tierId) => {
    if (banksVisible[tierId]) {
      setBanksVisible({ ...banksVisible, [tierId]: false });
    } else {
      try {
        const res = await axios.get(`https://comptaonline.line.pm/api/tiers/${tierId}/banques`);
        setBanksVisible({
          ...banksVisible,
          [tierId]: res.data, // Store the banks data
        });
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la récupération des banques.");
      }
    }
  };

  return (
      <div className="main-panel">
        <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="titre text-center">Liste des Tiers</h2>
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
                    <Link to="/addTier">
                      <button type="button" className="btn btn-dark ml-2">
                        Ajouter un Tier
                      </button>
                    </Link>
                  </div>
                  <div className="table-responsive pt-4" style={{ overflowX: "unset" }}>
                    <table className="table table-sm table-hover" style={{ fontSize: "12px" }}>
                      <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Code tiers</th>
                        <th style={{ width: "100px" }}>Date de Creation</th>
                        <th style={{ width: "70px" }}>Type</th>
                        <th style={{ width: "120px" }}>Identite</th>
                        <th style={{ width: "90px" }}>MF / CIN</th>
                        <th style={{ width: "100px" }}>Telephone</th>
                        <th style={{ width: "150px" }}>Email</th>
                        <th style={{ width: "150px" }}>Adresse</th>
                        <th style={{ width: "100px" }}></th>
                      </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((tier) => (
                          <React.Fragment key={tier.id}>
                            <tr>
                              <td>{tier.code_tiers}</td>
                              <td>{new Date(tier.date_creation).toLocaleDateString()}</td>
                              <td>{tier.type === "autre" ? tier.autreType : tier.type}</td>
                              <td>{tier.identite}</td>
                              <td>{tier["MF/CIN"]}</td>
                              <td>{tier.tel}</td>
                              <td>{tier.email}</td>
                              <td>{tier.adresse}</td>
                              <td>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    onClick={() => toggleBanks(tier.id)}
                                >
                                  {banksVisible[tier.id] ? "-" : "+"}
                                </button>
                                &nbsp;
                                {user.role === "utilisateur" && (
                                    <>
                                <Link to={`/updateTier/${tier.id}`}>
                                  <button type="button" className="btn btn-success">
                                    Modifier
                                  </button>
                                </Link>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => confirmDelete(tier.id)}
                                >
                                  Supprimer
                                </button>
                                </>
                              )}
                              </td>
                            </tr>
                            {banksVisible[tier.id] && (
                                <tr>
                                  <td colSpan="9">
                                    <div className="bank-list d-flex flex-wrap">
                                      <strong style={{ paddingTop: "15px" }}>Banques :</strong>
                                      {banksVisible[tier.id].map((bank) => (
                                          <div
                                              key={bank.id}
                                              className="bank-item m-2 p-2"
                                              style={{
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                                width: "200px",
                                              }}
                                          >
                                            {bank.name}
                                          </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                            )}
                          </React.Fragment>
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
        <ToastContainer />
      </div>
  );
};

export default Tiers;
