package com.kassa.api.repository;

import com.kassa.api.entity.UserShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserShopRepository extends JpaRepository<UserShop, UUID> {

    List<UserShop> findByUserId(UUID userId);
}
