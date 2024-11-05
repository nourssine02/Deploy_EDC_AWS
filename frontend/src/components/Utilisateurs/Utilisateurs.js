import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import "./Toggle.css";

const Utilisateurs = ({ isSidebarOpen }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/utilisateurs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await axios.delete("http://localhost:5000/users/" + id);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const confirmDelete = (id) => {
    const confirmDelete = window.confirm(
        "Voulez-vous vraiment supprimer ce utilisateur  ?"
    );
    if (confirmDelete) {
      handleDelete(id);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Filter users based on search term and roles
  const filtered = users
      .filter((u) => {
        // Exclude "super_admin" users unless the logged-in user is also a "super_admin"
        if (u.role === "super_admin" && user.role !== "super_admin") {
          return false;
        }
        const searchTermLower = searchTerm.toLowerCase();
        return (
            u.code_user.toLowerCase().includes(searchTermLower) ||
            u.identite.toString().includes(searchTermLower) ||
            u.position.toString().includes(searchTermLower) ||
            u.tel.toString().includes(searchTermLower) ||
            u.email.toString().includes(searchTermLower)
        );
      });

  const offset = currentPage * itemsPerPage;
  const currentItems = filtered.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.put(`http://localhost:5000/users/${userId}/status`, {
        isActive: updatedStatus,
      });
      setUsers((prevUsers) =>
          prevUsers.map((user) =>
              user.id === userId ? { ...user, isActive: updatedStatus } : user
          )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
      <div className="main-panel">
        <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="titre text-center">Liste des Utilisateurs</h2>
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
                    {user.role !== "utilisateur" && (
                        <Link to="/addUser">
                          <button type="button" className="btn btn-dark ml-2">
                            Ajouter un Utilisateur
                          </button>
                        </Link>
                    )}
                  </div>

                  <div className="table-responsive pt-3">
                    <table className="table table-sm">
                      <thead>
                      <tr>
                        <th>Code Utilisateur</th>
                        <th>Code_entreprise</th>
                        <th>Identite</th>
                        <th>Role</th>
                        <th>Position</th>
                        <th>Telephone</th>
                        <th>Email</th>
                        {user.role !== "utilisateur" && <th>Active</th>}
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((currentUser) => (
                          <tr key={currentUser.id}>
                            <td>{currentUser.code_user}</td>
                            <td>{currentUser.code_entreprise || "___________"}</td>
                            <td>{currentUser.identite}</td>
                            <td>{currentUser.role}</td>
                            <td>{currentUser.position}</td>
                            <td>{currentUser.tel}</td>
                            <td>{currentUser.email}</td>
                            <td>
                              {currentUser.role === "utilisateur" &&
                                  user.role === "comptable" && (
                                      <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={currentUser.isActive}
                                            onChange={() =>
                                                handleToggleStatus(
                                                    currentUser.id,
                                                    currentUser.isActive
                                                )
                                            }
                                        />
                                        <span className="slider round"></span>
                                      </label>
                                  )}
                            </td>
                            <td>
                              <Link to={`/updateUser/${currentUser.id}`}>
                                <button type="button" className="btn btn-success">
                                  Modifier
                                </button>
                              </Link>
                              &nbsp;
                              <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => confirmDelete(currentUser.id)}
                              >
                                Supprimer
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
      </div>
  );
};

export default Utilisateurs;
