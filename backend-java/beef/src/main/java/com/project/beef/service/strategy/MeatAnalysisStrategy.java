package com.project.beef.service.strategy;

import com.project.beef.dto.CutDto;
import org.springframework.web.multipart.MultipartFile;

public interface MeatAnalysisStrategy {
    String getMeatType(); // "BEEF" 또는 "CHICKEN"
    CutDto analyze(MultipartFile file) throws Exception;
}