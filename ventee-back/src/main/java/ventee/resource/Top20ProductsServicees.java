/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ventee.resource;

import java.util.List;
import java.util.Map;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ventee.util.RedisManager;

/**
 *
 * @author boywithuke
 */
@Path("/top-products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class Top20ProductsServicees {

    @GET
    public Response getTopProducts() {
        try {
            List<Map<String, Object>> productsList = RedisManager.getTopProducts();
            return Response.ok(productsList).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/increment")
    public Response incrementProductSales(@QueryParam("productId") String productId,
            @QueryParam("amount") double amount) {
        try {
            RedisManager.incrementProductSales(productId, amount);
            return Response.ok(Map.of("message", "Score mis à jour avec succès")).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/refresh")
    public Response refreshTopProducts() {
        try {
            RedisManager.initializeFromDatabase();
            return Response.ok(Map.of("message", "Top produits rafraîchis avec succès")).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}
