package com.project.beef.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    /**
     * Spring Security 필터보다 높은 우선순위로 CORS 필터를 등록하여 
     * OPTIONS (Preflight) 요청이 보안 필터에 의해 차단되는 것을 방지합니다.
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // ⭐ 허용할 출처 (프론트엔드 URL) ⭐
        config.setAllowCredentials(true); 
        // 5173과 127.0.0.1:5173 모두 허용
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173"));
        
        // 모든 헤더 허용 (Authorization 헤더 포함)
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // 허용할 HTTP 메서드 (OPTIONS 포함)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 모든 경로에 CORS 설정 적용
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}