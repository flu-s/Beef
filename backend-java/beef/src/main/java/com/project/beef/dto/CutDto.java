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
    private String status;           // 통신 상태 (success / error)
    private String meatType;         // 고기 종류 (BEEF / CHICKEN)
    private String detectedPart;     // AI가 판정한 부위 이름
    private String detectedGrade;    // AI가 판정한 등급
    private String partConfidence;   // 부위 분석 확률
    private String gradeConfidence;  // 등급 분석 확률
    private String insight;          // 분석 결과에 대한 요약 설명문
    private String memberId;         // 분석을 요청한 사용자의 ID
}
