package com.project.beef.dto;

import lombok.AllArgsConstructor; 
import lombok.Builder;            
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@NoArgsConstructor
@AllArgsConstructor 
@Builder
public class SaveRequestDto {
    private String meatType;      // ⭐ 고기 종류 (BEEF / CHICKEN) 추가
    private String detectedPart;  // 판정된 부위 이름
    private String detectedGrade; // 판정된 등급 (닭고기는 "-"로 전송)
    private String insight;       // 분석 결과 상세 코멘트
    private String fileName;      // 업로드된 이미지 파일명 또는 경로
    private String memberId;      // 분석을 진행한 사용자 이메일/ID
}