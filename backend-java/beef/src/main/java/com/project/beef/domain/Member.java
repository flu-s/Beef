package com.project.beef.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder // 이게 있어야 .builder() 사용 가능
@AllArgsConstructor // Builder 사용 시 필수
@NoArgsConstructor // JPA 필수
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mno;

    @Column(unique = true, nullable = false)
    private String email; // 아이디로 사용

    @Column(nullable = false)
    private String password;

    private String name;
}