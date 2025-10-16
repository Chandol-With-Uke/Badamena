package ventee.resource;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ventee.entity.TestEntity;

@Path("/db-test")
public class DatabaseTestResource {
    
    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ventee");
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response testConnection() {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();
            em.getTransaction().begin();
            
            TestEntity test = new TestEntity("Test de connexion réussi!");
            em.persist(test);
            
            em.getTransaction().commit();
            return Response.ok(test).build();
        } catch (Exception e) {
            if (em != null && em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Erreur de connexion: " + e.getMessage())
                    .build();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }
} 