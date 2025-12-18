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
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        System.out.println("📌 Kakao 요청 좌표 x=" + lng + ", y=" + lat);
        return ResponseEntity.ok(

                shopFacadeService.searchNearby(lat, lng)
        );
    }
}