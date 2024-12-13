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
} from "chart.js";

import { Bar } from "react-chartjs-2";

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
  const [ordersPerPeriod, setOrdersPerPeriod] = useState([]);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          navigate("/");
          return;
        }

        // Récupération des statistiques globales
        const statsResponse = await axios.get("https://comptaonline.line.pm/api/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsResponse.data);

        // Récupération des commandes par période pour l'utilisateur connecté
        const ordersResponse = await axios.get("https://comptaonline.line.pm/api/orders-per-period", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrdersPerPeriod(ordersResponse.data.ordersPerPeriod);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.response?.data?.message || "Erreur lors de la récupération des données.");
      }
    };

    fetchData();
  }, [navigate]);

  // Data for Bar Chart (Statistiques globales)
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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  // Data for Bar Chart (Commandes par période)
  const ordersChartData = {
    labels: ordersPerPeriod.map((order) => order.label),
    datasets: [
      {
        label: "Commandes par période",
        data: ordersPerPeriod.map((order) => order.count),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const ordersChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
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

                  {user && user.role !== "utilisateur" && (
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

                  {/* Bar Chart for Global Stats */}
                  <div className="mt-5">
                    <h4 className="text-center">Statistiques Globales</h4>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>

                  {/* Bar Chart for Orders Per Period */}
                  <div className="mt-5">
                    <h4 className="text-center">Commandes par Période</h4>
                    <Bar data={ordersChartData} options={ordersChartOptions} />
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
