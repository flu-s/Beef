package com.project.beef.dto.kakao;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KakaoPlaceDocument {
    private String id;
    private String place_name;
    private String address_name;
    private String road_address_name;
    private String x; // longitude
    private String y; // latitude
    private String distance;
}