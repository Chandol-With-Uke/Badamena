package ventee;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/api")
public class RestServices {
    @GET
    @Path("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
