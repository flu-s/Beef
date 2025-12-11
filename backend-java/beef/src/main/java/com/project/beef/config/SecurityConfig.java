package com.project.beef.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 💡 BCrypt import 추가
import org.springframework.security.crypto.password.PasswordEncoder; // 💡 PasswordEncoder import 추가
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ----------------------------------------------------
    // ⭐ 1. [Critical Fix] PasswordEncoder 빈 등록 ⭐
    // MemberService가 의존성 주입을 받을 수 있도록 BCryptPasswordEncoder를 Bean으로 등록합니다.
    // ----------------------------------------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // ----------------------------------------------------
    // ⭐ 2. CorsConfigurationSource 빈 설정 (CORS 허용 규칙 정의) ⭐
    // ----------------------------------------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); 
        
        return source;
    }

    // ----------------------------------------------------
    // ⭐ 3. SecurityFilterChain에 CORS 필터 및 인증 무시 경로 설정 ⭐
    // ----------------------------------------------------
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        // 1. CSRF 비활성화
        http.csrf(csrf -> csrf.disable());
            
        // 2. CORS 설정 적용 (CORS 문제를 해결합니다)
        http.cors(c -> c.configurationSource(corsConfigurationSource())); 
            
        // 3. 권한 설정 (회원가입/로그인 경로는 인증 없이 접근 허용)
        http.authorizeHttpRequests(authz -> authz
            // 💡 /auth/register, /auth/login 인증 없이 접근 허용
            .requestMatchers("/auth/**").permitAll() 
            // 💡 /api/cut/** 경로 임시 허용
            .requestMatchers("/api/cut/**").permitAll() 
            .anyRequest().authenticated() // 나머지 요청은 인증 필요
        );
            
        // 4. formLogin 및 httpBasic 비활성화
        http.formLogin(formLogin -> formLogin.disable());
        http.httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}