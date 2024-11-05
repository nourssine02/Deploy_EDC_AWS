import React from "react";
import { Link } from "react-router-dom";
import "./Requetes.css"
const ButtonLink = ({ to, label }) => (
    <Link to={to} className="requete-button">
      {label}
    </Link>
);

const Requetes = ({ isSidebarOpen }) => {
  return (
      <div className="main-panel">
        <div className={`content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h2 className="titre text-center">Liste des Requêtes </h2>
                  <br /> <br /> <br />
                  <div className="requete-buttons">
                    <ButtonLink to="/TotalCommandesParPeriode" label="Total Commandes par période"/>
                    <ButtonLink to="/ListeClientsParPeriodeCreation" label="Liste des Clients par période de création"/>
                    <ButtonLink to="/EtatDeFacturation" label="Etat de Facturation"/>
                    <ButtonLink to="/EtatVersementParPeriode" label="Etat de Versement par période"/>
                    <ButtonLink to="/CommandeDetailleesParPeriode" label="Commandes detaillées par période"/>
                    <ButtonLink to="/LivraisonsPrevues" label="Livraisons Prévues"/>
                    <ButtonLink to="/FacturesNonPayee" label="Liste des Factures non payée"/>
                    <ButtonLink to="/CommandesParCodeClient" label="Rechercher Commandes par code client"/>
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
