package com.example.reservation.controller.dto;

public class ReservationRequest {
    private Long slotId;
    private String name;
    private String email;
    private String phone;
    private String comment;
    private Integer people;
    private Integer bags;

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Integer getPeople() { return people; }
    public void setPeople(Integer people) { this.people = people; }
    public Integer getBags() { return bags; }
    public void setBags(Integer bags) { this.bags = bags; }
}
