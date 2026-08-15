package com.codewithangela.ecommerceapi.model;


import jakarta.persistence.*;
import lombok.Data;

import com.codewithangela.ecommerceapi.constants.Role;


@Data
@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified = false;
}
