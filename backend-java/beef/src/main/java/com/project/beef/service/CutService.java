package com.project.beef.service;

import java.util.Map;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.project.beef.domain.Cut;
import com.project.beef.dto.CutDto;
import com.project.beef.repository.CutRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CutService {
    
    private final CutRepository cutRepository; 
    private final RestTemplate restTemplate; 

    private static final String AI_SERVER_URL = "https://ai-server-05pj.onrender.com";

    /**
     * 현재 로그인된 사용자의 memberId(이메일) 추출
     */
    private String getCurrentMemberId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    /**
     * [소고기] 분석 및 DB 저장
     */
    public CutDto analyzeBeef(MultipartFile file) throws Exception {
        String url = AI_SERVER_URL + "/analyze/beef";
        Map<String, Object> aiResponse = callAiServer(file.getBytes(), file.getOriginalFilename(), url);

        String memberId = getCurrentMemberId();

        Cut cut = Cut.builder()
                .meatType("BEEF")
                .detectedPart((String) aiResponse.get("detectedPart"))
                .detectedGrade((String) aiResponse.get("detectedGrade"))
                .insight((String) aiResponse.get("insight"))
                .fileName(file.getOriginalFilename())
                .memberId(memberId)
                .build();
        
        cutRepository.save(cut); 

        return CutDto.builder()
                .status("success")
                .meatType("BEEF")
                .detectedPart(cut.getDetectedPart())
                .detectedGrade(cut.getDetectedGrade())
                .partConfidence((String) aiResponse.get("partConfidence"))  
                .gradeConfidence((String) aiResponse.get("gradeConfidence")) 
                .insight(cut.getInsight())
                .memberId(memberId)
                .build();
    }

    /**
     * [닭고기] 분석 및 DB 저장
     */
    public CutDto analyzeChicken(MultipartFile file) throws Exception {
        String url = AI_SERVER_URL + "/analyze/chicken";
        Map<String, Object> aiResponse = callAiServer(file.getBytes(), file.getOriginalFilename(), url);

        String memberId = getCurrentMemberId();

        Cut cut = Cut.builder()
                .meatType("CHICKEN")
                .detectedPart((String) aiResponse.get("detectedChickenPart"))
                .detectedGrade("-")
                .insight((String) aiResponse.get("insight"))
                .fileName(file.getOriginalFilename())
                .memberId(memberId)
                .build();
        
        cutRepository.save(cut);

        return CutDto.builder()
                .status("success")
                .meatType("CHICKEN")
                .detectedPart(cut.getDetectedPart())
                .detectedGrade("-")
                .partConfidence((String) aiResponse.get("partConfidence"))
                .insight(cut.getInsight())
                .memberId(memberId)
                .build();
    }

    public Map<String, Object> callAiServer(byte[] fileBytes, String filename, String url) throws Exception {
        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() { return filename; }
        };
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource); 
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        return restTemplate.postForObject(url, requestEntity, Map.class);
    }
}
