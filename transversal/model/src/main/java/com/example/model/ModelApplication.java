package com.example.model;

import com.example.model.domain.Product;
import com.example.model.repository.ProductRepository;
import java.util.stream.Stream;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ModelApplication {

    public static void main(String[] args) {
        SpringApplication.run(ModelApplication.class, args);
    }

    @Bean
    CommandLineRunner init(ProductRepository productRepository) {
        return args -> {
            // S'assurer d'avoir une base propre à chaque démarrage pour éviter les duplicatas ou les données obsolètes
            productRepository.deleteAll();

            // Création de produits avec des noms, descriptions et prix
            Stream.of(
                new Product("Livre", "Un best-seller captivant", 19.99f),
                new Product(
                    "Ordinateur Portable",
                    "Puissant et léger, idéal pour le travail et les loisirs",
                    1200.00f
                ),
                new Product(
                    "Clavier Mécanique",
                    "Confort de frappe supérieur et rétroéclairage RGB",
                    75.50f
                ),
                new Product(
                    "Souris Ergonomique",
                    "Précision et confort pour des heures d'utilisation",
                    25.00f
                ),
                new Product(
                    "Moniteur Ultra HD",
                    "Une expérience visuelle immersive",
                    299.99f
                ),
                new Product(
                    "Webcam Full HD",
                    "Idéale pour les visioconférences claires",
                    49.99f
                ),
                new Product(
                    "Casque Audio",
                    "Son haute fidélité avec réduction de bruit",
                    149.99f
                ),
                new Product(
                    "Disque Dur Externe",
                    "Stockage fiable pour toutes vos données",
                    89.90f
                )
            ).forEach(product -> productRepository.save(product));

            System.out.println(
                "Produits initialisés dans la base de données :"
            );
            productRepository.findAll().forEach(System.out::println);
        };
    }
}
