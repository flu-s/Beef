package com.project.beef.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // ⭐ application.properties 또는 application.yml에서 설정된 시크릿 키를 가져옵니다.
    // 이 키가 토큰 생성 시와 검증 시 모두 일치해야 합니다!
    private final Key key;

    // 만료 시간 설정 (1시간 = 3600000ms)
    @Value("${jwt.expiration.time:3600000}") 
    private long expirationTime;

    public JwtUtil(@Value("${jwt.secret.key}") String secretKey) {
        // Base64 디코딩을 통해 Secret Key를 Key 객체로 변환합니다.
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 토큰 생성
    public String generateToken(String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(email) // 토큰의 주체 (사용자 ID 또는 이메일)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 사용자 이메일 추출 (토큰 검증 포함)
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key) // ⭐ 이 키로 토큰 서명을 검증합니다.
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}