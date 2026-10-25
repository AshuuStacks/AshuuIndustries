package com.example.reservation.config;

import com.example.reservation.entity.AppUser;
import com.example.reservation.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AdminUserInitializer implements ApplicationRunner {

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String configuredAccounts;

    public AdminUserInitializer(
            AppUserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_ACCOUNTS:}") String configuredAccounts) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.configuredAccounts = configuredAccounts;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Map<String, String> accounts = parseAccounts(configuredAccounts);
        if (accounts.isEmpty()) {
            throw new IllegalStateException("Définissez au moins un compte dans ADMIN_ACCOUNTS.");
        }

        users.findAll().stream()
                .filter(user -> !accounts.containsKey(user.getUsername()))
                .forEach(users::delete);

        accounts.forEach((username, password) -> {
            AppUser user = users.findByUsername(username)
                    .orElseGet(() -> new AppUser(username, "", "ADMIN"));
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole("ADMIN");
            users.save(user);
        });
    }

    private Map<String, String> parseAccounts(String rawAccounts) {
        Map<String, String> accounts = new LinkedHashMap<>();
        if (rawAccounts == null || rawAccounts.isBlank()) {
            return accounts;
        }

        for (String account : rawAccounts.split(",")) {
            int separator = account.indexOf(':');
            if (separator <= 0 || separator == account.length() - 1) {
                throw new IllegalStateException("Format ADMIN_ACCOUNTS invalide. Utilisez identifiant:motDePasse.");
            }
            String username = account.substring(0, separator).trim();
            String password = account.substring(separator + 1).trim();
            if (username.isBlank() || password.isBlank() || accounts.putIfAbsent(username, password) != null) {
                throw new IllegalStateException("Identifiant admin vide ou défini plusieurs fois dans ADMIN_ACCOUNTS.");
            }
        }
        return accounts;
    }
}
