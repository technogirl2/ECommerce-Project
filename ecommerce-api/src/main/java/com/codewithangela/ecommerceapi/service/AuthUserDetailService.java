package com.codewithangela.ecommerceapi.service;

import com.codewithangela.ecommerceapi.dao.UserRepo;
import com.codewithangela.ecommerceapi.model.User;
import com.codewithangela.ecommerceapi.model.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepo repo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = repo.findByEmail(email);

        if (user == null) {
            System.out.println("user not found");
            throw new UsernameNotFoundException("User 404");
        }

        return new UserPrincipal(user);
    }
}
