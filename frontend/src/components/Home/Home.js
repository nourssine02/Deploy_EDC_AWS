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
} from "chart.js";
import { Bar } from "react-chartjs-2";  // Import Bar chart from react-chartjs-2

// Enregistrer les composants nécessaires pour les graphiques en barres
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

    const fetchOrdersPerPeriod = async () => {
      try {
        // Vérification du rôle utilisateur et récupération des commandes spécifiques
        const response = await axios.get("https://comptaonline.line.pm/api/orders-per-period", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Validation : vérifier si ordersPerPeriod est bien un tableau
        if (response.data && Array.isArray(response.data.ordersPerPeriod)) {
          setOrdersPerPeriod(response.data.ordersPerPeriod);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Erreur de format des données reçues pour les commandes.");
        }
      } catch (error) {
        console.error("Error fetching orders per period:", error);
        setError("Une erreur est survenue lors de la récupération des commandes par période.");
      }
    };

    fetchUserData();
    fetchStatistics();
    if (user?.role === "utilisateur") {
      fetchOrdersPerPeriod(); // Appel des commandes uniquement si l'utilisateur est de type 'utilisateur'
    }
  }, [setUser, navigate, user?.role]);

  // Data for Bar Chart for Stats (comptable)
  const statsChartData = {
    labels: ["Utilisateurs", "Commandes", "Livraisons", "Factures Non Payées"],
    datasets: [
      {
        label: "Statistiques",
        data: [stats.totalUsers, stats.totalOrders, stats.totalDeliveries, stats.unpaidInvoices],
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)",   // Utilisateurs
          "rgba(255, 99, 132, 0.5)",   // Commandes
          "rgba(255, 159, 64, 0.5)",   // Livraisons
          "rgba(153, 102, 255, 0.5)"   // Factures Non Payées
        ],
        borderColor: [
          "#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for Bar Chart for Orders (utilisateur)
  const ordersChartData = {
    labels: Array.isArray(ordersPerPeriod) ? ordersPerPeriod.map(order => order.label) : [],
    datasets: [
      {
        label: "Commandes par Mois",
        data: Array.isArray(ordersPerPeriod) ? ordersPerPeriod.map(order => order.count) : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",  // Mois 1
          "rgba(54, 162, 235, 0.5)",  // Mois 2
          "rgba(75, 192, 192, 0.5)",  // Mois 3
          "rgba(153, 102, 255, 0.5)", // Mois 4
          "rgba(255, 159, 64, 0.5)"   // Mois 5
        ],
        borderColor: [
          "#FF6384", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40"
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options for Orders Chart
  const ordersChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Périodes",
        },
      },
      y: {
        title: {
          display: true,
          text: "Nombre de Commandes",
        },
        beginAtZero: true,
      },
    },
  };

  // Options for Stats Chart
  const statsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: {
          display: false, // Aucun titre pour l'axe X dans les statistiques
        },
      },
      y: {
        title: {
          display: true,
          text: "Nombre", // Titre de l'axe Y pour les statistiques
        },
        beginAtZero: true,
      },
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

                  {user.role === "comptable" && (
                      <>
                        <h4>Statistiques Générales</h4>
                        <div className="mt-5">
                          <Bar data={statsChartData} options={statsChartOptions} />
                        </div>
                      </>
                  )}

                  {user.role === "utilisateur" && (
                      <>
                        <h4>Commandes par Mois</h4>
                        <div className="mt-5">
                          <Bar data={ordersChartData} options={ordersChartOptions} />
                        </div>
                      </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Home;
