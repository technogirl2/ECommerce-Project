package com.codewithangela.ecommerceapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "snack_type")
public class SnackType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String name;
}
