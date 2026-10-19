package com.kassa.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class KassaApiApplicationTest {

    @Test
    void contextLoads() {
        // Verifies that the Spring context starts up without errors
    }
}
