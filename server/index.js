const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// 1. Configuration et middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// 2. Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cuisine_collab",
});

db.connect((err) => {
  if (err) {
    console.log("❌ Erreur MySQL :", err.message);
    return;
  }
  console.log("✅ Connecté à MySQL");
});

// --- ROUTES API ---

// API recettes
app.get("/api/recettes", (req, res) => {
  const sql = `
    SELECT 
      r.id, r.titre, r.img, r.description, r.portions,
      u.pseudo AS auteur,
      AVG(n.note) AS moyenne_note,
      COUNT(n.note) AS nombre_notes
    FROM recettes r
    LEFT JOIN utilisateurs u ON r.utilisateur_id = u.id
    LEFT JOIN notes n ON r.id = n.recette_id
    GROUP BY r.id, r.titre, r.img, r.description, r.portions, u.pseudo
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors du chargement des recettes" });
    }

    res.json(result);
  });
});

// Inscription
app.post("/api/inscription", async (req, res) => {
  const { pseudo, email, mdp } = req.body;

  if (!pseudo || !email || !mdp) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  const checkSql = "SELECT id FROM utilisateurs WHERE email = ?";

  db.query(checkSql, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    try {
      const hash = await bcrypt.hash(mdp, 10);

      const insertSql = "INSERT INTO utilisateurs (pseudo, email, mdp) VALUES (?, ?, ?)";

      db.query(insertSql, [pseudo, email, hash], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Erreur lors de l'inscription" });
        }

        res.status(201).json({
          message: "Utilisateur créé !",
          pseudo: pseudo
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors du hash du mot de passe" });
    }
  });
});

// Connexion
app.post("/api/connexion", (req, res) => {
  const { email, mdp } = req.body;

  if (!email || !mdp) {
    return res.status(400).json({ message: "Email et mot de passe obligatoires" });
  }

  const sql = "SELECT id, pseudo, mdp FROM utilisateurs WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    try {
      const utilisateur = result[0];
      const motDePasseValide = await bcrypt.compare(mdp, utilisateur.mdp);

      if (!motDePasseValide) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      return res.json({
        message: "Connexion réussie",
        id: utilisateur.id,
        pseudo: utilisateur.pseudo
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  });
});

// Lancement serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});