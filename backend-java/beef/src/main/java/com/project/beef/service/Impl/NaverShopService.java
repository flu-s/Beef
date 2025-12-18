package com.project.beef.service.Impl;

import com.project.beef.dto.ShopResponse;
import com.project.beef.dto.naver.NaverSearchResponse; // 작성하신 DTO
import com.project.beef.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("naverShopService")
@RequiredArgsConstructor
public class NaverShopService implements ShopService {

    @Value("${naver.search.client.id}")
    private String clientId;

    @Value("${naver.search.client.secret}")
    private String clientSecret;

    @Override
    public List<ShopResponse> searchButcherShops(double lat, double lng) {
        // 1. 네이버 API 호출 준비
        URI uri = UriComponentsBuilder
                .fromUriString("https://openapi.naver.com")
                .path("/v1/search/local.json")
                .queryParam("query", "정육점") // 혹은 "강남구 정육점" 처럼 동적으로 지역명 추가 권장
                .queryParam("display", 5)
                .queryParam("start", 1)
                .queryParam("sort", "comment")
                .encode()
                .build()
                .toUri();

        RestTemplate restTemplate = new RestTemplate();

        RequestEntity<Void> req = RequestEntity
                .get(uri)
                .header("X-Naver-Client-Id", clientId)
                .header("X-Naver-Client-Secret", clientSecret)
                .build();

        // 2. 네이버 API 호출 및 응답 받기 (작성하신 DTO 사용!)
        ResponseEntity<NaverSearchResponse> response = restTemplate.exchange(req, NaverSearchResponse.class);

        // 3. 네이버 응답(NaverSearchResponse) -> 프론트엔드 응답(ShopResponse) 변환
        List<ShopResponse> shopList = new ArrayList<>();

        if (response.getBody() != null && response.getBody().getItems() != null) {
            shopList = response.getBody().getItems().stream().map(item -> {

                // [중요] mapx, mapy는 KATECH 좌표이므로 WGS84(위경도)로 변환해야 지도에 정확히 뜸.
                // 여기서는 예시로 입력받은 lat, lng 주변에 임의로 배치하는 가짜 로직을 넣습니다.
                // 실제 서비스시에는 GeoTrans 라이브러리 등을 써서 item.getMapx()를 변환해야 합니다.
                double convertedLat = lat + (Math.random() * 0.002 - 0.001);
                double convertedLng = lng + (Math.random() * 0.002 - 0.001);

                return new ShopResponse(
                        UUID.randomUUID().toString(),
                        cleanHtml(item.getTitle()),  // HTML 태그 제거 (<b/> 등)
                        item.getAddress(),
                        new ShopResponse.Location(convertedLat, convertedLng),
                        4.5, // 평점 정보는 검색 API에서 안 주므로 임의값
                        100, // 거리 계산 로직 필요
                        true
                );
            }).collect(Collectors.toList());
        }

        return shopList;
    }

    // HTML 태그 제거용 헬퍼 메소드
    private String cleanHtml(String input) {
        return input.replaceAll("<[^>]*>", "");
    }
}