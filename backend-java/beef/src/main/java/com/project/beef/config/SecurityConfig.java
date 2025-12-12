package com.project.beef.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; 
import com.project.beef.config.jwt.JwtAuthenticationFilter; 

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        // ⭐ 1. CSRF 비활성화 (가장 먼저 실행하여 403 차단 방지) ⭐
        http.csrf(csrf -> csrf.disable()) 
            
            // ⭐⭐⭐ 핵심 수정: Spring Security의 기본 CORS 설정 비활성화 ⭐⭐⭐
            // 우리가 정의한 CorsFilter Bean을 사용하도록 Security에게 알립니다.
            .cors(cors -> cors.disable()) 

            // 2. JWT 사용을 위해 세션을 STATELESS로 설정
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 

            // 3. 권한 설정
            .authorizeHttpRequests(authz -> authz
                    // OPTIONS 메서드 허용 (CORS Preflight)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                    
                    // ⭐⭐⭐ 수정할 부분: 컨트롤러와 경로 일치 ⭐⭐⭐
                    // 로그인 및 회원가입 경로를 permitAll()로 허용
                    // 기존: .requestMatchers("/api/member/login", "/api/member/signup").permitAll()
                    .requestMatchers("/auth/login", "/auth/register").permitAll()
                    
                    // /api/cut/**도 permitAll()로 설정 (분석 API 허용)
                    .requestMatchers("/api/cut/**").permitAll()
                    
                    // 나머지 요청은 인증 필요
                    .anyRequest().authenticated() 
                )
            
            // 4. JWT 인증 필터 주입
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // 5. formLogin 및 httpBasic 비활성화
            .formLogin(formLogin -> formLogin.disable())
            .httpBasic(httpBasic -> httpBasic.disable());
        
        return http.build();
    }
}