package com.example.api.resources;

import com.example.api.model.Product;
import jakarta.enterprise.context.RequestScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import redis.clients.jedis.Jedis;

import java.util.List;

@Path("/products")
@RequestScoped
public class ProductResource {

    @PersistenceContext(unitName = "product-pu")
    private EntityManager em;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllProducts() {
        List<Product> products = em.createQuery("SELECT p FROM Product p", Product.class).getResultList();
        return Response.ok(products).build();
    }

    @GET
    @Path("/top")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTopProducts() {
        try (Jedis jedis = new Jedis(System.getenv("REDIS_HOST"), Integer.parseInt(System.getenv("REDIS_PORT")))) {
            List<String> topProducts = jedis.lrange("top-products", 0, -1);
            return Response.ok(topProducts).build();
        }
    }
}
