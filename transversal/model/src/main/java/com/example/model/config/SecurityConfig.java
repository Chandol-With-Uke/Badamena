package com.example.model.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/graphql/**", "/graphiql/**").permitAll() // Permettre l'accès à GraphQL et GraphiQL
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable()); // Désactiver CSRF pour les API GraphQL

        return http.build();
    }
}
