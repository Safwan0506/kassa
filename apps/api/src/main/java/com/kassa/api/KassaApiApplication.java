package com.kassa.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KassaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(KassaApiApplication.class, args);
    }
}
