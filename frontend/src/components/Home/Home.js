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
import { Bar } from "react-chartjs-2"; // Import Bar chart from react-chartjs-2

// Register the necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Home({ isSidebarOpen }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

        const response = await axios.get("https://comptaonline.linkpc.net/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur :", error);
        setError("Erreur lors de la récupération des données utilisateur.");
      }
    };

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://comptaonline.linkpc.net/api/statistics");
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
        setError("Une erreur est survenue lors de la récupération des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    const fetchOrdersPerPeriod = async () => {
      try {
        setLoading(true);

        // Récupérer le token d'authentification
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token d'authentification non trouvé. Veuillez vous reconnecter.");
          navigate("/");
          return;
        }

        // Requête pour récupérer les commandes par période
        const response = await axios.get(
            "https://comptaonline.linkpc.net/api/orders-per-period",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        // Vérifier et transformer les données reçues
        if (response.data && Array.isArray(response.data.ordersPerPeriod)) {
          setOrdersPerPeriod(response.data.ordersPerPeriod);
        } else {
          console.error("Format inattendu des données reçues :", response.data);
          setError("Erreur de format des données reçues pour les commandes.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes par période :", error);
        setError("Une erreur est survenue lors de la récupération des commandes par période.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchStatistics();
    fetchOrdersPerPeriod();
  }, [setUser, navigate]);

  // Data for Bar Chart for Stats (comptable)
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

  // Data for Bar Chart for Orders (utilisateur)
  const ordersChartData = {
    labels: ordersPerPeriod.map(order => order.label),
    datasets: [
      {
        label: "Commandes par Mois",
        data: ordersPerPeriod.map(order => order.count),
        backgroundColor: ordersPerPeriod.map(
            (_, idx) =>
                `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
                    Math.random() * 255
                )}, 0.5)`
        ),
        borderColor: ordersPerPeriod.map(
            (_, idx) =>
                `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
                    Math.random() * 255
                )}, 1)`
        ),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: "Périodes" },
      },
      y: {
        title: { display: true, text: "Nombre de Commandes" },
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
                  {loading && <p>Chargement des données...</p>}

                  {user.role === "comptable" && (
                      <>
                        <h4>Statistiques Générales</h4>
                        <div className="mt-5">
                          <Bar data={statsChartData} options={chartOptions} />
                        </div>
                      </>
                  )}

                  {user.role === "utilisateur" && (
                      <>
                        <h4>Commandes par Mois</h4>
                        <div className="mt-5">
                          {ordersPerPeriod.length > 0 ? (
                              <Bar data={ordersChartData} options={chartOptions} />
                          ) : (
                              <p>Aucune commande trouvée pour cette période.</p>
                          )}
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
