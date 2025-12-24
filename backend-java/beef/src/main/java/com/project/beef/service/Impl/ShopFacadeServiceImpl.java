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

    @Override
    public List<ShopResponse> searchNearby(double lat, double lng) {
        // 📌 중요: API 호출 시 매개변수로 받은 lat, lng를 그대로 전달해야 합니다.
        // 만약 기존에 서비스 내부에서 고정 좌표를 썼다면 여기서 다른 지역이 뜨는 것입니다.
        
        // 1. 카카오 API 결과 (사용자 현재 좌표 기준)
        List<ShopResponse> kakao = kakaoShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> updateDist(shop, lat, lng))
                .collect(Collectors.toList());

        // 2. 네이버 API 결과 (사용자 현재 좌표 기준)
        List<ShopResponse> naver = naverShopService.searchButcherShops(lat, lng)
                .stream()
                .map(shop -> updateDist(shop, lat, lng))
                .collect(Collectors.toList());

        // 3. 중복 제거 및 "사용자 좌표 기반" 거리순 상위 5개
        return Stream.concat(kakao.stream(), naver.stream())
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(ShopResponse::getName, s -> s, (a, b) -> a),
                        map -> map.values().stream()
                                .sorted(Comparator.comparingInt(ShopResponse::getDistance))
                                .limit(5)
                                .collect(Collectors.toList())
                ));
    }

    private ShopResponse updateDist(ShopResponse shop, double lat, double lng) {
        // 실제 좌표 간의 거리를 미터 단위로 계산
        int dist = DistanceUtils.calcMeter(lat, lng, shop.getLocation().lat(), shop.getLocation().lng());
        shop.setDistance(dist);
        return shop;
    }
}
