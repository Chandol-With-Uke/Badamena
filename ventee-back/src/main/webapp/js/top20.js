document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "/ventee-1.0-SNAPSHOT/ressources/top-products";
  const productsContainer = document.getElementById(
    "products-container"
  );
  const productTemplate = document.getElementById("product-template");

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  // Fonction pour créer une carte produit
  const createProductCard = (product, rank) => {
    const clone = productTemplate.content.cloneNode(true);

    // Mise à jour des éléments de la carte
    const card = clone.querySelector(".product-card");
    const rankBadge = clone.querySelector(".rank-badge");
    const productName = clone.querySelector(".product-name");
    const salesCount = clone.querySelector(".sales-count");

    // Application des données
    rankBadge.textContent = `#${rank}`;
    productName.textContent = product.name;
    salesCount.textContent = `Ventes: ${formatNumber(product.score)}`;

    // Ajout d'une classe de couleur différente selon le rang
    if (rank <= 3) {
      card.classList.add("border-2", "border-accent");
      rankBadge.classList.remove("bg-primary", "text-white");
      rankBadge.classList.add("bg-accent", "text-gray-900");
    }

    return clone;
  };

  // Fonction pour charger et afficher les produits
  const loadTopProducts = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const products = await response.json();
      productsContainer.innerHTML = ""; // Nettoyage du conteneur

      // Trier les produits par score (ventes) décroissant
      products.sort((a, b) => b.score - a.score);

      // Affichage des produits
      products.forEach((product, index) => {
        const productCard = createProductCard(product, index + 1);
        productsContainer.appendChild(productCard);
      });

      // Message si aucun produit
      if (products.length === 0) {
        productsContainer.innerHTML = `
                    <div class="w-full text-center col-span-full">
                        <p class="text-gray-600">Aucun produit disponible pour le moment.</p>
                    </div>
                `;
      }
    } catch (error) {
      console.error("Erreur:", error);
      productsContainer.innerHTML = `
                <div class="w-full text-center col-span-full">
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Erreur!</strong>
                        <span class="block sm:inline"> Une erreur est survenue lors du chargement des produits.</span>
                    </div>
                </div>
            `;
    }
  };

  // Chargement initial des produits
  loadTopProducts();

  // Rafraîchissement automatique toutes les 30 secondes
  setInterval(loadTopProducts, 30000);

  // Fonction de déconnexion
  function logout() {
    deleteCookie("user");
    window.location.href = "login.html";
  }

  // Fonctions utilitaires pour les cookies
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0)
        return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
  }

  // Afficher le nom d'utilisateur après chargement du DOM
  const userCookie = getCookie("user");
  if (userCookie) {
    const user = JSON.parse(userCookie);
    const userNameSpan = document.getElementById("userName");
    if (userNameSpan) {
      userNameSpan.textContent = user.userName;
    }
  }
});
