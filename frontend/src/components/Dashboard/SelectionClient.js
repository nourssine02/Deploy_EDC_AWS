import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";

function SelectionClient({ setShowModal }) {
  const [setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser, setSelectedClient } = useContext(UserContext);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          navigate("/");
          return;
        }

        const response = await axios.get("https://comptaonline.linkpc.net/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        setError("Erreur lors de la récupération des données");
      }
    };

    fetchUserData();
  }, [setUser, navigate, setError]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`https://comptaonline.linkpc.net/api/clients`);
        setClients(res.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    if (user?.id) {
      fetchClients();
    }
  }, [user]);

  const handleClientSelect = (event) => {
    const clientId = event.target.value;
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client);
    setShowModal(false);
    navigate("/achats"); // Naviguer vers /achats après la sélection du client
  };

  return (
    <div className="modal" tabIndex="-1" role="dialog" style={{ display: "block" }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Veuillez sélectionner un client</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group">
                <label htmlFor="clientSelect">Clients</label>
                <select className="form-control" id="clientSelect" onChange={handleClientSelect}>
                  <option value="">Sélectionnez un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} style={{ color: "black" }}>
                      {client.identite}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectionClient;
