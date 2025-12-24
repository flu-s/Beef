package com.project.beef.service.Impl;

import com.project.beef.dto.ShopResponse;
import com.project.beef.dto.naver.NaverSearchResponse;
import com.project.beef.service.ShopService;
import com.project.beef.util.DistanceUtils; // 거리 계산 유틸 필요
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
        // 1. 네이버 로컬 API는 좌표를 직접 받지 않으므로 검색어에 "정육점"만 넣으면 서울 위주로 나옵니다.
        // 이를 방지하기 위해 Kakao에서 데이터를 주로 가져오거나, 검색어를 보강해야 합니다.
        
        URI uri = UriComponentsBuilder
                .fromUriString("https://openapi.naver.com")
                .path("/v1/search/local.json")
                .queryParam("query", "정육점") // ⚠️ 좌표 기반이 아니어서 한계가 있음
                .queryParam("display", 10)
                .queryParam("start", 1)
                .queryParam("sort", "random") // 거리순 지원 안함
                .encode()
                .build()
                .toUri();

        RestTemplate restTemplate = new RestTemplate();
        RequestEntity<Void> req = RequestEntity.get(uri)
                .header("X-Naver-Client-Id", clientId)
                .header("X-Naver-Client-Secret", clientSecret)
                .build();

        ResponseEntity<NaverSearchResponse> response = restTemplate.exchange(req, NaverSearchResponse.class);
        List<ShopResponse> shopList = new ArrayList<>();

        if (response.getBody() != null && response.getBody().getItems() != null) {
            shopList = response.getBody().getItems().stream().map(item -> {
                // ⚠️ 가짜 로직 대신 고정 좌표를 피하기 위해 임시로 아주 먼 곳으로 처리하거나
                // 네이버 데이터가 현재 위치와 너무 다르면 필터링되도록 거리를 0으로 일단 둡니다.
                // (이후 ShopFacadeService에서 거리 계산 시 걸러짐)
                
                return new ShopResponse(
                        UUID.randomUUID().toString(),
                        cleanHtml(item.getTitle()),
                        item.getAddress(),
                        new ShopResponse.Location(0.0, 0.0), // 좌표 변환 전까지는 0.0 처리 권장
                        4.5,
                        9999, // 매우 먼 거리로 초기화
                        true
                );
            }).collect(Collectors.toList());
        }

        // 네이버 데이터가 신뢰도가 낮으므로 빈 리스트를 반환하거나 
        // 카카오 데이터만 쓰도록 유도하는 것이 정확도 면에서 좋습니다.
        return new ArrayList<>(); 
    }

    private String cleanHtml(String input) {
        return input == null ? "" : input.replaceAll("<[^>]*>", "");
    }
}
