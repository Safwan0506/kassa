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

import java.math.BigDecimal;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final OrganizationRepository organizationRepository;
    private final AppUserRepository userRepository;
    private final ShopRepository shopRepository;
    private final UserShopRepository userShopRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final StockLevelRepository stockLevelRepository;
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

        // ============================
        // Phase 2: Catalogue seed data
        // ============================

        // Categories
        Category catAlimentaire = categoryRepository.save(Category.builder()
                .name("Alimentaire")
                .organization(org)
                .build());

        Category catBoissons = categoryRepository.save(Category.builder()
                .name("Boissons")
                .organization(org)
                .build());

        Category catDivers = categoryRepository.save(Category.builder()
                .name("Divers")
                .organization(org)
                .build());

        // Suppliers
        Supplier fournisseurNdoua = supplierRepository.save(Supplier.builder()
                .name("Fournisseur Ndoua & Fils")
                .phone("+237 699 123 456")
                .email("ndoua@fournisseur.cm")
                .address("Marche Central, Douala")
                .organization(org)
                .build());

        Supplier fournisseurSABC = supplierRepository.save(Supplier.builder()
                .name("SABC Distribution")
                .phone("+237 677 987 654")
                .email("distribution@sabc.cm")
                .address("Zone Industrielle Bassa, Douala")
                .organization(org)
                .build());

        // Products (8 products with prices in FCFA)
        Product riz = productRepository.save(Product.builder()
                .sku("ALI-001")
                .barcode("6001234560001")
                .name("Riz Oncle Sam 5kg")
                .description("Sac de riz long grain 5kg")
                .category(catAlimentaire)
                .unit("sac")
                .buyPrice(new BigDecimal("3500"))
                .sellPrice(new BigDecimal("4500"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(10)
                .organization(org)
                .build());

        Product huile = productRepository.save(Product.builder()
                .sku("ALI-002")
                .barcode("6001234560002")
                .name("Huile Vegetale Mayor 1L")
                .description("Huile de palme raffinee 1 litre")
                .category(catAlimentaire)
                .unit("bouteille")
                .buyPrice(new BigDecimal("1200"))
                .sellPrice(new BigDecimal("1500"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(15)
                .organization(org)
                .build());

        Product sucre = productRepository.save(Product.builder()
                .sku("ALI-003")
                .barcode("6001234560003")
                .name("Sucre en poudre 1kg")
                .description("Sucre blanc en poudre sachet 1kg")
                .category(catAlimentaire)
                .unit("sachet")
                .buyPrice(new BigDecimal("800"))
                .sellPrice(new BigDecimal("1000"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(20)
                .organization(org)
                .build());

        Product biere33 = productRepository.save(Product.builder()
                .sku("BOI-001")
                .barcode("6001234560004")
                .name("Biere 33 Export 65cl")
                .description("Biere blonde 33 Export grande bouteille")
                .category(catBoissons)
                .unit("bouteille")
                .buyPrice(new BigDecimal("500"))
                .sellPrice(new BigDecimal("700"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(24)
                .organization(org)
                .build());

        Product coca = productRepository.save(Product.builder()
                .sku("BOI-002")
                .barcode("6001234560005")
                .name("Coca-Cola 50cl")
                .description("Coca-Cola bouteille plastique 50cl")
                .category(catBoissons)
                .unit("bouteille")
                .buyPrice(new BigDecimal("300"))
                .sellPrice(new BigDecimal("400"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(30)
                .organization(org)
                .build());

        Product eau = productRepository.save(Product.builder()
                .sku("BOI-003")
                .barcode("6001234560006")
                .name("Eau Minerale Supermont 1.5L")
                .description("Eau minerale naturelle 1.5 litre")
                .category(catBoissons)
                .unit("bouteille")
                .buyPrice(new BigDecimal("250"))
                .sellPrice(new BigDecimal("350"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(30)
                .organization(org)
                .build());

        Product savon = productRepository.save(Product.builder()
                .sku("DIV-001")
                .barcode("6001234560007")
                .name("Savon de Marseille 200g")
                .description("Savon de menage multi-usage")
                .category(catDivers)
                .unit("piece")
                .buyPrice(new BigDecimal("250"))
                .sellPrice(new BigDecimal("400"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(20)
                .organization(org)
                .build());

        Product cahier = productRepository.save(Product.builder()
                .sku("DIV-002")
                .barcode("6001234560008")
                .name("Cahier 200 pages")
                .description("Cahier quadrille 200 pages grand format")
                .category(catDivers)
                .unit("piece")
                .buyPrice(new BigDecimal("500"))
                .sellPrice(new BigDecimal("750"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(10)
                .organization(org)
                .build());

        // Stock levels — Boutique Akwa
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(riz).quantity(50).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(huile).quantity(40).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(sucre).quantity(60).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(biere33).quantity(120).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(coca).quantity(80).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(eau).quantity(100).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(savon).quantity(45).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopAkwa).product(cahier).quantity(30).build());

        // Stock levels — Boutique Bonaberi
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(riz).quantity(35).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(huile).quantity(25).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(sucre).quantity(40).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(biere33).quantity(80).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(coca).quantity(60).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(eau).quantity(70).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(savon).quantity(30).build());
        stockLevelRepository.save(StockLevel.builder().shop(shopBonaberi).product(cahier).quantity(20).build());

        log.info("Demo data seeded successfully (Phase 1 + Phase 2).");
    }
}
