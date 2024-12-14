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
import { Bar } from "react-chartjs-2";

// Enregistrement des composants de Chart.js
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

  // Fonction pour récupérer les données utilisateur
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
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error("Format inattendu des données utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error.message);
      setError("Erreur lors de la récupération des données utilisateur");
    }
  };

  // Fonction pour récupérer les statistiques (comptable)
  const fetchStatistics = async () => {
    try {
      const response = await axios.get("https://comptaonline.linkpc.net/api/statistics", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        setStats(response.data);
      } else {
        throw new Error("Format inattendu des statistiques");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error.message);
      setError("Erreur lors de la récupération des statistiques");
    }
  };

  // Fonction pour récupérer les commandes par période (utilisateur)
  const fetchOrdersPerPeriod = async () => {
    try {
      if (user?.role === "utilisateur") {
        const response = await axios.get(
            `https://comptaonline.linkpc.net/api/orders-per-period/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
        );
        console.log("Réponse brute de l'API:", response.data);  // Vérification des données

        if (
            response.headers["content-type"].includes("application/json") &&
            Array.isArray(response.data.data)
        ) {
          setOrdersPerPeriod(response.data.data);
        } else {
          throw new Error("Format inattendu des données pour les commandes");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes par période:", error.message);
      setError("Erreur lors de la récupération des commandes par période");
    }
  };

  // Appels à l'API lors du chargement du composant
  useEffect(() => {
    fetchUserData();
    if (user?.role === "comptable") {
      fetchStatistics();
    }

    if (user?.role === "utilisateur") {
      fetchOrdersPerPeriod();
    }
  }, [user]);

  // Données pour le graphique des statistiques (comptable)
  const statsChartData = {
    labels: ["Utilisateurs", "Commandes", "Livraisons", "Factures Non Payées"],
    datasets: [
      {
        label: "Statistiques",
        data: [stats.totalUsers, stats.totalOrders, stats.totalDeliveries, stats.unpaidInvoices],
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)", // Utilisateurs
          "rgba(255, 99, 132, 0.5)", // Commandes
          "rgba(255, 159, 64, 0.5)", // Livraisons
          "rgba(153, 102, 255, 0.5)", // Factures Non Payées
        ],
        borderColor: ["#36A2EB", "#FF6384", "#FF9F40", "#9966FF"],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique des commandes par période (utilisateur)
  const ordersChartData = {
    labels: ordersPerPeriod.map((order) => order.period),  // Utilise 'period' comme étiquette
    datasets: [
      {
        label: "Commandes par Mois",
        data: ordersPerPeriod.map((order) => order.count),  // Utilise 'count' comme valeurs
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "#4BC0C0",
        borderWidth: 1,
      },
    ],
  };

  // Options des graphiques
  const chartOptions = {
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
          text: "Nombre",
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
                  {error && <p style={{ color: "red" }}>{error}</p>}

                  {/* Affichage des statistiques pour le rôle 'comptable' */}
                  {user?.role === "comptable" && (
                      <>
                        <h4>Statistiques Générales</h4>
                        <div className="mt-5">
                          <Bar data={statsChartData} options={chartOptions} />
                        </div>
                      </>
                  )}

                  {/* Affichage des commandes par mois pour le rôle 'utilisateur' */}
                  {user?.role === "utilisateur" && (
                      <>
                        <h4>Commandes par Mois</h4>
                        <div className="mt-5">
                          <Bar data={ordersChartData} options={chartOptions} />
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
