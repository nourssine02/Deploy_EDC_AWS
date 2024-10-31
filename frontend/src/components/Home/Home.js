import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

// Register the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Home({ isSidebarOpen }) {
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalDeliveries: 0,
    unpaidInvoices: 0,
  });
  
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          navigate("/");
          return;
        }

        const response = await axios.get("https://comptaonline.line.pm/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        setError("Erreur lors de la récupération des données");
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get("https://comptaonline.line.pm/api/statistics");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics", error);
        setError("Une erreur est survenue lors de la récupération des statistiques.");
      }
    };

    fetchUserData();
    fetchStatistics();
  }, [setUser, navigate, setError]);

  // Data for Bar Chart
  const barChartData = {
    labels: ["Utilisateurs", "Commandes", "Livraisons", "Factures Non Payées"],
    datasets: [
      {
        label: "Statistiques",
        data: [stats.totalUsers, stats.totalOrders, stats.totalDeliveries, stats.unpaidInvoices],
        backgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0", "#FF6384"],
      },
    ],
  };


  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="text-center mb-5">Dashboard</h2>
                <br />
                {error && <p style={{ color: "red" }}>{error}</p>}

                {user.role !== "utilisateur" && (
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <h4>Total Utilisateurs</h4>
                      <p>{stats.totalUsers}</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <h4>Total Commandes</h4>
                      <p>{stats.totalOrders}</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <h4>Total Livraisons</h4>
                      <p>{stats.totalDeliveries}</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <h4>Factures Non Payées</h4>
                      <p>{stats.unpaidInvoices}</p>
                    </div>
                  </div>
                </div>
                )}


                {/* Bar Chart for Stats */}
                <div className="mt-5">
                  <h3 className="text-center">Graphique des Statistiques</h3>
                  <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: true }}}} />
                </div>
               
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
