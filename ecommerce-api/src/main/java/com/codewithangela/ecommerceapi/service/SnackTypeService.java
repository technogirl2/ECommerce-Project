package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.ProductRepo;
import com.codewithangela.ecommerceapi.dao.SnackTypeRepo;
import com.codewithangela.ecommerceapi.model.SnackType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SnackTypeService {

    @Autowired
    private SnackTypeRepo repo;

    @Autowired
    private ProductRepo productRepo;

    public List<SnackType> getAllSnackTypes() {
        return repo.findAll();
    }

    public Optional<SnackType> getSnackTypeById(int id) {
        return repo.findById(id);
    }

    public SnackType addSnackType(SnackType snackType) {
        return repo.save(snackType);
    }

    public long countProductsUsingSnackType(int id) {
        return productRepo.countBySnackType_Id(id);
    }

    public Optional<SnackType> deleteSnackType(int id) {
        Optional<SnackType> existing = repo.findById(id);
        existing.ifPresent(snackType -> repo.deleteById(id));
        return existing;
    }

    public Optional<SnackType> updateSnackTypeName(int id, String name) {
        return repo.findById(id)
                .map(snackType -> {
                    snackType.setName(name);
                    return repo.save(snackType);
                });
    }
}