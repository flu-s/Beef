package com.project.beef.controller;

import com.project.beef.dto.CutDto;
import com.project.beef.service.strategy.MeatAnalysisStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/cut")
@RequiredArgsConstructor
public class CutController {

    private final List<MeatAnalysisStrategy> strategies;

    @PostMapping("/analyze/{type}")
    public ResponseEntity<CutDto> analyze(
            @PathVariable("type") String type, 
            @RequestParam("file") MultipartFile file) {
        
        log.info("자동 저장 포함 분석 요청 - 고기: {}, 파일: {}", type, file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(CutDto.builder().status("error").insight("파일이 없습니다.").build());
        }

        MeatAnalysisStrategy strategy = strategies.stream()
                .filter(s -> s.getMeatType().equalsIgnoreCase(type))
                .findFirst()
                .orElse(null);

        if (strategy == null) {
            return ResponseEntity.badRequest().body(CutDto.builder().status("error").insight("지원하지 않는 타입입니다.").build());
        }

        try {
            // 이 호출이 Flask 통신 -> memberId 추출 -> DB 저장 -> 결과 반환을 모두 수행합니다.
            CutDto result = strategy.analyze(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("처리 중 에러 발생: ", e);
            return ResponseEntity.internalServerError().body(
                CutDto.builder().status("error").insight(e.getMessage()).build()
            );
        }
    }
}