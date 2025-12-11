package com.project.beef.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.beef.domain.Cut;

// <엔티티 클래스, 엔티티의 ID 타입>
public interface CutRepository extends JpaRepository<Cut, Long> {
    
    // 필요하다면 여기에 사용자 정의 쿼리 메서드를 추가합니다.
    
}