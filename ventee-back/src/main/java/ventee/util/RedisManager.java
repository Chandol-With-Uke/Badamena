package ventee.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import ventee.entity.Product;

public class RedisManager {

    private static final String REDIS_HOST = "localhost";
    private static final int REDIS_PORT = 6379;
    private static final String TOP_PRODUCTS_KEY = "top_products";
    private static final int MAX_TOP_PRODUCTS = 20;
    private static final EntityManagerFactory emf = Persistence.createEntityManagerFactory("ventee");

    private static JedisPool jedisPool;

    static {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(8);
        poolConfig.setMaxIdle(8);
        poolConfig.setMinIdle(0);
        jedisPool = new JedisPool(poolConfig, REDIS_HOST, REDIS_PORT);
    }

    public static void initializeFromDatabase() {
        EntityManager em = null;
        try {
            em = emf.createEntityManager();

            // Requête pour obtenir le nombre d'achats par produit
            String query = """
                SELECT p.id, p.productName, COUNT(up.id.productId) as purchaseCount 
                FROM Product p 
                LEFT JOIN UserProduct up ON p.id = up.id.productId 
                GROUP BY p.id, p.productName 
                ORDER BY purchaseCount DESC
                """;

            @SuppressWarnings("unchecked")
            List<Object[]> results = em.createQuery(query).getResultList();

            try (Jedis jedis = jedisPool.getResource()) {
                // Vider la clé existante
                jedis.del(TOP_PRODUCTS_KEY);

                // Insérer les nouveaux scores
                for (Object[] result : results) {
                    Integer productId = (Integer) result[0];
                    String productName = (String) result[1];
                    Long purchaseCount = (Long) result[2];

                    // Stocker le score dans Redis
                    jedis.zadd(TOP_PRODUCTS_KEY, purchaseCount.doubleValue(), productId.toString());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'initialisation de Redis: " + e.getMessage());
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public static void incrementProductSales(String productId, double amount) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.zincrby(TOP_PRODUCTS_KEY, amount, productId);
            // Garder seulement les 20 meilleurs produits
            jedis.zremrangeByRank(TOP_PRODUCTS_KEY, 0, -MAX_TOP_PRODUCTS - 1);
        }
    }

    public static void decrementProductSales(String productId, double amount) {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.zincrby(TOP_PRODUCTS_KEY, -amount, productId);
            // Si le score devient négatif, on le met à 0
            Double score = jedis.zscore(TOP_PRODUCTS_KEY, productId);
            if (score != null && score < 0) {
                jedis.zadd(TOP_PRODUCTS_KEY, 0.0, productId);
            }
        }
    }

    public static List<Map<String, Object>> getTopProducts() {
        try (Jedis jedis = jedisPool.getResource()) {
            List<String> members = new ArrayList<>(jedis.zrevrange(TOP_PRODUCTS_KEY, 0, MAX_TOP_PRODUCTS - 1));
            List<Map<String, Object>> result = new ArrayList<>();

            EntityManager em = null;
            try {
                em = emf.createEntityManager();

                for (String member : members) {
                    Double score = jedis.zscore(TOP_PRODUCTS_KEY, member);
                    if (score != null) {
                        // Récupérer les détails du produit depuis la base de données
                        Product product = em.find(Product.class, Integer.parseInt(member));
                        if (product != null) {
                            Map<String, Object> productInfo = new HashMap<>();
                            productInfo.put("id", product.getId());
                            productInfo.put("name", product.getProductName());
                            productInfo.put("score", score);
                            result.add(productInfo);
                        }
                    }
                }
            } finally {
                if (em != null) {
                    em.close();
                }
            }

            return result;
        }
    }

    public static void clearTopProducts() {
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.del(TOP_PRODUCTS_KEY);
        }
    }

    public static void close() {
        if (jedisPool != null) {
            jedisPool.close();
        }
    }
}
