<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Top des Ventes - Gestion de Produits</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-gray-200">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div class="mb-8">
            <a href="index.jsp" class="text-sky-400 hover:text-sky-300 transition-colors duration-300">&larr; Retour à l'accueil</a>
            <h1 class="text-4xl font-bold text-white mt-2">Top 20 des Produits les Plus Vendus</h1>
            <p class="text-gray-400">Liste des meilleurs produits récupérés depuis le cache Redis.</p>
        </div>

        <div class="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <table class="min-w-full">
                <thead class="bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Classement</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom et Ventes</th>
                    </tr>
                </thead>
                <tbody id="top-products-table-body" class="divide-y divide-gray-700">
                    <!-- Les données seront insérées ici par JavaScript -->
                    <tr><td colspan="2" class="text-center p-8 text-gray-400">Chargement des données...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        fetch('${pageContext.request.contextPath}/api/products/top')
            .then(response => {
                if (!response.ok) throw new Error('La requête a échoué');
                return response.json();
            })
            .then(data => {
                const tableBody = document.getElementById("top-products-table-body");
                tableBody.innerHTML = ''; // Vider le message de chargement
                if (data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="2" class="text-center p-8 text-gray-400">Aucun produit trouvé.</td></tr>';
                    return;
                }
                data.forEach((productName, index) => {
                    const row = `<tr class="hover:bg-gray-700 transition-colors duration-200">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#\${index + 1}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">\${productName}</td>
                                 </tr>`;
                    tableBody.innerHTML += row;
                });
            })
            .catch(error => {
                console.error('Erreur:', error);
                const tableBody = document.getElementById("top-products-table-body");
                tableBody.innerHTML = '<tr><td colspan="2" class="text-center p-8 text-red-400">Erreur lors du chargement des produits.</td></tr>';
            });
    </script>
</body>
</html>
