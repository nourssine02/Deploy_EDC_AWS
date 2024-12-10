import React, { useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { UserContext } from "../Connexion/UserProvider";

const UploadFile = () => {
  const { user } = useContext(UserContext);

  const [file, setFile] = useState(null);

  // Colonnes attendues dans le fichier CSV
  const expectedColumns = ["CODE TIERS","IDENTITE DU TIERS","TYPE DE PAIE","NBRES DE JOURS OU D'H TRAVAILLES","NBRES DE JOURS OU D'H SUPP.","NBRES DE JOURS OU D'H D'ABSENCE","NBRES DE JOURS OU D'H DE CONGE ANNUEL","NBRES DE JOURS OU D'H AUTRES CONGES","SUPPLEMENT RECU","AVANCES SUR SALAIRES","REMBOURSEMENTS DE PRÊTS","AUTRES DEDUCTIONS","OBSERVATIONS"];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log("File : ",e.target.files[0]);
  };

 

// Valider les colonnes du fichier Excel

const validateExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const fileData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (fileData.length > 0) {
        const fileColumns = fileData[0];

        // Vérification des colonnes
        let errors = [];
        expectedColumns.forEach((col, index) => {
          if (col.trim() !== fileColumns[index]?.trim()) {
            errors.push(`La colonne "${col}" attendue à l'index ${index + 1}, mais trouvée: "${fileColumns[index]?.trim() || "vide"}"`);
          }
        });

        if (errors.length > 0) {
          console.log("Erreurs trouvées : ", errors);
          resolve({ isValid: false, errors });
        } else {
          resolve({ isValid: true });
        }
      } else {
        resolve({ isValid: false, errors: ["Fichier vide"] });
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

const handleUpload = async () => {
  if (!file) {
    Swal.fire("Erreur", "Veuillez sélectionner un fichier", "error");
    return;
  }

  const result = await validateExcel(file); // Utiliser la validation pour Excel

  if (!result.isValid) {
    Swal.fire({
      icon: 'error',
      title: 'Format de fichier incorrect',
      footer: '<a href="/FICHIER_DE_POINTAGE.xlsx" download>Télécharger un exemple de fichier Excel</a>'
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    await axios.post("https://comptaonline.linkpc.net/api/pointage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}` 
      },
    });
    if (user.role === "comptable") {
      // Ajouter une notification
      const notificationMessage = `${user.identite} a ajouté un nouveau achat`;

      const notificationData = {
        userId: user.id,
        message: notificationMessage,
      };

      await axios.post(
        "https://comptaonline.linkpc.net/api/notifications",
        notificationData
      );
    }
    Swal.fire("Succès", "Fichier importé avec succès", "success");
    window.location.reload(); 
  } catch (error) {
    console.error("Error uploading file:", error);
    Swal.fire("Erreur", "Échec de l'importation du fichier", "error");
  }
};

 
  return (
    <>
      <div className="input-group" style={{ maxWidth: "500px" }}>
        <input
          type="file"
          onChange={handleFileChange}
          className="form-control mr-4"
        />
        <button className="btn btn-dark" onClick={handleUpload}>
          Import Fichier
        </button>
      </div>
    </>
  );
};

export default UploadFile;
