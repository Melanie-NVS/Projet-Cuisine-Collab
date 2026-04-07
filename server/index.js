const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");
const app = express();

// autoriser les requêtes du front end
app.use(cors());

// 📂 dire à node où est ton site (ton dossier principal)
app.use(express.static(path.join(__dirname, "..")));

// connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cuisine_collab",
});

db.connect((err) => {
  if (err) {
    console.log("❌ erreur mysql :", err.message);
    return;
  }
  console.log("✅ connecté à mysql");
});

// API recettes
app.get("/api/recettes", (req, res) => {

  const sql = `
    SELECT 
      r.id,
      r.titre,
      r.img,
      r.description,
      r.portions,
      u.pseudo AS auteur,
      AVG(n.note) AS moyenne_note,
      COUNT(n.note) AS nombre_notes
    FROM recettes r
    LEFT JOIN utilisateurs u 
      ON r.utilisateur_id = u.id
    LEFT JOIN notes n 
      ON r.id = n.recette_id
    GROUP BY r.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("❌ erreur mysql :", err);
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });

});

app.listen(3000, () => {
  console.log("🚀 serveur lancé sur http://localhost:3000");
});
