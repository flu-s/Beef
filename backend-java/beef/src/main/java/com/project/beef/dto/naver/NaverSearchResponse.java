package com.project.beef.dto.naver;

import lombok.Data;
import java.util.List;

@Data
public class NaverSearchResponse {
    private String lastBuildDate;
    private int total;
    private int start;
    private int display;
    private List<NaverSearchItem> items;
}