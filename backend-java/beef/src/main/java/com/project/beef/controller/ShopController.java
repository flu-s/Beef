package com.project.beef.controller;

import com.project.beef.dto.ShopResponse;
import com.project.beef.service.ShopFacadeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://beef-git-main-jins-projects-b6366790.vercel.app", allowCredentials = "true")
public class ShopController {

    private final ShopFacadeService shopFacadeService;

    @GetMapping
    public ResponseEntity<List<ShopResponse>> getNearby(
            @RequestParam(name = "lat") double lat,
            @RequestParam(name = "lng") double lng
    ) {
        // Render 실시간 로그 확인용
        System.out.println("📌 [Production Request] Lat: " + lat + ", Lng: " + lng);
        
        List<ShopResponse> results = shopFacadeService.searchNearby(lat, lng);
        
        System.out.println("✅ [Production Response] Found " + results.size() + " shops.");
        
        return ResponseEntity.ok(results);
    }
}
