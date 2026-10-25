package com.example.reservation.controller;

import com.example.reservation.controller.dto.CreateSlotRequest;
import com.example.reservation.entity.AvailabilitySlot;
import com.example.reservation.service.AvailabilityService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping("/api/slots/available")
    public List<AvailabilitySlot> availableSlots() {
        return availabilityService.getAvailableSlots();
    }

    @GetMapping("/api/admin/slots")
    public List<AvailabilitySlot> adminSlots() {
        return availabilityService.getUpcomingSlots();
    }

    @PostMapping("/api/admin/slots")
    public AvailabilitySlot createSlot(@RequestBody CreateSlotRequest request) {
        return availabilityService.createSlot(request);
    }

    @DeleteMapping("/api/admin/slots/{id}")
    public void deleteSlot(@PathVariable Long id) {
        availabilityService.deleteSlot(id);
    }
}
