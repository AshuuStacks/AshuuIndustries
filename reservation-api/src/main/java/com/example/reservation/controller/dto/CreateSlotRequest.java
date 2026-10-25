package com.example.reservation.controller.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateSlotRequest {
    private LocalDate date;
    private LocalTime time;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
}
