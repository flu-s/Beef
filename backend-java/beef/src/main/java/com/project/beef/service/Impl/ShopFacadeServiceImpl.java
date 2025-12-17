package com.project.beef.service.Impl;

import com.project.beef.dto.ShopResponse;
import com.project.beef.service.ShopFacadeService;
import com.project.beef.util.DistanceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ShopFacadeServiceImpl implements ShopFacadeService {

    private final KakaoShopService kakaoShopService;
    private final NaverShopService naverShopService;

    private static final int MAX_DISTANCE = 3000; // 3km

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {

        // 1️⃣ 카카오: 정확한 위치 기반
        List<ShopResponse> kakao = kakaoShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 🔥 카카오 결과가 충분하면 네이버 호출 안 함
        if (kakao.size() >= 10) {
            return kakao;
        }

        // 2️⃣ 네이버: 보조 데이터 (거리 필터 필수)
        List<ShopResponse> naver = naverShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 3️⃣ 합치고 정렬
        return Stream.concat(kakao.stream(), naver.stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ShopResponse::getName,
                                s -> s,
                                (a, b) -> a // 중복 제거
                        ),
                        map -> map.values().stream()
                                .sorted(Comparator.comparingInt(ShopResponse::getDistance))
                                .toList()
                ));
    }

    private ShopResponse recalcDistance(ShopResponse shop, double lat, double lng) {
        int distance = DistanceUtils.calcMeter(
                lat, lng,
                shop.getLocation().lat(),
                shop.getLocation().lng()
        );
        shop.setDistance(distance);
        return shop;
    }
}
