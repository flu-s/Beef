package com.project.beef.controller;

import com.project.beef.dto.ShopResponse;
import com.project.beef.service.ShopFacadeService;
import com.project.beef.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopFacadeService shopFacadeService;

    @GetMapping
    public ResponseEntity<List<ShopResponse>> getNearby(
            @RequestParam(name = "lat") double lat,  // 👈 (name = "lat") 추가
            @RequestParam(name = "lng") double lng   // 👈 (name = "lng") 추가
    ) {
        System.out.println("📌 API 호출 좌표: lat=" + lat + ", lng=" + lng);
        return ResponseEntity.ok(shopFacadeService.searchNearby(lat, lng));
    }
}