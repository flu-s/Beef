package com.project.beef.service.strategy;

import com.project.beef.dto.CutDto;
import com.project.beef.service.CutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ChickenAnalysisStrategy implements MeatAnalysisStrategy {
    
    private final CutService cutService;

    @Override
    public String getMeatType() { return "CHICKEN"; }

    @Override
    public CutDto analyze(MultipartFile file) throws Exception {
        // 닭고기 분석 및 자동 저장 호출
        return cutService.analyzeChicken(file);
    }
}