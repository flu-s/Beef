package com.project.beef.service.Impl;

import com.project.beef.dto.ShopResponse;
import com.project.beef.service.ShopFacadeService;
import com.project.beef.service.ShopService;
import com.project.beef.util.DistanceUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShopFacadeServiceImpl implements ShopFacadeService {

    private final ShopService kakaoShopService;

    // ✅ 카카오 서비스만 사용하도록 주입 (네이버는 좌표 검색이 안 되어 부정확함)
    public ShopFacadeServiceImpl(@Qualifier("kakaoShopService") ShopService kakaoShopService) {
        this.kakaoShopService = kakaoShopService;
    }

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {
        // 1. 프론트엔드에서 보내준 실시간 좌표(수원역 등)로 카카오 API 호출
        List<ShopResponse> shops = kakaoShopService.searchButcherShops(lat, lng);

        if (shops == null || shops.isEmpty()) return List.of();

        // 2. 검색된 상점들의 거리를 내 위치 기준으로 다시 한 번 정확히 계산
        return shops.stream()
                .map(shop -> {
                    int dist = DistanceUtils.calcMeter(lat, lng, 
                                 shop.getLocation().lat(), shop.getLocation().lng());
                    shop.setDistance(dist);
                    return shop;
                })
                .sorted(Comparator.comparingInt(ShopResponse::getDistance)) // 가까운 순 정렬
                .limit(5) // 상위 5개
                .collect(Collectors.toList());
    }
}
