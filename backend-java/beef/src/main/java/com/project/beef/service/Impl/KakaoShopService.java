package com.project.beef.service.Impl;

import com.project.beef.dto.ShopResponse;
import com.project.beef.dto.kakao.KakaoSearchResponse;
import com.project.beef.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@Service("kakaoShopService")
@RequiredArgsConstructor
public class KakaoShopService implements ShopService {

    @Value("${kakao.rest.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<ShopResponse> searchButcherShops(double lat, double lng) {

        URI uri = UriComponentsBuilder
                .fromUriString("https://dapi.kakao.com")
                .path("/v2/local/search/keyword.json")
                .queryParam("query", "정육점")
                .queryParam("x", lng)
                .queryParam("y", lat)
                .queryParam("radius", 1000)
                .queryParam("page", 1)     // ⭐ 추가
                .queryParam("size", 10)    // ⭐ 추가 (1~15)
                .queryParam("sort", "distance") // ⭐ 추천
                .encode()                  // ⭐ 한글 query 필수
                .build()
                .toUri();
        System.out.println("📌 Kakao 요청 좌표 x=" + lng + ", y=" + lat);
        System.out.println("Kakao URI = " + uri);

        RequestEntity<Void> req = RequestEntity.get(uri)
                .header("Authorization", "KakaoAK " + kakaoApiKey)
                .build();

        ResponseEntity<KakaoSearchResponse> res =
                restTemplate.exchange(req, KakaoSearchResponse.class);

        KakaoSearchResponse body = res.getBody();
        if (body == null || body.getDocuments() == null) {
            return List.of();
        }

        return body.getDocuments().stream()
                .map(doc -> {
                    int distance = 0;
                    if (doc.getDistance() != null) {
                        distance = Integer.parseInt(doc.getDistance());
                    }

                    return new ShopResponse(
                            doc.getId(),
                            doc.getPlace_name(),
                            doc.getRoad_address_name(),
                            new ShopResponse.Location(
                                    Double.parseDouble(doc.getY()),
                                    Double.parseDouble(doc.getX())
                            ),
                            4.5,
                            distance,
                            true
                    );
                })
                .toList();
    }
}
