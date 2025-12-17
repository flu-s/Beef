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
import org.springframework.security.web.util.matcher.RequestMatcher;
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

    // ⭐ 1. 토큰 검증 없이 무조건 통과시킬 경로 정의 ⭐
    // 여기에 등록된 주소는 이 필터가 아예 실행되지 않고 다음 단계(SecurityConfig)로 넘어갑니다.
    private static final List<RequestMatcher> NO_VERIFICATION_MATCHERS = Arrays.asList(
            // 인증 없이 허용
            new AntPathRequestMatcher("/auth/**"),
            new AntPathRequestMatcher("/api/cut/**"),
            new AntPathRequestMatcher("/api/shops/**"),


            // 모든 OPTIONS 요청 (CORS)
            new AntPathRequestMatcher("/**", HttpMethod.OPTIONS.name())
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // 현재 요청 주소가 위 리스트에 포함되어 있으면 필터를 건너뜁니다(return true).
        return NO_VERIFICATION_MATCHERS.stream().anyMatch(matcher -> matcher.matches(request));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

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
                System.out.println("토큰 검증 실패: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}