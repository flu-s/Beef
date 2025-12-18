package com.project.beef.dto.naver;

import lombok.Data;

@Data
public class NaverSearchItem {
    private String title;
    private String link;
    private String category;
    private String description;
    private String telephone;
    private String address;
    private String roadAddress;
    private String mapx;   // 네이버 좌표 (경도)
    private String mapy;   // 네이버 좌표 (위도)
}
