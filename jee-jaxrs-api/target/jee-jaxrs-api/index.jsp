<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Accueil - Gestion de Produits</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-gray-200 flex items-center justify-center min-h-screen">
    <div class="text-center p-8">
        <h1 class="text-5xl font-bold text-white mb-4">Gestion de Produits</h1>
        <p class="text-gray-400 text-lg mb-12">Explorez les données de ventes de notre catalogue.</p>
        
        <div class="flex flex-col md:flex-row gap-8 justify-center">
            <!-- Carte pour tous les produits -->
            <a href="products.jsp" class="group bg-gray-800 hover:bg-indigo-600 transition-all duration-300 p-8 rounded-lg shadow-lg w-80">
                <div class="text-left">
                    <h2 class="text-2xl font-semibold text-white mb-2">Catalogue Complet</h2>
                    <p class="text-gray-400 group-hover:text-gray-200">Parcourez la liste de tous les produits disponibles stockés dans notre base de données principale.</p>
                </div>
                <div class="text-right text-white mt-4">
                    <span class="group-hover:translate-x-2 inline-block transition-transform duration-300">→</span>
                </div>
            </a>

            <!-- Carte pour les produits les plus vendus -->
            <a href="top-products.jsp" class="group bg-gray-800 hover:bg-sky-600 transition-all duration-300 p-8 rounded-lg shadow-lg w-80">
                <div class="text-left">
                    <h2 class="text-2xl font-semibold text-white mb-2">Top des Ventes</h2>
                    <p class="text-gray-400 group-hover:text-gray-200">Découvrez les 20 produits les plus populaires, mis en cache pour un accès ultra-rapide.</p>
                </div>
                <div class="text-right text-white mt-4">
                    <span class="group-hover:translate-x-2 inline-block transition-transform duration-300">→</span>
                </div>
            </a>
        </div>
    </div>
</body>
</html>
