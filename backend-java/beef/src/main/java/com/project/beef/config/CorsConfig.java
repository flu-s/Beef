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
    
    config.setAllowCredentials(true); 
    config.setAllowedOriginPatterns(Arrays.asList("*")); // 모든 도메인 허용
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
    }
}
