import React from "react";
import { Link } from "react-router-dom";

const Requetes = ({ isSidebarOpen }) => {
  return (
    <div className="main-panel">
      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <h2 className="text-center">Liste des Requêtes</h2>
                <br /> <br /> <br />
                <div className="col-md-12 d-flex justify-content-between">
                  <Link to={"/TotalCommandesParPeriode"}>
                    <button type="button" className="btn btn-link">
                      Total Commandes par période
                    </button>
                  </Link>

                  <Link to={"/ListeClientsParPeriodeCreation"}>
                    <button type="button" className="btn btn-link">
                      Liste des Clients par période de création
                    </button>
                  </Link>

                  <Link to={"/EtatDeFacturation"}>
                    <button type="button" className="btn btn-link">
                      Etat de Facturation
                    </button>
                  </Link>
                </div>
                <br />
                <div className="col-md-12 d-flex justify-content-between">
                  <Link to={"/EtatVersementParPeriode"}>
                    <button type="button" className="btn btn-link">
                      Etat de Versement par période
                    </button>
                  </Link>

                  <Link to={"/CommandeDetailleesParPeriode"}>
                    <button type="button" className="btn btn-link">
                      Commandes detaillées Par Période
                    </button>
                  </Link>

                  <Link to={"/LivraisonsPrevues"}>
                    <button type="button" className="btn btn-link">
                      Livraisons Prévues
                    </button>
                  </Link>
                </div>
                <br />
                <div className="col-md-9 d-flex justify-content-between">
                

                  <Link to={"/FacturesNonPayee"}>
                    <button type="button" className="btn btn-link">
                      Liste des Factures non payée
                    </button>
                  </Link>
                  <Link to={"/CommandesParCodeClient"}>
                    <button type="button" className="btn btn-link">
                      Rechercher Commandes par code client
                    </button>
                  </Link>                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requetes;
