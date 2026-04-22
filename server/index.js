const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");
const app = express();

// 1. Configuration et Middlewares
app.use(cors());
app.use(express.json()); // 👈 INDISPENSABLE pour lire les données des formulaires

// Dire à node où est ton site
app.use(express.static(path.join(__dirname, "..")));

// 2. Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cuisine_collab", // Nom de ta base
});

db.connect((err) => {
  if (err) {
    console.log("❌ erreur mysql :", err.message);
    return;
  }
  console.log("✅ connecté à mysql");
});

// --- TES ROUTES API ---

// API recettes (existante)
app.get("/api/recettes", (req, res) => {
  // Utilise 'recettes' et 'utilisateurs' au pluriel comme dans ton SQL
  const sql = `
    SELECT 
      r.id, r.titre, r.img, r.description, r.portions,
      u.pseudo AS auteur,
      AVG(n.note) AS moyenne_note,
      COUNT(n.note) AS nombre_notes
    FROM recettes r
    LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
    LEFT JOIN notes n ON r.id = n.recette_id
    GROUP BY r.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result);
    }
  });
});

// NOUVELLE : Route Inscription
app.post("/api/inscription", (req, res) => {
  const { pseudo, email, mot_de_passe } = req.body;
  const sql = "INSERT INTO utilisateurs (pseudo, email, mot_de_passe) VALUES (?, ?, ?)"; // Table 'utilisateurs'
  
  db.query(sql, [pseudo, email, mot_de_passe], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
    res.json({ message: "Utilisateur créé !", pseudo: pseudo });
  });
});

// NOUVELLE : Route Connexion
app.post("/api/connexion", (req, res) => {
  const { email, mot_de_passe } = req.body;
  const sql = "SELECT pseudo FROM utilisateurs WHERE email = ? AND mot_de_passe = ?"; //
  
  db.query(sql, [email, mot_de_passe], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length > 0) {
      res.json({ pseudo: result[0].pseudo });
    } else {
      res.status(401).json({ message: "Identifiants incorrects" });
    }
  });
});

// 3. Lancement du serveur (Toujours à la fin)
app.listen(3000, () => {
  console.log("🚀 serveur lancé sur http://localhost:3000");
});