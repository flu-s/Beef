package com.project.beef.dto.kakao;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class KakaoSearchResponse {
    private List<KakaoPlaceDocument> documents;
}