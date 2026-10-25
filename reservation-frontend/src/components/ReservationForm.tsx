
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Paper,
  Box,
  Typography,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Container,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const FIXED_RESERVATION_PRICE = 25;

type ReservationConfirmation = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  people: number;
  bags: number;
  direction: "aller" | "retour";
  comment: string;
  totalPrice: number;
};

type AvailabilitySlot = {
  id: number;
  date: string;
  time: string;
};

const ReservationForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const selectedSlotId = useRef<number | null>(null);
  selectedSlotId.current = selectedSlot?.id ?? null;
  const [people, setPeople] = useState(1);
  const [bags, setBags] = useState(0);
  const [direction, setDirection] = useState<"aller" | "retour">("aller");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState<ReservationConfirmation | null>(null);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      const response = await axios.get<AvailabilitySlot[]>(`${API_URL}/api/slots/available`);
      setAvailableSlots(response.data);
      if (selectedSlotId.current !== null && !response.data.some(slot => slot.id === selectedSlotId.current)) {
        selectedSlotId.current = null;
        setSelectedSlot(null);
        setError("Cet horaire n’est plus disponible. Choisis-en un autre.");
      }
    } catch {
      setError("Impossible de charger les horaires pour le moment.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots();
    const refresh = window.setInterval(fetchAvailableSlots, 5000);
    return () => window.clearInterval(refresh);
  }, [fetchAvailableSlots]);

  const totalPrice = FIXED_RESERVATION_PRICE;

  const trajet =
    direction === "aller"
      ? "Jette → Aéroport de Zaventem"
      : "Aéroport de Zaventem → Jette";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!selectedSlot) {
      setError("Veuillez choisir un horaire disponible.");
      return;
    }

    const bookedSlot = selectedSlot;

    if (people < 1 || people > 4 || bags < 0 || bags > 4) {
      setError("Vérifiez le nombre de personnes et de valises.");
      return;
    }

    const fullComment = [
      comment.trim(),
      `Trajet: ${trajet}`,
      `Personnes: ${people} | Valises: ${bags} | Prix fixe par réservation: ${totalPrice}€`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/reservations`, {
        slotId: bookedSlot.id,
        name,
        email,
        phone,
        people,
        bags,
        comment: fullComment,
      });

      // Afficher la confirmation uniquement après le succès de l'API.
      setConfirmation({
        name,
        email,
        phone,
        date: bookedSlot.date,
        time: bookedSlot.time,
        people,
        bags,
        direction,
        comment: comment.trim(),
        totalPrice,
      });
      setAvailableSlots(slots => slots.filter(slot => slot.id !== bookedSlot.id));
      selectedSlotId.current = null;
      setSelectedSlot(null);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 409) {
        setSelectedSlot(null);
        setError("Cet horaire vient d’être réservé. Choisis-en un autre.");
        await fetchAvailableSlots();
      } else {
        setError("Impossible d'envoyer la réservation. Vérifie ta connexion ou contacte-moi sur WhatsApp au 0467 01 70 68.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = () => {
    setConfirmation(null);
    setName("");
    setEmail("");
    setPhone("");
    setSelectedSlot(null);
    setPeople(1);
    setBags(0);
    setDirection("aller");
    setComment("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f1f5f9",
          backgroundImage: "radial-gradient(circle at 90% 5%, rgba(186,230,253,.55), transparent 28%)",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(120deg, #075985, #0284c7 58%, #0891b2)",
            color: "white",
            py: { xs: 4, sm: 5 },
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>RÉSERVATION DE TRAJET</Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: "2rem", sm: "2.6rem" }, fontWeight: 800, mt: 0.5 }}>
              Jette <Box component="span" sx={{ color: "#67e8f9" }}>↔</Box> Zaventem
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,.82)" }}>
              Un trajet simple, rapide et sympathique — disponible 7j/7.
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          {confirmation ? (
            // PAGE DE CONFIRMATION
            <Box sx={{ maxWidth: 720, mx: "auto" }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 5 },
                  borderRadius: 5,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 24px 60px rgba(15, 23, 42, .08)",
                }}
              >
                <Box textAlign="center" mb={4}>
                  <Box
                    sx={{
                      width: 84,
                      height: 84,
                      mx: "auto",
                      mb: 2,
                      borderRadius: "50%",
                      bgcolor: "#cffafe",
                      color: "#0e7490",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 48,
                      fontWeight: "bold",
                    }}
                    aria-label="Succès"
                  >
                    ✓
                  </Box>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="#0e7490"
                    gutterBottom
                  >
                    Demande envoyée !
                  </Typography>

                  <Typography color="text.secondary">
                    Merci {confirmation.name}, ta demande de réservation a
                    bien été enregistrée.
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography fontWeight="bold">
                    Réservation en attente de confirmation
                  </Typography>
                  Je te contacterai pour confirmer définitivement le trajet.
                </Alert>

                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Récapitulatif de ton trajet
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "#f0f9ff",
                    borderColor: "#bae6fd",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#0e7490"
                    mb={2}
                  >
                    {confirmation.direction === "aller"
                      ? "Jette → Aéroport de Zaventem"
                      : "Aéroport de Zaventem → Jette"}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {[
                    ["Nom", confirmation.name],
                    ["E-mail", confirmation.email],
                    ["Téléphone", confirmation.phone],
                    [
                      "Date",
                      dayjs(confirmation.date).format("dddd D MMMM YYYY"),
                    ],
                    ["Heure", confirmation.time],
                    [
                      "Passagers",
                      `${confirmation.people} personne${confirmation.people > 1 ? "s" : ""}`,
                    ],
                    [
                      "Valises",
                      `${confirmation.bags}`,
                    ],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        py: 1.2,
                      }}
                    >
                      <Typography color="text.secondary">
                        {label}
                      </Typography>
                      <Typography
                        fontWeight="medium"
                        textAlign="right"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}

                  {confirmation.comment && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography color="text.secondary" mb={1}>
                        Commentaire
                      </Typography>
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>
                        {confirmation.comment}
                      </Typography>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Prix fixe par réservation
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="#0e7490"
                    >
                      {confirmation.totalPrice} €
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="right" sx={{ mt: 0.5 }}>
                    Quel que soit le nombre de passagers
                  </Typography>
                </Paper>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 3 }}
                >
                  Garde ce récapitulatif jusqu'à la confirmation de ton trajet.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleNewReservation}
                  sx={{
                    mt: 3,
                    py: 1.7,
                    bgcolor: "#0284c7",
                    "&:hover": { bgcolor: "#0369a1" },
                  }}
                >
                  Effectuer une nouvelle réservation
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  href="https://wa.me/32467017068"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    color: "#0369a1",
                    borderColor: "#38bdf8",
                  }}
                >
                  Me contacter sur WhatsApp
                </Button>
              </Paper>
            </Box>
          ) : (
            // FORMULAIRE DE RÉSERVATION
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
              }}
            >
              <Box sx={{ flex: { md: 7 }, width: "100%" }}>
                <Paper
                  sx={{
                    p: { xs: 2.5, sm: 4 },
                    border: "1px solid #e2e8f0",
                    borderTop: "4px solid #38bdf8",
                    borderRadius: 4,
                    boxShadow: "0 18px 50px rgba(15, 23, 42, .06)",
                  }}
                >
                  <Typography
                    variant="h4"
                    textAlign="center"
                    color="#0284c7"
                    fontWeight="bold"
                    mb={3}
                  >
                    Réserve ton trajet
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="direction-label">Trajet</InputLabel>
                      <Select
                        labelId="direction-label"
                        label="Trajet"
                        value={direction}
                        onChange={(e) =>
                          setDirection(e.target.value as "aller" | "retour")
                        }
                      >
                        <MenuItem value="aller">
                          Jette → Aéroport
                        </MenuItem>
                        <MenuItem value="retour">
                          Aéroport → Jette
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Choisis un horaire disponible
                      </Typography>
                      {slotsLoading ? (
                        <Alert severity="info">Chargement des horaires…</Alert>
                      ) : availableSlots.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Aucun horaire n’est ouvert pour le moment. Reviens bientôt ou contacte-moi sur WhatsApp.
                        </Alert>
                      ) : (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                          {availableSlots.map(slot => {
                            const selected = selectedSlot?.id === slot.id;
                            return (
                              <Button
                                key={slot.id}
                                type="button"
                                variant={selected ? "contained" : "outlined"}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setError("");
                                }}
                                sx={{
                                  minWidth: 112,
                                  py: 1.2,
                                  px: 1.5,
                                  borderRadius: 2.5,
                                  borderColor: selected ? "#0284c7" : "#bae6fd",
                                  bgcolor: selected ? "#0284c7" : "white",
                                  color: selected ? "white" : "#075985",
                                  display: "flex",
                                  flexDirection: "column",
                                  textTransform: "none",
                                  "&:hover": { bgcolor: selected ? "#0369a1" : "#f0f9ff", borderColor: "#0284c7" },
                                }}
                              >
                                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                  {dayjs(slot.date).format("ddd D MMM")}
                                </Typography>
                                <Typography variant="h6" fontWeight={800}>
                                  {slot.time.slice(0, 5)}
                                </Typography>
                              </Button>
                            );
                          })}
                        </Box>
                      )}
                      {selectedSlot && (
                        <Typography variant="body2" sx={{ mt: 1.25, color: "#0369a1", fontWeight: 600 }}>
                          Horaire choisi : {dayjs(selectedSlot.date).format("dddd D MMMM")} à {selectedSlot.time.slice(0, 5)}
                        </Typography>
                      )}
                    </Box>

                    <TextField
                      label="Nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />

                    <TextField
                      label="E-mail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />

                    <TextField
                      label="Téléphone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      autoComplete="tel"
                    />

                    <TextField
                      label="Personnes (max. 4)"
                      type="number"
                      value={people}
                      onChange={(e) =>
                        setPeople(Number(e.target.value))
                      }
                      inputProps={{ min: 1, max: 4 }}
                      required
                    />

                    <TextField
                      label="Valises (max. 4)"
                      type="number"
                      value={bags}
                      onChange={(e) => setBags(Number(e.target.value))}
                      inputProps={{ min: 0, max: 4 }}
                    />

                    <TextField
                      label="Commentaire (vol, adresse...)"
                      multiline
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <Box
                      sx={{
                        bgcolor: "#f0f9ff",
                        p: 2.5,
                        border: "1px solid #bae6fd",
                        borderRadius: 3,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="#0284c7"
                        fontWeight="bold"
                      >
                        Prix fixe par réservation : {totalPrice} €
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Quel que soit le nombre de passagers
                      </Typography>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !selectedSlot}
                      sx={{
                        bgcolor: "#0284c7",
                        py: 1.7,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#0369a1" },
                      }}
                    >
                      {loading
                        ? "Envoi en cours..."
                        : "Réserver maintenant"}
                    </Button>
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ flex: { md: 5 }, width: "100%" }}>
                <Paper
                  sx={{
                    p: { xs: 3, sm: 4 },
                    color: "white",
                    background: "linear-gradient(155deg, #075985, #0e7490)",
                    height: "100%",
                    boxSizing: "border-box",
                    borderRadius: 4,
                    boxShadow: "0 18px 50px rgba(3, 105, 161, .18)",
                  }}
                >
                  <Box textAlign="center" mb={3}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "rgba(255,255,255,.16)",
                        color: "white",
                      }}
                    >
                      A
                    </Avatar>

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="white"
                    >
                      Salut, c'est Ashu !
                    </Typography>
                  </Box>

                  <Typography sx={{ lineHeight: 1.8, color: "rgba(255,255,255,.82)" }}>
                    Étudiant en développement logiciel à Léonard de Vinci.
                    <br />
                    <br />
                    Je propose ces trajets pour rendre service !
                    <br />
                    <br />
                    Une question ? Contacte-moi directement sur WhatsApp.
                  </Typography>

                  <Box textAlign="center" mt={4}>
                    <Button
                      variant="contained"
                      size="large"
                      href="https://wa.me/32467017068"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        bgcolor: "#25D366",
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#128C7E" },
                      }}
                    >
                      WhatsApp 0467 01 70 68
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default ReservationForm;
