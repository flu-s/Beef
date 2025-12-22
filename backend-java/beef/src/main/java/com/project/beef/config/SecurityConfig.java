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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.project.beef.config.jwt.JwtAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher; // ⭐ 필수 import

import lombok.RequiredArgsConstructor;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ✅ MemberService 때문에 반드시 필요
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CSRF 끔 (React + API)
                .csrf(csrf -> csrf.disable())

                // ⭐⭐⭐ CORS 활성화 (핵심)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 인증 전부 허용 (지금은 개발단계)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/**").permitAll()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    // ⭐⭐⭐ CORS 설정 Bean (이게 없어서 실패한 것)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // 모든 도메인 허용
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
    
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
