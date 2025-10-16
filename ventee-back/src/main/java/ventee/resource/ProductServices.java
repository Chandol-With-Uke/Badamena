package ventee.resource;

import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ventee.entity.Product;

@Path("/product")
public class ProductServices {

    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ventee");

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllProducts() {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();

            // Activer le logging SQL détaillé
            em.getEntityManagerFactory().getProperties().put("hibernate.show_sql", "true");
            em.getEntityManagerFactory().getProperties().put("hibernate.format_sql", "true");

            System.out.println("Exécution de la requête pour récupérer les produits...");
            List<Product> products = em.createQuery("SELECT p FROM Product p", Product.class)
                    .getResultList();

            System.out.println("Nombre de produits trouvés : " + products.size());
            if (products.isEmpty()) {
                System.out.println("Aucun produit trouvé dans la base de données");
            } else {
                for (Product p : products) {
                    System.out.println("Produit trouvé : " + p.getProductName() + " (ID: " + p.getId() + ")");
                }
            }

            return Response.ok(products).build();
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des produits :");
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la récupération des produits: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }
}
