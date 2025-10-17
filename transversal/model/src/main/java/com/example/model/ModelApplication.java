package com.example.model;

import com.example.model.domain.Product;
import com.example.model.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.stream.Stream;

@SpringBootApplication
public class ModelApplication {

	public static void main(String[] args) {
		SpringApplication.run(ModelApplication.class, args);
	}

	@Bean
	CommandLineRunner init(ProductRepository productRepository) {
		return args -> {
			Stream.of("Livre", "Ordinateur", "Clavier", "Souris").forEach(name -> {
				Product product = new Product(name, "Description de " + name.toLowerCase());
				productRepository.save(product);
			});
			productRepository.findAll().forEach(System.out::println);
		};
	}
}
