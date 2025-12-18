package com.project.beef.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Data // Lombok 사용
@AllArgsConstructor
public class ShopResponse {
    private String id;
    private String name;
    private String address;
    private Location location; // 내부 클래스
    private double rating;
    private int distance;
    private boolean isOpen;
    public static record Location(double lat, double lng) {}
    public String getMapUrl() {
        return "https://map.kakao.com/link/map/"
                + URLEncoder.encode(name, StandardCharsets.UTF_8)
                + ","
                + location.lat()
                + ","
                + location.lng();
    }
}