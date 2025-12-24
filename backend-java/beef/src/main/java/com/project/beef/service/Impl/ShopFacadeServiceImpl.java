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

    private static final int MAX_DISTANCE = 3000; // 3km 이내만 허용

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {
        // 1️⃣ 카카오 데이터 가져오기 (실제 좌표 기반 검색이라 정확함)
        List<ShopResponse> kakao = kakaoShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 2️⃣ 네이버 데이터 가져오기 (참고용으로만 합침)
        List<ShopResponse> naver = naverShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> recalcDistance(shop, lat, lng))
                .filter(shop -> shop.getDistance() <= MAX_DISTANCE)
                .toList();

        // 3️⃣ 카카오 데이터를 우선순위에 두고 중복 제거 후 딱 5개만 반환
        return Stream.concat(kakao.stream(), naver.stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ShopResponse::getName, // 이름이 같으면 중복 제거
                                s -> s,
                                (existing, replacement) -> existing // 카카오 데이터 우선
                        ),
                        map -> map.values().stream()
                                .sorted(Comparator.comparingInt(ShopResponse::getDistance))
                                .limit(5) // 무조건 상위 5개 고정
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
