import axios from "axios";
import React, { useEffect, useState } from "react";

const Configurations = ({ isSidebarOpen }) => {
  const [taxRates, setTaxRates] = useState([]);
  const [newRate, setNewRate] = useState("");
  const [editingRate, setEditingRate] = useState(null);
  const [updatedRate, setUpdatedRate] = useState("");

  const [banks, setBanks] = useState([]);
  const [newBank, setNewBank] = useState("");
  const [editingBank, setEditingBank] = useState(null);
  const [updatedBank, setUpdatedBank] = useState("");

  // Fetch Tax Rates
  const fetchTaxRates = async () => {
    try {
      const response = await axios.get(
        "https://comptaonline.linkpc.net/api/taux_retenue_source"
      );
      setTaxRates(response.data);
    } catch (error) {
      console.error("Error fetching tax rates:", error);
    }
  };

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const addTaxRate = async () => {
    try {
      await axios.post("https://comptaonline.linkpc.net/api/taux_retenue_source", {
        taux: newRate,
      });
      setNewRate("");
      fetchTaxRates();
    } catch (error) {
      console.error("Error adding tax rate:", error);
    }
  };

  const modifTaxRate = async (id) => {
    try {
      await axios.put(`https://comptaonline.linkpc.net/api/taux_retenue_source/modif/${id}`, {
        taux: updatedRate,
      });
      setEditingRate(null);
      setUpdatedRate("");
      fetchTaxRates();
    } catch (error) {
      console.error("Error modifying tax rate:", error);
    }
  };

  const toggleTaxRate = async (id, active) => {
    try {
      await axios.put(`https://comptaonline.linkpc.net/api/taux_retenue_source/${id}`, {
        active: !active,
      });
      fetchTaxRates();
    } catch (error) {
      console.error("Error toggling tax rate:", error);
    }
  };

  const cancelEditRate = () => {
    setEditingRate(null);
    setUpdatedRate("");
  };

  const handleDeleteRate = async (id) => {
    try {
      await axios.delete(`https://comptaonline.linkpc.net/api/taux_retenue_source/${id}`);
      fetchTaxRates(); // Rafraîchir la liste après suppression
    } catch (err) {
      console.error("Error deleting tax rate:", err);
    }
  };

  const confirmDeleteRate = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce Taux ?")) {
      handleDeleteRate(id);
    }
  };

  // Fetch Banks
  const fetchBanks = async () => {
    try {
      const response = await axios.get("https://comptaonline.linkpc.net/api/banques");
      setBanks(response.data);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const addBank = async () => {
    try {
      await axios.post("https://comptaonline.linkpc.net/api/banques", {
        bank: newBank,
      });
      setNewBank("");
      fetchBanks();
    } catch (error) {
      console.error("Error adding bank:", error);
    }
  };

  const modifBank = async (id) => {
    try {
      await axios.put(`https://comptaonline.linkpc.net/api/banques/modif/${id}`, {
        bank: updatedBank,
      });
      setEditingBank(null);
      setUpdatedBank("");
      fetchBanks();
    } catch (error) {
      console.error("Error modifying bank:", error);
    }
  };

  const toggleBank = async (id, active) => {
    try {
      await axios.put(`https://comptaonline.linkpc.net/api/banques/${id}`, {
        active: !active,
      });
      fetchBanks();
    } catch (error) {
      console.error("Error toggling Bank:", error);
    }
  };

  const cancelEditBank = () => {
    setEditingBank(null);
    setUpdatedBank("");
  };

  const handleDeleteBank = async (id) => {
    try {
      await axios.delete(`https://comptaonline.linkpc.net/api/banques/${id}`);
      fetchBanks(); // Rafraîchir la liste après suppression
    } catch (err) {
      console.error("Error deleting bank:", err);
    }
  };

  const confirmDeleteBank = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette Banque ?")) {
      handleDeleteBank(id);
    }
  };

  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h1 className="text-center">Configurations</h1>
                <br />
                {/* Tax Rates Section */}
                <h3 style={{ textDecorationLine: "underline", color: "green" }}>
                  - Taux de la Retenue à la Source
                </h3>
                <div className="col-md-4">
                  <input
                    type="text"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="form-control mb-3 mt-3"
                    placeholder="Taux de la retenue à la source"
                  />
                  <button onClick={addTaxRate} className="btn btn-info mb-5">
                    Ajouter
                  </button>
                </div>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Taux</th>
                      <th>Actif</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRates.map((rate) => (
                      <tr key={rate.id}>
                        <td>
                          {editingRate === rate.id ? (
                            <input
                              type="text"
                              value={updatedRate}
                              onChange={(e) => setUpdatedRate(e.target.value)}
                              className="form-control-sm"
                            />
                          ) : (
                            `${rate.taux}%`
                          )}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={rate.active}
                            onChange={() => toggleTaxRate(rate.id, rate.active)}
                            className="form-check-input"
                          />
                          {rate.active ? "Oui" : "Non"}
                        </td>
                        <td>
                          {editingRate === rate.id ? (
                            <>
                              <button
                                onClick={() => modifTaxRate(rate.id)}
                                className="btn btn-success btn-sm"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={cancelEditRate}
                                className="btn btn-light btn-sm"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingRate(rate.id);
                                  setUpdatedRate(rate.taux);
                                }}
                                className="btn btn-warning btn-sm mr-2"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => confirmDeleteRate(rate.id)}
                                className="btn btn-danger btn-sm"
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
                <br></br> <br></br>
                <hr />
                <br></br> <br></br>
                {/* Banks Section */}
                <h3 style={{ textDecorationLine: "underline", color: "green" }}>
                  - Nom des Banques
                </h3>
                <div className="col-md-4">
                  <input
                    type="text"
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="form-control mb-3 mt-3"
                    placeholder="Nom des banques"
                  />
                  <button onClick={addBank} className="btn btn-info mb-5">
                    Ajouter
                  </button>
                </div>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Actif</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banks.map((bank) => (
                      <tr key={bank.id}>
                        <td>
                          {editingBank === bank.id ? (
                            <input
                              type="text"
                              value={updatedBank}
                              onChange={(e) => setUpdatedBank(e.target.value)}
                              className="form-control-sm"
                            />
                          ) : (
                            bank.name
                          )}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={bank.active}
                            onChange={() => toggleBank(bank.id, bank.active)}
                            className="form-check-input"
                          />
                          {bank.active ? "Oui" : "Non"}
                        </td>

                        <td>
                          {editingBank === bank.id ? (
                            <>
                              <button
                                onClick={() => modifBank(bank.id)}
                                className="btn btn-success btn-sm"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={cancelEditBank}
                                className="btn btn-light btn-sm"
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingBank(bank.id);
                                  setUpdatedBank(bank.name);
                                }}
                                className="btn btn-warning btn-sm mr-2"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => confirmDeleteBank(bank.id)}
                                className="btn btn-danger btn-sm"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configurations;
