package com.project.beef.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.beef.domain.Cut;
import com.project.beef.dto.CutDto;
import com.project.beef.dto.SaveRequestDto;
import com.project.beef.service.CutService;

import java.security.Principal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cut")
@RequiredArgsConstructor
public class CutController {

	private final CutService cutService;

	/**
     * POST /api/cut/analyze : 부위 측정 + 등급 측정 + Insight 결합 + DB 저장 통합 API
     */
    @PostMapping("/analyze")
    public ResponseEntity<CutDto> analyzeAndSave(@RequestParam("file") MultipartFile file, Principal principal) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                CutDto.builder().status("error").insight("업로드할 파일이 없습니다.").build()
            ); 
        }

        String memberId = null;
        if (principal != null && principal.getName() != null) {
        	memberId = principal.getName();
        	System.out.println("DEBUG: 현재 로그인 사용자 ID: " + memberId);
        } else {
        	memberId = "ANONYMOUS"; // 익명 사용자 처리
        	System.err.println("경고: 인증 정보(Principal)가 없어 memberId를 ANONYMOUS 처리합니다.");
        }
        
        try {
            CutDto resultDto = cutService.analyzeAndCombine(file);
            
            SaveRequestDto saveRequest = SaveRequestDto.builder()
                .detectedPart(resultDto.getDetectedPart())
                .detectedGrade(resultDto.getDetectedGrade())
                .insight(resultDto.getInsight())
                .fileName(file.getOriginalFilename())
                .memberId(memberId)
                .build();
                
            cutService.saveAnalysisResult(saveRequest);

            // 3. 최종 결과 반환
            return ResponseEntity.ok(resultDto);
        } catch (Exception e) {
            System.err.println("❌ 분석 및 저장 중 치명적인 오류 발생: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body(
                CutDto.builder()
                    .status("error")
                    .insight("분석 서버 통신 오류 또는 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build()
            );
        }
    }

	@PostMapping("/grade")
	public ResponseEntity<?> analyzeGrade(@RequestParam("file") MultipartFile file, HttpServletRequest request) {

		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body("업로드할 파일이 없습니다.");
		}

		try {
			final byte[] fileBytes = file.getBytes();
			final String filename = file.getOriginalFilename();

			CutDto gradeResult = cutService.analyzeGrade(fileBytes, filename);
			return ResponseEntity.ok(gradeResult);

		} catch (Exception e) {
			System.err.println("등급 분석 중 오류 발생: " + e.getMessage());
			return ResponseEntity.internalServerError().body("등급 분석 처리 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/save")
	public ResponseEntity<?> saveResult(@RequestBody SaveRequestDto saveRequest) {
		try {
			Cut savedCut = cutService.saveAnalysisResult(saveRequest);
			return ResponseEntity.ok(savedCut.getId());
		} catch (Exception e) {
			System.err.println("저장 중 오류 발생: " + e.getMessage());
			return ResponseEntity.internalServerError().body("결과 저장 처리 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}