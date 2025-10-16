package ventee.resource;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ventee.entity.User;

@Path("/user")
public class UserServices {

    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ventee");

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllUsers() {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();

            // Activer le logging SQL détaillé
            em.getEntityManagerFactory().getProperties().put("hibernate.show_sql", "true");
            em.getEntityManagerFactory().getProperties().put("hibernate.format_sql", "true");

            System.out.println("Exécution de la requête pour récupérer les utilisateurs...");
            List<User> users = em.createQuery("SELECT u FROM User u", User.class)
                    .getResultList();

            System.out.println("Nombre d'utilisateurs trouvés : " + users.size());
            if (users.isEmpty()) {
                System.out.println("Aucun utilisateur trouvé dans la base de données");
            } else {
                for (User u : users) {
                    System.out.println("Utilisateur trouvé : " + u.getUserName() + " (ID: " + u.getId() + ")");
                }
            }

            return Response.ok(users).build();
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des utilisateurs :");
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la récupération des utilisateurs: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    @POST
    @Path("/signin")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(User user) {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();
            em.getTransaction().begin();

            // Vérifier si l'utilisateur existe déjà
            List<User> existingUsers = em.createQuery(
                    "SELECT u FROM User u WHERE u.userName = :userName OR u.email = :email", User.class)
                    .setParameter("userName", user.getUserName())
                    .setParameter("email", user.getEmail())
                    .getResultList();

            if (!existingUsers.isEmpty()) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("Un utilisateur avec ce nom d'utilisateur ou cet email existe déjà")
                        .build();
            }

            em.persist(user);
            em.getTransaction().commit();

            return Response.status(Response.Status.CREATED)
                    .entity(user)
                    .build();
        } catch (Exception e) {
            if (em != null && em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la création de l'utilisateur: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    @POST
    @Path("/connect")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response connectUser(User credentials) {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();

            List<User> users = em.createQuery(
                    "SELECT u FROM User u WHERE u.userName = :userName AND u.password = :password", User.class)
                    .setParameter("userName", credentials.getUserName())
                    .setParameter("password", credentials.getPassword())
                    .getResultList();

            Map<String, Object> response = new HashMap<>();

            if (users.isEmpty()) {
                response.put("authorized", false);
                response.put("user", null);
            } else {
                User user = users.get(0);
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("userName", user.getUserName());
                userMap.put("email", user.getEmail());

                response.put("authorized", true);
                response.put("user", userMap);
            }

            return Response.ok(response).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur lors de la connexion: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }
}
