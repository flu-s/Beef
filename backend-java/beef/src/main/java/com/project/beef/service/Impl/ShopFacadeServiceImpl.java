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
        // 1️⃣ 카카오 데이터 가져오기 (기존 동일)
        List<ShopResponse> kakao = kakaoShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 2️⃣ 네이버 데이터 가져오기 (기존 동일)
        List<ShopResponse> naver = naverShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 3️⃣ 합치고, 중복 제거 후, 거리순 정렬하여 딱 5개만 반환 🔥
        return Stream.concat(kakao.stream(), naver.stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ShopResponse::getName,
                                s -> s,
                                (a, b) -> a 
                        ),
                        map -> map.values().stream()
                                .sorted(Comparator.comparingInt(ShopResponse::getDistance))
                                .limit(5) // 👈 여기서 5개로 제한합니다.
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
