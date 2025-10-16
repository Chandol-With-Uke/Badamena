package ventee.resource;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.persistence.TypedQuery;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ventee.entity.Product;
import ventee.entity.User;
import ventee.entity.UserProduct;
import ventee.entity.UserProductId;

@Path("/user/{userId}/purchases")
public class UserProductServices {

    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ventee");

    // Endpoint pour récupérer les produits achetés par un utilisateur
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserPurchases(@PathParam("userId") Integer userId) {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();

            // Récupérer les entrées UserProduct pour cet utilisateur
            TypedQuery<UserProduct> query = em.createQuery(
                    "SELECT up FROM UserProduct up WHERE up.id.userId = :userId", UserProduct.class);
            query.setParameter("userId", userId);
            List<UserProduct> userProducts = query.getResultList();

            // Extraire les produits correspondants
            List<Product> purchasedProducts = new ArrayList<>();
            for (UserProduct up : userProducts) {
                // Recharger le produit pour s'assurer qu'il est dans le contexte de l'EM actuel si nécessaire
                // Dans ce cas simple, l'entité UserProduct est déjà liée au produit
                purchasedProducts.add(up.getProduct());
            }

            return Response.ok(purchasedProducts).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la récupération des achats: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    // Endpoint pour ajouter un produit aux achats de l'utilisateur
    @POST
    @Path("/{productId}") // Note: Le chemin complet sera /user/{userId}/purchases/{productId}
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addProductToPurchases(@PathParam("userId") Integer userId, @PathParam("productId") Integer productId) {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();
            em.getTransaction().begin();

            // Vérifier si l'entrée UserProduct existe déjà
            UserProductId userProductId = new UserProductId(userId, productId);
            UserProduct existingUserProduct = em.find(UserProduct.class, userProductId);

            if (existingUserProduct != null) {
                // L'achat existe déjà, on peut retourner un conflit ou un succès selon la logique souhaitée
                em.getTransaction().rollback(); // Annuler la transaction car rien n'est inséré
                return Response.status(Response.Status.CONFLICT)
                        .entity("Ce produit est déjà dans vos achats.")
                        .build();
            }

            // Vérifier si l'utilisateur et le produit existent
            User user = em.find(User.class, userId);
            Product product = em.find(Product.class, productId);

            if (user == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Utilisateur non trouvé.")
                        .build();
            }
            if (product == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Produit non trouvé.")
                        .build();
            }

            // Créer la nouvelle entrée UserProduct
            UserProduct newUserProduct = new UserProduct();
            newUserProduct.setId(userProductId); // Utiliser la clé composite
            newUserProduct.setUser(user); // Lier l'entité User
            newUserProduct.setProduct(product); // Lier l'entité Product

            em.persist(newUserProduct);

            // Incrémenter le score de vente dans Redis
            try {
                ventee.util.RedisManager.incrementProductSales(productId.toString(), 1.0);
                System.out.println("Produit " + productId + " incrémenté dans Redis.");
            } catch (Exception redisError) {
                System.err.println("Erreur lors de l'incrémentation Redis pour le produit " + productId + ": " + redisError.getMessage());
                redisError.printStackTrace();
                // Continuer même en cas d'erreur Redis, l'achat en base de données a réussi.
            }

            em.getTransaction().commit();

            return Response.status(Response.Status.CREATED).entity(newUserProduct).build();
        } catch (Exception e) {
            if (em != null && em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de l'ajout du produit aux achats: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    // Endpoint pour supprimer un produit des achats de l'utilisateur
    @DELETE
    @Path("/{productId}") // Note: Le chemin complet sera /user/{userId}/purchases/{productId}
    @Produces(MediaType.APPLICATION_JSON)
    public Response removeProductFromPurchases(@PathParam("userId") Integer userId, @PathParam("productId") Integer productId) {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();
            em.getTransaction().begin();

            // Trouver l'entrée UserProduct à supprimer
            UserProductId userProductId = new UserProductId(userId, productId);
            UserProduct userProductToRemove = em.find(UserProduct.class, userProductId);

            if (userProductToRemove == null) {
                em.getTransaction().rollback();
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Ce produit n'est pas dans vos achats.")
                        .build();
            }

            // Supprimer l'entrée
            em.remove(userProductToRemove);

            // Décrémenter le score de vente dans Redis
            try {
                ventee.util.RedisManager.decrementProductSales(productId.toString(), 1.0);
                System.out.println("Produit " + productId + " décrémenté dans Redis.");
            } catch (Exception redisError) {
                System.err.println("Erreur lors de la décrémentation Redis pour le produit " + productId + ": " + redisError.getMessage());
                redisError.printStackTrace();
                // Continuer même en cas d'erreur Redis, la suppression en base de données a réussi.
            }

            em.getTransaction().commit();

            return Response.ok().entity("Produit supprimé des achats.").build();
        } catch (Exception e) {
            if (em != null && em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la suppression du produit des achats: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }
}
