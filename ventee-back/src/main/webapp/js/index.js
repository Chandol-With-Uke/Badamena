document.addEventListener("DOMContentLoaded", async () => {
  const userCookie = getCookie("user");
  if (!userCookie) {
    window.location.href = "login.html";
    return;
  }
  const user = JSON.parse(userCookie);
  document.getElementById("userName").textContent = user.userName;
  document.getElementById("userNameDisplay").textContent =
    user.userName;

  // Récupérer et afficher les produits
  await loadProducts();
});

async function loadProducts() {
  try {
    const response = await fetch(
      "http://localhost:8080/ventee-1.0-SNAPSHOT/ressources/product"
    );
    const products = await response.json();
    console.log("Voici les produits:", products);
    displayProducts(products);
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error);
  }
}

function displayProducts(products) {
  const productsContainer = document.getElementById(
    "productsContainer"
  );
  productsContainer.innerHTML = "";

  // OPTION 1: Picsum Photos (images aléatoires avec seed basé sur l'ID)
  // Plus fiable qu'Unsplash
  function getPicsumImage(productId, productName) {
    const seed = productName.replace(/\s+/g, "").toLowerCase();
    return `https://picsum.photos/seed/${seed}${productId}/300/200`;
  }

  // OPTION 2: Lorem Picsum avec catégories
  const picsumCategories = {
    Électronique: "tech",
    Accessoires: "fashion",
    Alimentation: "food",
    Mobilier: "business",
    Livres: "nature",
    Décoration: "arch",
  };

  // OPTION 3: Placeholder.com (très fiable)
  function getPlaceholderImage(productName, type) {
    const colors = {
      Électronique: "2196F3/ffffff",
      Accessoires: "4CAF50/ffffff",
      Alimentation: "FF9800/ffffff",
      Mobilier: "795548/ffffff",
      Livres: "9C27B0/ffffff",
      Décoration: "E91E63/ffffff",
    };
    const color = colors[type] || "607D8B/ffffff";
    const text = productName.split(" ")[0];
    return `https://via.placeholder.com/300x200/${color}?text=${encodeURIComponent(
      text
    )}`;
  }

  // OPTION 4: Images par défaut selon le type (URLs d'exemple - remplacez par vos propres images)
  const defaultImages = {
    Électronique:
      "https://cdn.pixabay.com/photo/2017/05/10/19/29/robot-2301646_960_720.jpg",
    Accessoires:
      "https://cdn.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_960_720.jpg",
    Alimentation:
      "https://cdn.pixabay.com/photo/2017/06/02/18/24/fruit-2367029_960_720.jpg",
    Mobilier:
      "https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_960_720.jpg",
    Livres:
      "https://cdn.pixabay.com/photo/2015/11/19/21/10/glasses-1052010_960_720.jpg",
    Décoration:
      "https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_960_720.jpg",
  };

  products.forEach((product) => {
    // Choisissez une des options ci-dessous :

    // OPTION 1: Picsum (recommandée)
    // const imageUrl = getPicsumImage(product.id, product.productName);

    // OPTION 2: Placeholder avec couleurs par type
    // const imageUrl = getPlaceholderImage(product.productName, product.type);

    // OPTION 3: Images par défaut selon le type
    const imageUrl =defaultImages[product.type] || defaultImages["Électronique"];

    // OPTION 4: Robohash (avatars robotiques amusants)
    // const imageUrl = `https://robohash.org/${product.productName}?set=set1&size=300x200`;

    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col";

    card.innerHTML = `
      <div class="relative w-full h-48 bg-gray-200">
        <img
          src="${imageUrl}"
          alt="${product.productName}"
          class="w-full h-48 object-cover"
          onerror="this.src='https://via.placeholder.com/300x200/cccccc/666666?text=Image+non+disponible'"
        >
      </div>
      <div class="p-4 pt-0 flex flex-col flex-grow">
        <h3 class="text-lg font-semibold text-gray-800">${
          product.productName
        }</h3>
        <p class="text-sm text-gray-600 mt-1 flex-grow">${
          product.description
        }</p>
        <div class="mt-2 flex justify-between items-center">
          <span class="text-primary font-bold">${product.price.toFixed(
            2
          )} €</span>
          <span class="text-sm text-gray-500">Stock: ${
            product.stock
          }</span>
        </div>
        <div class="mt-4">
          <button
            onclick="buyProduct(${product.id})"
            class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition duration-200"
          >
            Acheter
          </button>
        </div>
      </div>
    `;

    productsContainer.appendChild(card);
  });
}

// Fonction de filtrage en temps réel
function filterProducts(searchTerm) {
  const cards = document.querySelectorAll("#productsContainer > div");
  cards.forEach((card) => {
    const productName = card
      .querySelector("h3")
      .textContent.toLowerCase();
    if (productName.includes(searchTerm.toLowerCase())) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

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

// Fonction pour acheter un produit
async function buyProduct(productId) {
  const userCookie = getCookie("user");
  if (!userCookie) {
    alert("Vous devez être connecté pour acheter.");
    window.location.href = "login.html";
    return;
  }
  const user = JSON.parse(userCookie);
  const userId = user.id; // Assurez-vous que l'ID utilisateur est disponible dans l'objet utilisateur

  try {
    const response = await fetch(
      `http://localhost:8080/ventee-1.0-SNAPSHOT/ressources/user/${userId}/purchases/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      alert("Produit ajouté à vos achats !");
      // Optionnel : recharger les produits ou mettre à jour l'UI
      // loadProducts();
    } else {
      const error = await response.text();
      alert(`Erreur lors de l'achat: ${error}`);
    }
  } catch (error) {
    console.error("Erreur réseau ou autre lors de l'achat:", error);
    alert("Une erreur est survenue lors de l'achat.");
  }
}
