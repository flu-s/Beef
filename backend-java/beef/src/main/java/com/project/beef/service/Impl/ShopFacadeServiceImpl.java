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

    public ShopFacadeServiceImpl(@Qualifier("kakaoShopService") ShopService kakaoShopService) {
        this.kakaoShopService = kakaoShopService;
    }

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {
        // 1. 좌표를 정확히 지원하는 카카오 데이터만 먼저 가져옵니다.
        List<ShopResponse> kakaoShops = kakaoShopService.searchButcherShops(lat, lng);

        // 2. 각 상점의 거리를 내 현재 위치(lat, lng) 기준으로 다시 정확히 계산합니다.
        return kakaoShops.stream()
                .map(shop -> {
                    int actualDist = DistanceUtils.calcMeter(lat, lng, shop.getLocation().lat(), shop.getLocation().lng());
                    shop.setDistance(actualDist);
                    return shop;
                })
                .filter(shop -> shop.getDistance() <= 3000) // 3km 이내만
                .sorted(Comparator.comparingInt(ShopResponse::getDistance)) // 거리순 정렬
                .limit(5) // 상위 5개
                .collect(Collectors.toList());
    }
}
