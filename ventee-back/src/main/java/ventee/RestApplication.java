package ventee;

import java.util.HashSet;
import java.util.Set;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import ventee.resource.ProductServices;
import ventee.resource.Top20ProductsServicees;
import ventee.resource.UserProductServices;
import ventee.resource.UserServices;

@ApplicationPath("/ressources")
public class RestApplication extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new HashSet<>();
        resources.add(UserServices.class);
        resources.add(UserProductServices.class);
        resources.add(ProductServices.class);
        resources.add(Top20ProductsServicees.class);
        // Add other resource classes here if needed
        return resources;
    }
}
