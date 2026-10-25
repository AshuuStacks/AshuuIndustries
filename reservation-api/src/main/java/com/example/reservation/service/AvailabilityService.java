package com.example.reservation.service;

import com.example.reservation.controller.dto.CreateSlotRequest;
import com.example.reservation.entity.AvailabilitySlot;
import com.example.reservation.repository.AvailabilitySlotRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AvailabilityService {

    private final AvailabilitySlotRepository slots;

    public AvailabilityService(AvailabilitySlotRepository slots) {
        this.slots = slots;
    }

    public List<AvailabilitySlot> getAvailableSlots() {
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        return slots.findByAvailableTrueAndDateGreaterThanEqualOrderByDateAscTimeAsc(today).stream()
                .filter(slot -> LocalDateTime.of(slot.getDate(), slot.getTime()).isAfter(now))
                .toList();
    }

    public List<AvailabilitySlot> getUpcomingSlots() {
        return getAvailableSlots();
    }

    @Transactional
    public AvailabilitySlot createSlot(CreateSlotRequest request) {
        if (request.getDate() == null || request.getTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choisissez une date et une heure.");
        }
        if (!LocalDateTime.of(request.getDate(), request.getTime()).isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le créneau doit être dans le futur.");
        }
        if (slots.existsByDateAndTime(request.getDate(), request.getTime())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce créneau existe déjà.");
        }
        try {
            return slots.saveAndFlush(new AvailabilitySlot(request.getDate(), request.getTime()));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce créneau existe déjà.");
        }
    }

    @Transactional
    public void deleteSlot(Long id) {
        AvailabilitySlot slot = slots.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Créneau introuvable."));
        if (!slot.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce créneau est déjà réservé.");
        }
        slots.delete(slot);
    }
}
