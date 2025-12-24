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

    // 최대 반경 3km 이내 상점만 필터링
    private static final int MAX_DISTANCE = 3000;

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {
        // 1. 카카오 API 데이터 (정확한 좌표 기반)
        List<ShopResponse> kakao = kakaoShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> updateRealDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .collect(Collectors.toList());

        // 2. 네이버 API 데이터
        List<ShopResponse> naver = naverShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> updateRealDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .collect(Collectors.toList());

        // 3. 중복 제거(상점 이름 기준) 및 거리순 정렬 후 5개 제한
        return Stream.concat(kakao.stream(), naver.stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ShopResponse::getName,
                                s -> s,
                                (existing, replacement) -> existing // 중복 시 카카오 데이터 우선
                        ),
                        map -> map.values().stream()
                                .sorted(Comparator.comparingInt(ShopResponse::getDistance))
                                .limit(5) // 딱 5개만 반환
                                .collect(Collectors.toList())
                ));
    }

    // 위경도 기반 실거리 계산 로직 적용
    private ShopResponse updateRealDistance(ShopResponse shop, double lat, double lng) {
        int distance = DistanceUtils.calcMeter(
                lat, lng,
                shop.getLocation().lat(),
                shop.getLocation().lng()
        );
        shop.setDistance(distance);
        return shop;
    }
}
