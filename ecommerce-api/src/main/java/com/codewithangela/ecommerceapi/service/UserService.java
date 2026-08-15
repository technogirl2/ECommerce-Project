package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.UserRepo;
import com.codewithangela.ecommerceapi.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    public User saveUser(User user) {
        return repo.save(user);
    }

    public List<User> getUsers() {
        return repo.findAll();
    }

    public User getUserByEmail(String email) {
        return repo.findByEmail(email);
    }

    public User updatePassword(User user, String newHashedPassword) {
        user.setPassword(newHashedPassword);
        return repo.save(user);
    }
}
