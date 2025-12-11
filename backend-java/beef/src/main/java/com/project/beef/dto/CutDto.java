package com.project.beef.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CutDto {
    private String status;         // 통신 상태 (success/error)
    private String detectedPart;   // 부위 측정 결과
    private String detectedGrade;  // 등급 측정 결과
    private String insight;        // 분석 요약/코멘트
    private String memberId;
}