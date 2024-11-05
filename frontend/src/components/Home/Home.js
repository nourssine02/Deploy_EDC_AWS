import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Connexion/UserProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend);

function Home({ isSidebarOpen }) {
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalDeliveries: 0,
    unpaidInvoices: 0,
    monthlyOrders: [], // Ajouté pour les commandes par mois
    adminUsers: 0,
    standardUsers: 0,
    managerUsers: 0, // Ajouté pour les rôles utilisateur
  });

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("https://comptaonline.line.pm/api/statistics");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics", error);
        setError("Une erreur est survenue lors de la récupération des statistiques.");
      }
    };

    fetchStatistics();
  }, [setUser, navigate, setError]);

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

  const monthlyOrdersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Commandes par mois",
        data: stats.monthlyOrders,
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const userRolesData = {
    labels: ["Administrateurs", "Utilisateurs", "Comptables"],
    datasets: [
      {
        label: "Répartition des rôles",
        data: [stats.adminUsers, stats.standardUsers, stats.managerUsers],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
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
                  {error && <p style={{ color: "red" }}>{error}</p>}

                  <div className="mt-5">
                    <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: true }}}} />
                  </div>

                  <div className="mt-5">
                    <Line data={monthlyOrdersData} options={{ responsive: true, plugins: { legend: { display: true }}}} />
                  </div>

                  <div className="mt-5">
                    <Doughnut data={userRolesData} options={{ responsive: true, plugins: { legend: { display: true }}}} />
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
