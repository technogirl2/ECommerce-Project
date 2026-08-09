package com.codewithangela.ecommerceapi.service;

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

    public List<SnackType> getAllSnackTypes() {
        return repo.findAll();
    }

    public Optional<SnackType> getSnackTypeById(int id) {
        return repo.findById(id);
    }

    public SnackType addSnackType(SnackType snackType) {
        return repo.save(snackType);
    }

    public Optional<SnackType> deleteSnackType(int id) {
        Optional<SnackType> existing = repo.findById(id);
        existing.ifPresent(snackType -> repo.deleteById(id));
        return existing;
    }
}