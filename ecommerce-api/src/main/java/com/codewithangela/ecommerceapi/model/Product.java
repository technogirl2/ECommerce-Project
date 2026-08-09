package com.codewithangela.ecommerceapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private double price;
    private String imageUrl;
    private String brand;

    @ManyToOne
    @JoinColumn(name = "snack_type_id", referencedColumnName = "id")
    private SnackType snackType;
}
