package com.example.model.graphql;

import com.example.model.domain.Product;
import com.example.model.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @QueryMapping
    public List<Product> products() {
        return productRepository.findAll();
    }

    @QueryMapping
    public Optional<Product> product(@Argument Long id) {
        return productRepository.findById(id);
    }

    @MutationMapping
    public Product createProduct(@Argument ProductInput product) {
        // Le constructeur Product maintenant prend name, description, price
        Product newProduct = new Product(
            product.name(),
            product.description(),
            product.price()
        );
        return productRepository.save(newProduct);
    }

    @MutationMapping
    public Product updateProduct(
        @Argument Long id,
        @Argument ProductInput product
    ) {
        Product existingProduct = productRepository
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Product not found with id: " + id
                )
            );

        existingProduct.setName(product.name());
        existingProduct.setDescription(product.description());
        existingProduct.setPrice(product.price()); // Mise à jour du prix

        return productRepository.save(existingProduct);
    }

    @MutationMapping
    public boolean deleteProduct(@Argument Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

// DTO record mis à jour pour inclure le prix
record ProductInput(String name, String description, Float price) {}
