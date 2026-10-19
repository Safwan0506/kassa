package com.kassa.api.service;

import com.kassa.api.dto.stock.StockLevelResponse;
import com.kassa.api.dto.stock.StockMovementResponse;
import com.kassa.api.entity.*;
import com.kassa.api.exception.BusinessException;
import com.kassa.api.exception.InsufficientStockException;
import com.kassa.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class StockServiceTest {

    @Autowired
    private StockService stockService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockLevelRepository stockLevelRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    private Shop shopA;
    private Shop shopB;
    private Product product;
    private UUID userId;

    @BeforeEach
    void setUp() {
        Organization org = organizationRepository.save(Organization.builder()
                .name("Test Org")
                .slug("test-org-stock")
                .build());

        shopA = shopRepository.save(Shop.builder()
                .name("Shop A")
                .address("Addr A")
                .organization(org)
                .build());

        shopB = shopRepository.save(Shop.builder()
                .name("Shop B")
                .address("Addr B")
                .organization(org)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Test Category")
                .organization(org)
                .build());

        product = productRepository.save(Product.builder()
                .sku("TST-001")
                .name("Test Product")
                .category(category)
                .unit("piece")
                .buyPrice(new BigDecimal("1000"))
                .sellPrice(new BigDecimal("1500"))
                .organization(org)
                .build());

        AppUser user = appUserRepository.save(AppUser.builder()
                .email("stock-test@kassa.com")
                .passwordHash("hashed")
                .firstName("Stock")
                .lastName("Tester")
                .organization(org)
                .build());
        userId = user.getId();
    }

    @Test
    @DisplayName("addEntry creates stock level and movement")
    void addEntry() {
        StockMovementResponse response = stockService.addEntry(
                shopA.getId(), product.getId(), 25, "Initial stock", userId);

        assertNotNull(response.getId());
        assertEquals("ENTRY", response.getType());
        assertEquals(25, response.getQuantity());

        // Verify stock level was updated
        List<StockLevelResponse> levels = stockService.getStockLevels(shopA.getId());
        assertEquals(1, levels.size());
        assertEquals(25, levels.get(0).getQuantity());
    }

    @Test
    @DisplayName("removeStock decrements quantity and creates EXIT movement")
    void removeStock() {
        // First add stock
        stockService.addEntry(shopA.getId(), product.getId(), 50, "Initial", userId);

        // Then remove
        StockMovementResponse response = stockService.removeStock(
                shopA.getId(), product.getId(), 20, "Sold", userId);

        assertEquals("EXIT", response.getType());
        assertEquals(20, response.getQuantity());

        // Verify remaining stock
        List<StockLevelResponse> levels = stockService.getStockLevels(shopA.getId());
        assertEquals(30, levels.get(0).getQuantity());
    }

    @Test
    @DisplayName("removeStock rejects when quantity would go negative")
    void removeStockNegativeRejected() {
        // Add 10
        stockService.addEntry(shopA.getId(), product.getId(), 10, "Initial", userId);

        // Try to remove 15 — should fail
        assertThrows(InsufficientStockException.class, () ->
                stockService.removeStock(shopA.getId(), product.getId(), 15, "Too much", userId));

        // Stock should remain unchanged
        List<StockLevelResponse> levels = stockService.getStockLevels(shopA.getId());
        assertEquals(10, levels.get(0).getQuantity());
    }

    @Test
    @DisplayName("transferStock moves quantity between shops atomically")
    void transferStock() {
        // Stock shop A with 100
        stockService.addEntry(shopA.getId(), product.getId(), 100, "Initial A", userId);
        // Stock shop B with 20
        stockService.addEntry(shopB.getId(), product.getId(), 20, "Initial B", userId);

        // Transfer 30 from A to B
        stockService.transferStock(
                shopA.getId(), shopB.getId(), product.getId(), 30, "Rebalance", userId);

        // Check shop A: 100 - 30 = 70
        List<StockLevelResponse> levelsA = stockService.getStockLevels(shopA.getId());
        assertEquals(70, levelsA.get(0).getQuantity());

        // Check shop B: 20 + 30 = 50
        List<StockLevelResponse> levelsB = stockService.getStockLevels(shopB.getId());
        assertEquals(50, levelsB.get(0).getQuantity());
    }

    @Test
    @DisplayName("transferStock rejects insufficient source stock")
    void transferStockInsufficientSource() {
        stockService.addEntry(shopA.getId(), product.getId(), 10, "Initial A", userId);

        assertThrows(InsufficientStockException.class, () ->
                stockService.transferStock(
                        shopA.getId(), shopB.getId(), product.getId(), 20, "Too much", userId));
    }

    @Test
    @DisplayName("transferStock rejects same source and destination")
    void transferStockSameShop() {
        stockService.addEntry(shopA.getId(), product.getId(), 10, "Initial", userId);

        assertThrows(BusinessException.class, () ->
                stockService.transferStock(
                        shopA.getId(), shopA.getId(), product.getId(), 5, "Same shop", userId));
    }

    @Test
    @DisplayName("adjustStock sets exact quantity and records movement")
    void adjustStock() {
        stockService.addEntry(shopA.getId(), product.getId(), 50, "Initial", userId);

        StockMovementResponse response = stockService.adjustStock(
                shopA.getId(), product.getId(), 42, "Inventory count", userId);

        assertEquals("ADJUSTMENT", response.getType());
        assertEquals(-8, response.getQuantity()); // diff: 42 - 50 = -8

        List<StockLevelResponse> levels = stockService.getStockLevels(shopA.getId());
        assertEquals(42, levels.get(0).getQuantity());
    }

    @Test
    @DisplayName("adjustStock rejects negative target quantity")
    void adjustStockRejectsNegative() {
        stockService.addEntry(shopA.getId(), product.getId(), 10, "Initial", userId);

        assertThrows(BusinessException.class, () ->
                stockService.adjustStock(shopA.getId(), product.getId(), -5, "Bad", userId));
    }

    @Test
    @DisplayName("getMovements returns paginated movement history")
    void getMovements() {
        stockService.addEntry(shopA.getId(), product.getId(), 50, "Entry 1", userId);
        stockService.addEntry(shopA.getId(), product.getId(), 30, "Entry 2", userId);
        stockService.removeStock(shopA.getId(), product.getId(), 10, "Exit 1", userId);

        Page<StockMovementResponse> page = stockService.getMovements(
                shopA.getId(), product.getId(), null, PageRequest.of(0, 10));

        assertEquals(3, page.getTotalElements());
    }

    @Test
    @DisplayName("transfer creates two linked movements with shared referenceId")
    void transferCreatesLinkedMovements() {
        stockService.addEntry(shopA.getId(), product.getId(), 100, "Initial", userId);

        stockService.transferStock(
                shopA.getId(), shopB.getId(), product.getId(), 25, "Transfer", userId);

        // Get movements for shop A — should have ENTRY + TRANSFER_OUT
        Page<StockMovementResponse> movementsA = stockService.getMovements(
                shopA.getId(), product.getId(), null, PageRequest.of(0, 10));
        assertEquals(2, movementsA.getTotalElements());

        // Get movements for shop B — should have TRANSFER_IN only (stock level was auto-created, not via addEntry)
        Page<StockMovementResponse> movementsB = stockService.getMovements(
                shopB.getId(), product.getId(), null, PageRequest.of(0, 10));
        assertEquals(1, movementsB.getTotalElements());

        // Verify TRANSFER_OUT and TRANSFER_IN share the same referenceId
        StockMovementResponse transferOut = movementsA.getContent().stream()
                .filter(m -> "TRANSFER_OUT".equals(m.getType()))
                .findFirst().orElseThrow();
        StockMovementResponse transferIn = movementsB.getContent().stream()
                .filter(m -> "TRANSFER_IN".equals(m.getType()))
                .findFirst().orElseThrow();

        assertNotNull(transferOut.getReferenceId());
        assertEquals(transferOut.getReferenceId(), transferIn.getReferenceId());
    }
}
