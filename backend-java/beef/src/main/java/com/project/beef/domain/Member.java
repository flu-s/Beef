package com.project.beef.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder 
@AllArgsConstructor 
@NoArgsConstructor 
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mno;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
}