package com.example.reservation.repository;

import com.example.reservation.entity.AvailabilitySlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByAvailableTrueAndDateGreaterThanEqualOrderByDateAscTimeAsc(LocalDate date);

    boolean existsByDateAndTime(LocalDate date, LocalTime time);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select slot from AvailabilitySlot slot where slot.id = :id")
    Optional<AvailabilitySlot> findByIdForUpdate(@Param("id") Long id);
}
