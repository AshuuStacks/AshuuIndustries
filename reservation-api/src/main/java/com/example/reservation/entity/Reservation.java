package com.example.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private LocalDate date;
    private LocalTime time;
    private String comment;
    private Long slotId;
    private Integer people = 1;
    private Integer bags = 0;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

    public Reservation() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public Integer getPeople() { return people; }
    public void setPeople(Integer people) { this.people = people; }
    public Integer getBags() { return bags; }
    public void setBags(Integer bags) { this.bags = bags; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
