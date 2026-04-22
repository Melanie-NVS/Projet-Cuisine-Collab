//NAVBAR

//GESTION DE L'AFFICHAGE DU PROFIL DANS LA NAV
document.addEventListener('DOMContentLoaded', () => {
    // 1. On regarde si un pseudo est enregistré dans le navigateur
    const pseudoEnregistre = localStorage.getItem('pseudoUtilisateur');
    
    // 2. On récupère tes éléments HTML (avec tes classes en français)
    const liensConnexion = document.querySelectorAll('.lien-authentification');
    const lienEspaceChef = document.querySelector('.lien-utilisateur');
    const zonePseudo = document.getElementById('nom-utilisateur-nav');

    // 3. Si l'utilisateur est connecté
    if (pseudoEnregistre && lienEspaceChef) {
        // On cache "Se connecter" et "S'inscrire"
        liensConnexion.forEach(li => li.style.display = 'none');
        
        // On affiche l'Espace Chef et on écrit son nom
        lienEspaceChef.style.display = 'block';
        zonePseudo.textContent = pseudoEnregistre;
    }
});

// Fonction pour mettre à jour la barre de navigation
function mettreAJourNav() {
    // On récupère le pseudo stocké dans le navigateur
    const pseudoStocke = localStorage.getItem('pseudoUtilisateur');
    
    const liensAuth = document.querySelectorAll('.lien-authentification');
    const lienUser = document.querySelector('.lien-utilisateur');
    const baliseNom = document.getElementById('nom-utilisateur-nav');

    if (pseudoStocke) {
        // Si on a un pseudo, on cache "Se connecter/S'inscrire" et on montre le profil
        liensAuth.forEach(lien => lien.style.display = 'none');
        lienUser.style.display = 'block';
        baliseNom.textContent = pseudoStocke;
    } else {
        // Sinon, on montre les boutons de connexion
        liensAuth.forEach(lien => lien.style.display = 'block');
        lienUser.style.display = 'none';
    }
}

// On lance la fonction quand la page est prête
window.addEventListener('DOMContentLoaded', mettreAJourNav);

//------------------------------------------------------------

//JS POUR LA PAGE HOME
//POUR LE TRI (RECENT, ENTREE, PLAT, DESSERT)
const btn = document.getElementById("btnTri"); // recupère le bouton
const triLabel = document.getElementById("triLabel"); // recupère le span pour changer le texte
let menuOuvert = false; // sert à savoir si le menu est ouvert ou pas

btn.addEventListener("click", (event) => {
  event.stopPropagation(); // empêche fermeture immédiate
  const triDiv = btn.parentElement; // récupère la div parent (.tri)

  if (!menuOuvert) {
    // si le menu n'est pas ouvert, on l'ouvre
    const menu = document.createElement("ul"); // crée un ul
    menu.classList.add("menu"); // lui ajoute la classe "menu"

    menu.innerHTML = `
      <li data-value="recent">Récent</li>
      <li data-value="entree">Entrée</li>
      <li data-value="plat">Plat</li>
      <li data-value="dessert">Dessert</li>
    `; // ajoute les options du menu (avec data-value pour savoir quelle option est choisie)

    triDiv.appendChild(menu); // ajoute le menu à la div .tri

    menu.addEventListener("click", (e) => {
      e.stopPropagation(); // empêche la fermeture du menu quand on clique dessus
      const valeur = e.target.dataset.value; // récupère la valeur de l'option choisie
      if (!valeur) return; // si on clique en dehors des options, on ne fait rien

      triLabel.textContent = e.target.textContent; // on change juste le texte
      menu.remove(); // on ferme le menu
      menuOuvert = false; // indique que le menu est fermé
    });

    menuOuvert = true; // indique que le menu est ouvert
  } else {
    const menu = document.querySelector(".menu"); // récupère le menu
    if (menu) menu.remove(); // s'il existe, on le supprime
    menuOuvert = false; // indique que le menu est fermé
  }
});

//Ferme si on clique ailleurs
document.addEventListener("click", () => {
  const menu = document.querySelector(".menu"); // récupère le menu
  if (menu) {
    // s'il existe, on le supprime
    menu.remove(); // ferme le menu
    menuOuvert = false; // indique que le menu est fermé
  }
});
// ----------------------------------------------------------------

//POUR LA LISTE DE TYPE DE PLATS
const btnTypes = document.getElementById("btnTypes");
const listeTypes = document.getElementById("listeTypes");
const iconeToggle = document.getElementById("iconeToggle");

if (btnTypes) {
  btnTypes.addEventListener("click", () => {

  listeTypes.classList.toggle("open");

  if(listeTypes.classList.contains("open")){
    iconeToggle.classList.remove("fa-plus");
    iconeToggle.classList.add("fa-minus");
  } else {
    iconeToggle.classList.remove("fa-minus");
    iconeToggle.classList.add("fa-plus");
  }

});
}

//LISTE LI ACTIVE EN ORANGE
const boutons = document.querySelectorAll("#listeTypes button");

boutons.forEach((bouton) => {
  bouton.addEventListener("click", () => {
    // 1️⃣ on enlève active à tous
    boutons.forEach((b) => b.classList.remove("active"));

    // 2️⃣ on ajoute active au bouton cliqué
    bouton.classList.add("active");
  });
});
// -------------------------------------------------------


//------------------------------------------------------------
// POUR AFFICHER LES RECETTES (fetch depuis le serveur)
fetch("http://localhost:3000/api/recettes")
  .then(response => response.json())
  .then(data => {
    afficherRecettes(data, currentPage);
    changerPages(data);
  });

//-----------------------------------------------
// FONCTION POUR AFFICHER LES RECETTES DANS LA CLASS .GRILLE
let currentPage = 1;
const recettesParPage = 12;
function afficherRecettes(recettes, currentPage) {
  const container = document.querySelector(".grille");

  container.innerHTML = "";
  const start = (currentPage - 1) * recettesParPage;
  const end = start + recettesParPage;
  const recettesPage = recettes.slice(start, end);

  recettesPage.forEach(recette => {
    const article = document.createElement("article");
    article.classList.add("carte");

    article.innerHTML = `
      <div class="image-box">
          <img src="../${recette.img}" alt="${recette.titre}">
            <button class="coeur">
              <i class="far fa-heart" onclick="ajouteFavoris(this)"></i>
            </button>
      </div>
      <div class="contenu">
          <h3>${recette.titre}</h3>
            <div class="infos">
              <div class="note">
                <i class="fa-regular fa-star"></i>
                <span>${Number(recette.moyenne_note).toFixed(1)} (${recette.nombre_notes})</span>
              </div>
              <span class="auteur">par ${recette.auteur}</span>
            </div>
      </div>
    `;

    container.appendChild(article);
  });
}

//---------------------------------------------
//POUR LE COEUR SUR LES IMAGES (fav)
function ajouteFavoris(btn) {
btn.classList.toggle("active");

    if (btn.classList.contains("active")) {
      btn.classList.remove("far"); // vide
      btn.classList.add("fas"); // plein
    } else {
      btn.classList.remove("fas");
      btn.classList.add("far");
    }
}

//----------------------------------------

// pour la pagination
function changerPages(recettes) {
  const prevfleche = document.getElementById("prev");
  const nextfleche = document.getElementById("next");
  const pagesNumbers = document.getElementById("pagesNumbers");

  const totalPages = Math.ceil(recettes.length / recettesParPage);

  function creerBoutonPage(page) {
    const btn = document.createElement("button");
    btn.classList.add("page-btn");
    btn.dataset.page = page;
    btn.textContent = page;

    if (page === currentPage) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      currentPage = page;
      afficherRecettes(recettes, currentPage);
      renderPagination();
    });

    return btn;
  }

  function creerPoints() {
    const span = document.createElement("span");
    span.classList.add("points");
    span.textContent = "...";
    return span;
  }

  function renderPagination() {
    pagesNumbers.innerHTML = "";

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pagesNumbers.appendChild(creerBoutonPage(i));
      }
    } else {
      // Toujours afficher la page 1
      pagesNumbers.appendChild(creerBoutonPage(1));

      // Points avant les pages centrales
      if (currentPage > 4) {
        pagesNumbers.appendChild(creerPoints());
      }

      // Pages autour de la page actuelle
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ajustement si on est au début
      if (currentPage <= 4) {
        startPage = 2;
        endPage = 5;
      }

      // Ajustement si on est à la fin
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pagesNumbers.appendChild(creerBoutonPage(i));
      }

      // Points après les pages centrales
      if (currentPage < totalPages - 3) {
        pagesNumbers.appendChild(creerPoints());
      }

      // Toujours afficher la dernière page
      pagesNumbers.appendChild(creerBoutonPage(totalPages));
    }

    prevfleche.disabled = currentPage === 1;
    nextfleche.disabled = currentPage === totalPages;
  }

  prevfleche.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      afficherRecettes(recettes, currentPage);
      renderPagination();
    }
  });

  nextfleche.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      afficherRecettes(recettes, currentPage);
      renderPagination();
    }
  });

  renderPagination();
}
//------------------------------------------------