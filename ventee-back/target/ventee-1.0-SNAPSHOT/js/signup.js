document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const API_URL =
    "http://localhost:8080/ventee-1.0-SNAPSHOT/ressources/user";

  // Vérifier si l'utilisateur est déjà connecté
  if (getCookie("user")) {
    window.location.href = "index.html";
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("userName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // Première étape : Inscription
      const signupResponse = await fetch(`${API_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });

      if (signupResponse.status === 201) {
        // Deuxième étape : Connexion automatique
        const loginResponse = await fetch(`${API_URL}/connect`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName, password }),
        });

        const loginData = await loginResponse.json();

        if (loginData.authorized) {
          // Sauvegarder les informations de l'utilisateur dans un cookie
          setCookie("user", JSON.stringify(loginData.user), 7); // Cookie valide pendant 7 jours
          window.location.href = "index.html";
        } else {
          showError(
            "Erreur lors de la connexion automatique. Veuillez vous connecter manuellement."
          );
          window.location.href = "login.html";
        }
      } else if (signupResponse.status === 409) {
        showError(
          "Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà"
        );
      } else {
        showError(
          "Erreur lors de l'inscription. Veuillez réessayer."
        );
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
      errorDiv.className = "error-message text-red-500 text-sm mt-2";
      signupForm.appendChild(errorDiv);
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
