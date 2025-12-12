package com.project.beef.config.jwt;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpMethod; 
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher; 
import org.springframework.security.web.util.matcher.RequestMatcher; // RequestMatcher import 추가
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.project.beef.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // ⭐ 1. 필터링을 건너뛸 공용 경로 정의 ⭐
    // 이 경로들은 토큰 검증 없이 바로 통과됩니다.
    private static final List<RequestMatcher> PUBLIC_MATCHERS = Arrays.asList(
            // 로그인, 회원가입 경로 (POST 요청)
            new AntPathRequestMatcher("/auth/**", HttpMethod.POST.name()),
            
            // ⭐⭐⭐ 분석 API 경로 추가 (POST 요청) ⭐⭐⭐
            new AntPathRequestMatcher("/api/cut/**", HttpMethod.POST.name()),
            
            // 모든 OPTIONS 요청 허용 (CORS Preflight)
            new AntPathRequestMatcher("/**", HttpMethod.OPTIONS.name())
    );

    /**
     * PUBLIC_MATCHERS에 정의된 경로에 대해서는 이 필터를 건너뜁니다.
     * 이는 permitAll() 설정이 적용될 수 있도록 보장합니다.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // 현재 요청이 PUBLIC_MATCHERS 중 하나와 일치하는지 확인합니다.
        return PUBLIC_MATCHERS.stream().anyMatch(matcher -> matcher.matches(request));
    }
    
    // 이 필터가 처리할 로직 (토큰 검증 및 인증)
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // shouldNotFilter()에서 공용 경로는 이미 건너뛰었으므로, 여기는 토큰이 필요한 요청만 들어옵니다.
        
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7); // 'Bearer ' 제거

            try {
                String email = jwtUtil.extractEmail(token);

                if (email != null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            new User(email, "", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))),
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // 토큰 만료 등 오류 발생 시 401 반환
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token or Token Expired");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}