package com.example.reservation.service;

import com.example.reservation.controller.dto.ReservationRequest;
import com.example.reservation.entity.AvailabilitySlot;
import com.example.reservation.entity.Reservation;
import com.example.reservation.repository.AvailabilitySlotRepository;
import com.example.reservation.repository.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private static final int FIXED_RESERVATION_PRICE = 25;

    private final ReservationRepository repository;
    private final AvailabilitySlotRepository slots;
    private final MailService mailService;

    public ReservationService(ReservationRepository repository, AvailabilitySlotRepository slots, MailService mailService) {
        this.repository = repository;
        this.slots = slots;
        this.mailService = mailService;
    }

    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        if (request.getSlotId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choisissez un créneau disponible.");
        }
        AvailabilitySlot slot = slots.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Créneau introuvable."));
        if (!slot.isAvailable() || !java.time.LocalDateTime.of(slot.getDate(), slot.getTime()).isAfter(java.time.LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce créneau vient d’être réservé. Choisissez-en un autre.");
        }
        if (request.getName() == null || request.getName().isBlank() ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPhone() == null || request.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complétez vos coordonnées.");
        }
        if (request.getPeople() == null || request.getPeople() < 1 || request.getPeople() > 4 ||
                request.getBags() == null || request.getBags() < 0 || request.getBags() > 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nombre de personnes ou de valises est invalide.");
        }

        slot.setAvailable(false);
        Reservation reservation = new Reservation();
        reservation.setName(request.getName().trim());
        reservation.setEmail(request.getEmail().trim());
        reservation.setPhone(request.getPhone().trim());
        reservation.setComment(request.getComment());
        reservation.setPeople(request.getPeople());
        reservation.setBags(request.getBags());
        reservation.setDate(slot.getDate());
        reservation.setTime(slot.getTime());
        reservation.setSlotId(slot.getId());
        reservation.setStatus(Reservation.Status.PENDING);
        Reservation saved = repository.save(reservation);
        sendMailSafely(saved, "Demande de réservation - Jette ↔ Zaventem",
                "Bonjour " + saved.getName() + ",\n\n" +
                        "Votre demande de réservation a bien été enregistrée.\n" +
                        "Elle est actuellement en attente de confirmation.\n\n" +
                        "Vous serez contacté lorsque votre demande sera traitée.\n\nMerci !");
        return saved;
    }

    public List<Reservation> getAllReservations() {
        return repository.findAll();
    }

    @Transactional
    public Optional<Reservation> updateStatus(Long id, Reservation.Status status) {
        return repository.findById(id).map(reservation -> {
            Reservation.Status previousStatus = reservation.getStatus();
            if (previousStatus == status) {
                return reservation;
            }

            if (reservation.getSlotId() != null) {
                AvailabilitySlot slot = slots.findByIdForUpdate(reservation.getSlotId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Le créneau associé n’existe plus."));
                if (status == Reservation.Status.REJECTED) {
                    slot.setAvailable(true);
                } else if (status == Reservation.Status.ACCEPTED && previousStatus == Reservation.Status.REJECTED) {
                    if (!slot.isAvailable()) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce créneau a déjà été repris.");
                    }
                    slot.setAvailable(false);
                }
            }

            reservation.setStatus(status);
            Reservation saved = repository.save(reservation);
            if (status == Reservation.Status.ACCEPTED) {
                sendConfirmation(saved);
            } else if (status == Reservation.Status.REJECTED) {
                sendMailSafely(saved, "Indisponibilité – Taxi Jette ↔ Zaventem",
                        "Bonjour " + saved.getName() + ",\n\n" +
                                "Je suis désolé, je ne suis pas disponible à cet horaire.\n\n" +
                                "N’hésitez pas à proposer une autre heure.\n\n" +
                                "Merci pour votre compréhension.\n0467 01 70 68");
            }
            return saved;
        });
    }

    private void sendConfirmation(Reservation reservation) {
        int people = reservation.getPeople() == null ? 1 : reservation.getPeople();
        int bags = reservation.getBags() == null ? 0 : reservation.getBags();
        String lowerComment = comment.toLowerCase(java.util.Locale.ROOT);
        String route = lowerComment.contains("aéroport → jette") ||
                lowerComment.contains("aéroport de zaventem → jette")
                ? "Aéroport de Zaventem → Jette"
                : "Jette → Aéroport de Zaventem";

        String message = "Bonjour " + reservation.getName() + ",\n\n" +
                "Super nouvelle : votre course est CONFIRMÉE !\n\n" +
                "CONFIRMATION DE COURSE\n" +
                "Trajet          : " + route + "\n" +
                "Date            : " + reservation.getDate() + "\n" +
                "Heure           : " + reservation.getTime() + "\n" +
                "Personnes       : " + people + "\n" +
                "Valises         : " + bags + "\n" +
                "Prix total      : " + FIXED_RESERVATION_PRICE + " € (payable sur place)\n\n" +
                "En cas de retard de vol ou de changement, appelez le 0467 01 70 68.\n\n" +
                "Merci pour votre confiance !\nJette ↔ Zaventem";
        sendMailSafely(reservation, "Course CONFIRMÉE – Taxi Jette ↔ Zaventem", message);
    }

    private void sendMailSafely(Reservation reservation, String subject, String body) {
        try {
            mailService.envoyerMail(reservation.getEmail(), subject, body);
        } catch (Exception exception) {
            System.err.println("Réservation " + reservation.getId() +
                    " enregistrée, mais échec de l’envoi du mail : " + exception.getMessage());
        }
    }
}
