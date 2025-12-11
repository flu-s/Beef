package com.project.beef.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.beef.domain.Member;
import com.project.beef.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입 로직
    public Long join(Member member) {
        // 비밀번호 암호화 (BCrypt 사용)
        String encodedPassword = passwordEncoder.encode(member.getPassword());
        
        // 암호화된 비밀번호로 다시 셋팅 (빌더 패턴 사용 시 편리)
        Member encryptedMember = Member.builder()
                .email(member.getEmail())
                .password(encodedPassword)
                .name(member.getName())
                .build();

        return memberRepository.save(encryptedMember).getMno();
    }
    
    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email).orElse(null);
    }
}