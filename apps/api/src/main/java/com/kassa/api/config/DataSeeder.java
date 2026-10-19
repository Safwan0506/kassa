package com.kassa.api.config;

import com.kassa.api.entity.*;
import com.kassa.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository userRepository;
    private final ShopRepository shopRepository;
    private final UserShopRepository userShopRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "Kassa2024!";

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@kassa.com")) {
            log.info("Seed data already exists, skipping.");
            return;
        }

        log.info("Seeding demo data...");

        // Organization
        Organization org = organizationRepository.save(Organization.builder()
                .name("Boutique Demo")
                .slug("boutique-demo")
                .build());

        // Shops
        Shop shopAkwa = shopRepository.save(Shop.builder()
                .name("Boutique Akwa")
                .address("Rue Joss, Akwa, Douala")
                .organization(org)
                .build());

        Shop shopBonaberi = shopRepository.save(Shop.builder()
                .name("Boutique Bonaberi")
                .address("Carrefour Bonaberi, Douala")
                .organization(org)
                .build());

        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        // Admin (PROPRIETAIRE) — assigned to both shops
        AppUser admin = userRepository.save(AppUser.builder()
                .email("admin@kassa.com")
                .passwordHash(encodedPassword)
                .firstName("Admin")
                .lastName("Kassa")
                .organization(org)
                .build());

        userShopRepository.save(UserShop.builder()
                .user(admin).shop(shopAkwa).role(ShopRole.PROPRIETAIRE).build());
        userShopRepository.save(UserShop.builder()
                .user(admin).shop(shopBonaberi).role(ShopRole.PROPRIETAIRE).build());

        // Gerant — assigned to Boutique Akwa
        AppUser gerant = userRepository.save(AppUser.builder()
                .email("gerant@kassa.com")
                .passwordHash(encodedPassword)
                .firstName("Gerant")
                .lastName("Demo")
                .organization(org)
                .build());

        userShopRepository.save(UserShop.builder()
                .user(gerant).shop(shopAkwa).role(ShopRole.GERANT).build());

        // Caissier — assigned to Boutique Bonaberi
        AppUser caissier = userRepository.save(AppUser.builder()
                .email("caissier@kassa.com")
                .passwordHash(encodedPassword)
                .firstName("Caissier")
                .lastName("Demo")
                .organization(org)
                .build());

        userShopRepository.save(UserShop.builder()
                .user(caissier).shop(shopBonaberi).role(ShopRole.CAISSIER).build());

        log.info("Demo data seeded successfully.");
    }
}
