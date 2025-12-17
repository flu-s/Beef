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
    private String status;         // 통신 상태 (success / error)
    private String meatType;       // 고기 종류 (BEEF / CHICKEN) ⭐ 추가
    private String detectedPart;   // AI가 판정한 부위 이름
    private String detectedGrade;  // AI가 판정한 등급 (닭고기는 "-" 또는 "N/A")
    private String partConfidence; // 부위 분석 확률 (예: "95.5%")
    private String gradeConfidence;// 등급 분석 확률 (소고기 전용, 닭고기는 null)
    private String insight;        // 분석 결과에 대한 요약 설명문
    private String memberId;       // 분석을 요청한 사용자의 ID (이메일 등)
}