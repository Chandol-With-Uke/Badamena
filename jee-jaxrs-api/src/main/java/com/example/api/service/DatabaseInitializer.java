package com.example.api.service;

import com.example.api.model.Product;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import redis.clients.jedis.Jedis;

import java.util.List;
import java.util.Random;

@Singleton
@Startup
public class DatabaseInitializer {

    @PersistenceContext(unitName = "product-pu")
    private EntityManager em;

    @PostConstruct
    public void init() {
        // 1. Initialiser la base de données PostgreSQL avec 50 produits
        Random random = new Random();
        for (int i = 1; i <= 50; i++) {
            Product p = new Product();
            p.setName("Product " + i);
            p.setSalesCount(random.nextInt(1000));
            em.persist(p);
        }

        // 2. Récupérer les 20 produits les plus vendus
        List<Product> topProducts = em.createQuery("SELECT p FROM Product p ORDER BY p.salesCount DESC", Product.class)
                                      .setMaxResults(20)
                                      .getResultList();

        // 3. Mettre en cache les 20 meilleurs produits dans Redis
        try (Jedis jedis = new Jedis(System.getenv("REDIS_HOST"), Integer.parseInt(System.getenv("REDIS_PORT")))) {
            String key = "top-products";
            // Effacer les anciennes données
            jedis.del(key);
            // Ajouter les nouveaux produits
            for (Product p : topProducts) {
                jedis.lpush(key, p.getName() + " (Ventes: " + p.getSalesCount() + ")");
            }
        }
    }
}
