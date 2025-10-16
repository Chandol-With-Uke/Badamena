document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const API_URL =
    "http://localhost:8080/ventee-1.0-SNAPSHOT/ressources/user";

  // Vérifier si l'utilisateur est déjà connecté
  if (getCookie("user")) {
    window.location.href = "index.html";
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();

      if (data.authorized) {
        // Sauvegarder les informations de l'utilisateur dans un cookie
        setCookie("user", JSON.stringify(data.user), 7); // Cookie valide pendant 7 jours
        window.location.href = "index.html";
      } else {
        showError("Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      showError("Erreur de connexion. Veuillez réessayer.");
      console.error("Erreur:", error);
    }
  });

  function showError(message) {
    let errorDiv = document.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      loginForm.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
});

// Fonctions utilitaires pour les cookies
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

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
