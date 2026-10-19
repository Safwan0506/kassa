package com.kassa.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kassa.api.dto.product.ProductRequest;
import com.kassa.api.entity.*;
import com.kassa.api.repository.*;
import com.kassa.api.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserShopRepository userShopRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Cookie accessCookie;
    private Organization org;
    private Category category;

    // Second organization for isolation tests
    private Organization otherOrg;
    private Cookie otherAccessCookie;

    @BeforeEach
    void setUp() {
        // Organization 1
        org = organizationRepository.save(Organization.builder()
                .name("Test Org")
                .slug("test-org-prod")
                .build());

        Shop shop = shopRepository.save(Shop.builder()
                .name("Test Shop")
                .address("123 Test St")
                .organization(org)
                .build());

        AppUser user = userRepository.save(AppUser.builder()
                .email("prodtest@kassa.com")
                .passwordHash(passwordEncoder.encode("Test123!"))
                .firstName("Prod")
                .lastName("Tester")
                .organization(org)
                .build());

        userShopRepository.save(UserShop.builder()
                .user(user).shop(shop).role(ShopRole.MAGASINIER).build());

        String token = jwtService.generateAccessToken(user.getId(), user.getEmail(), org.getId());
        accessCookie = new Cookie("access_token", token);

        category = categoryRepository.save(Category.builder()
                .name("Electronics")
                .organization(org)
                .build());

        // Organization 2 (for isolation test)
        otherOrg = organizationRepository.save(Organization.builder()
                .name("Other Org")
                .slug("other-org-prod")
                .build());

        Shop otherShop = shopRepository.save(Shop.builder()
                .name("Other Shop")
                .address("456 Other St")
                .organization(otherOrg)
                .build());

        AppUser otherUser = userRepository.save(AppUser.builder()
                .email("other-prodtest@kassa.com")
                .passwordHash(passwordEncoder.encode("Test123!"))
                .firstName("Other")
                .lastName("Tester")
                .organization(otherOrg)
                .build());

        userShopRepository.save(UserShop.builder()
                .user(otherUser).shop(otherShop).role(ShopRole.MAGASINIER).build());

        String otherToken = jwtService.generateAccessToken(
                otherUser.getId(), otherUser.getEmail(), otherOrg.getId());
        otherAccessCookie = new Cookie("access_token", otherToken);
    }

    @Test
    @DisplayName("POST /api/products creates product and returns 201")
    void createProduct() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .sku("ELEC-001")
                .name("Laptop Dell")
                .barcode("1234567890123")
                .description("Dell Latitude 15 inch")
                .categoryId(category.getId())
                .unit("piece")
                .buyPrice(new BigDecimal("450000"))
                .sellPrice(new BigDecimal("550000"))
                .tvaRate(new BigDecimal("19.25"))
                .alertThreshold(3)
                .build();

        mockMvc.perform(post("/api/products")
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("ELEC-001"))
                .andExpect(jsonPath("$.name").value("Laptop Dell"))
                .andExpect(jsonPath("$.categoryName").value("Electronics"))
                .andExpect(jsonPath("$.sellPrice").value(550000))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("GET /api/products returns paginated products")
    void getAllProducts() throws Exception {
        // Create 2 products
        createTestProduct("SKU-A", "Product A");
        createTestProduct("SKU-B", "Product B");

        mockMvc.perform(get("/api/products")
                        .cookie(accessCookie)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/products/{id} returns single product")
    void getProductById() throws Exception {
        Product p = createTestProduct("SKU-GET", "Get Test");

        mockMvc.perform(get("/api/products/" + p.getId())
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-GET"))
                .andExpect(jsonPath("$.name").value("Get Test"));
    }

    @Test
    @DisplayName("PUT /api/products/{id} updates product")
    void updateProduct() throws Exception {
        Product p = createTestProduct("SKU-UPD", "Original Name");

        ProductRequest updateReq = ProductRequest.builder()
                .sku("SKU-UPD")
                .name("Updated Name")
                .buyPrice(new BigDecimal("2000"))
                .sellPrice(new BigDecimal("3000"))
                .build();

        mockMvc.perform(put("/api/products/" + p.getId())
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.sellPrice").value(3000));
    }

    @Test
    @DisplayName("DELETE /api/products/{id} removes product")
    void deleteProduct() throws Exception {
        Product p = createTestProduct("SKU-DEL", "Delete Me");

        mockMvc.perform(delete("/api/products/" + p.getId())
                        .cookie(accessCookie))
                .andExpect(status().isNoContent());

        // Verify it's gone
        mockMvc.perform(get("/api/products/" + p.getId())
                        .cookie(accessCookie))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/products/search filters by name")
    void searchByName() throws Exception {
        createTestProduct("SKU-APPLE", "Apple iPhone");
        createTestProduct("SKU-SAMSUNG", "Samsung Galaxy");

        mockMvc.perform(get("/api/products/search")
                        .cookie(accessCookie)
                        .param("q", "apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Apple iPhone"));
    }

    @Test
    @DisplayName("Organization isolation: user from org2 cannot see org1 products")
    void organizationIsolation() throws Exception {
        Product p = createTestProduct("SKU-ISO", "Isolated Product");

        // Other org user should get 404
        mockMvc.perform(get("/api/products/" + p.getId())
                        .cookie(otherAccessCookie))
                .andExpect(status().isNotFound());

        // Other org user's product list should be empty
        mockMvc.perform(get("/api/products")
                        .cookie(otherAccessCookie)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("POST /api/products without auth returns 403")
    void createProductUnauthorized() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .sku("NOAUTH-001")
                .name("No Auth Product")
                .build();

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Duplicate SKU in same org is rejected")
    void duplicateSkuRejected() throws Exception {
        createTestProduct("DUP-SKU", "First Product");

        ProductRequest request = ProductRequest.builder()
                .sku("DUP-SKU")
                .name("Second Product")
                .buyPrice(new BigDecimal("1000"))
                .sellPrice(new BigDecimal("2000"))
                .build();

        mockMvc.perform(post("/api/products")
                        .cookie(accessCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("SKU")));
    }

    private Product createTestProduct(String sku, String name) {
        return productRepository.save(Product.builder()
                .sku(sku)
                .name(name)
                .buyPrice(new BigDecimal("1000"))
                .sellPrice(new BigDecimal("1500"))
                .organization(org)
                .build());
    }
}
