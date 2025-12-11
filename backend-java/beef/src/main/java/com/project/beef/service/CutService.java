package com.project.beef.service;

import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.project.beef.domain.Cut;
import com.project.beef.dto.CutDto;
import com.project.beef.dto.SaveRequestDto;
import com.project.beef.repository.CutRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional 
@RequiredArgsConstructor
public class CutService {
    
    private final CutRepository cutRepository; 
    private final RestTemplate restTemplate; 

    private static final String AI_SERVER_URL = "http://localhost:5000";


    // ----------------------------------------------------
    // ⭐ 3. 부위 및 등급 분석을 순차적으로 실행하고 결과를 결합하는 핵심 메서드 ⭐
    // ----------------------------------------------------
    public CutDto analyzeAndCombine(MultipartFile file) throws Exception {
        
        // 🚨 I/O 스트림 재사용 오류 방지: 파일을 바이트 배열로 한 번만 복사 
        final byte[] fileBytes = file.getBytes();
        final String filename = file.getOriginalFilename();
        
        // 1. 부위 분석 실행 (수정된 시그니처 사용)
        CutDto partResult = analyzePart(fileBytes, filename); 
        
        // 2. 등급 분석 실행 (수정된 시그니처 사용)
        CutDto gradeResult = analyzeGrade(fileBytes, filename);
        
        // 3. 줄 바꿈을 적용하여 Insight 메시지 결합
        String combinedInsight = partResult.getInsight() 
                                 + "\n" 
                                 + "(등급 분석: " + gradeResult.getInsight() + ")";
        
        // 4. 최종 CutDto 구성 (마블링 비율은 null로 고정)
        return CutDto.builder()
            .status("success")
            .detectedPart(partResult.getDetectedPart())
            .detectedGrade(gradeResult.getDetectedGrade())
            .insight(combinedInsight)
            .memberId(null) 
            .build();
    }

    /**
     * 1. 부위 측정 서비스 로직: AI 서버의 부위 분석 엔드포인트를 호출합니다.
     * 시그니처 변경: MultipartFile 대신 byte[]와 filename을 받습니다.
     */
    public CutDto analyzePart(byte[] fileBytes, String filename) throws Exception {
        
        String url = AI_SERVER_URL + "/analyze/part"; 
        // 수정된 callAiServer 호출
        Map<String, Object> aiResponse = callAiServer(fileBytes, filename, url); 

        return CutDto.builder()
            .status("success")
            .detectedPart((String) aiResponse.get("detectedPart"))
            .insight((String) aiResponse.get("insight"))
            .detectedGrade(null)
            .memberId(null)
            .build();
    }

    /**
     * 2. 등급 측정 서비스 로직: AI 서버의 등급 분석 엔드포인트를 호출합니다.
     * 시그니처 변경: MultipartFile 대신 byte[]와 filename을 받습니다.
     */
    public CutDto analyzeGrade(byte[] fileBytes, String filename) throws Exception {
        
        String url = AI_SERVER_URL + "/analyze/grade"; 
        // 수정된 callAiServer 호출
        Map<String, Object> aiResponse = callAiServer(fileBytes, filename, url);

        return CutDto.builder()
            .status("success")
            .detectedGrade((String) aiResponse.get("detectedGrade"))
            .insight((String) aiResponse.get("insight"))
            .detectedPart(null)
            .memberId(null)
            .build();
    }
    
    // ⭐ callAiServer 시그니처 수정: byte[]와 filename을 받도록 변경 ⭐
    private Map<String, Object> callAiServer(byte[] fileBytes, String filename, String url) throws Exception {
        
        org.springframework.core.io.Resource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                // 전달받은 filename 사용
                return filename;
            }
        };
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource); 
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> aiResponse = restTemplate.postForObject(url, requestEntity, Map.class);
            if (aiResponse == null) {
                 throw new IllegalStateException("AI 서버로부터 유효한 응답을 받지 못했습니다.");
            }
            return aiResponse;
        } catch (Exception e) {
            throw new Exception("AI 분석 서버 통신 오류: " + e.getMessage());
        }
    }
    
    @Transactional
    public Cut saveAnalysisResult(SaveRequestDto dto) {
        
        Cut cut = Cut.builder()
            .detectedPart(dto.getDetectedPart())
            .detectedGrade(dto.getDetectedGrade())
            .insight(dto.getInsight())
            .fileName(dto.getFileName())
            .memberId(dto.getMemberId())
            .build();
            
        return cutRepository.save(cut);
    }
}