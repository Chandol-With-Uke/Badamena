package ventee.util;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class ApplicationInitializer implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            // Initialiser Redis avec les données de la base de données
            RedisManager.initializeFromDatabase();
            System.out.println("Redis a été initialisé avec succès avec les données de la base de données.");
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation de Redis : " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Fermer la connexion Redis lors de l'arrêt de l'application
        RedisManager.close();
    }
}
