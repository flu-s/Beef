package com.project.beef.controller;

import com.project.beef.util.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; 
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.project.beef.domain.Member; 
import com.project.beef.dto.LoginRequestDTO;
import com.project.beef.dto.LoginResponseDTO;
import com.project.beef.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth") 
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST}) // 💡 CORS 설정 추가
public class MemberController {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder; 
    private final JwtUtil jwtUtil;

    @PostMapping("/register") 
    public ResponseEntity<Long> signup(@RequestBody Member member) {
        Long memberId = memberService.join(member);
        return ResponseEntity.ok(memberId);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        
        // 1. 이메일로 사용자 찾기
        Member member = memberService.findByEmail(loginRequestDTO.getEmail());

        // 2. 사용자 존재 여부 및 비밀번호 일치 확인
        if (member == null || !passwordEncoder.matches(loginRequestDTO.getPassword(), member.getPassword())) {
            // 실패 시 401 Unauthorized 반환
            return ResponseEntity.status(401).body(new LoginResponseDTO(null, "이메일 또는 비밀번호가 잘못되었습니다."));
        }

        // 3. 비밀번호 일치 시 JWT 토큰 생성
        String token = jwtUtil.generateToken(member.getEmail());

        // 4. 토큰과 성공 메시지 반환
        return ResponseEntity.ok(new LoginResponseDTO(token, "로그인 성공"));
    }
}