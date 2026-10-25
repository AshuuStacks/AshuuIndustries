package com.example.reservation.controller;

import com.example.reservation.entity.Reservation;
import com.example.reservation.controller.dto.ReservationRequest;
import com.example.reservation.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService service;

    @PostMapping
    public Reservation create(@RequestBody ReservationRequest request) {
        return service.createReservation(request);
    }

    @GetMapping
    public List<Reservation> all() {
        return service.getAllReservations();
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<Reservation> accept(@PathVariable Long id) {
        return service.updateStatus(id, Reservation.Status.ACCEPTED)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Reservation> reject(@PathVariable Long id) {
        return service.updateStatus(id, Reservation.Status.REJECTED)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
