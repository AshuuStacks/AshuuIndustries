import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";

type AvailabilitySlot = {
  id: number;
  date: string;
  time: string;
};

interface SlotManagerProps {
  username: string;
  password: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const SlotManager: React.FC<SlotManagerProps> = ({ username, password }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      const response = await axios.get<AvailabilitySlot[]>(`${API_URL}/api/admin/slots`, {
        auth: { username, password },
      });
      setSlots(response.data);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setError("L’API refuse tes identifiants admin (401). Déconnecte-toi puis reconnecte-toi.");
      } else if (axios.isAxiosError(requestError) && requestError.response?.status === 403) {
        setError("Ton compte n’a pas le rôle ADMIN. Vérifie ADMIN_ACCOUNTS dans reservation-api/.env puis redémarre l’API.");
      } else {
        setError("Impossible de charger les créneaux. Vérifie que l’API est démarrée.");
      }
    }
  }, [username, password]);

  useEffect(() => {
    fetchSlots();
    const refresh = window.setInterval(fetchSlots, 5000);
    return () => window.clearInterval(refresh);
  }, [fetchSlots]);

  const addSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/admin/slots`, { date, time }, { auth: { username, password } });
      setTime("");
      setSuccess("Créneau ajouté. Il est maintenant visible par les clients.");
      await fetchSlots();
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const status = requestError.response?.status;
        const body = requestError.response?.data as { detail?: string; message?: string } | undefined;
        if (status === 409) {
          setError("Ce créneau existe déjà ou vient d’être réservé.");
        } else if (status === 401) {
          setError("L’API refuse tes identifiants admin (401). Déconnecte-toi puis reconnecte-toi.");
        } else if (status === 403) {
          setError("Ton compte n’a pas le rôle ADMIN. Vérifie ADMIN_ACCOUNTS dans reservation-api/.env puis redémarre l’API.");
        } else if (status === 400) {
          setError(body?.detail || body?.message || "La date et l’heure doivent être dans le futur.");
        } else {
          setError(body?.detail || body?.message || "Impossible de joindre l’API. Vérifie qu’elle est démarrée.");
        }
      } else {
        setError("Impossible d’ajouter le créneau. Réessaie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeSlot = async (id: number) => {
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${API_URL}/api/admin/slots/${id}`, { auth: { username, password } });
      setSlots(current => current.filter(slot => slot.id !== id));
    } catch {
      setError("Ce créneau a déjà été réservé ou ne peut plus être supprimé.");
      await fetchSlots();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2.5, sm: 3 }, mb: 4, border: "1px solid #bae6fd", borderRadius: 4, boxShadow: "0 12px 35px rgba(3, 105, 161, .07)" }}
    >
      <Typography variant="h5" fontWeight={800} sx={{ color: "#075985", mb: 0.5 }}>
        Horaires disponibles
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Ajoute les horaires que les clients pourront sélectionner. Les pages ouvertes se mettent à jour automatiquement.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={addSlot} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 3 }}>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={event => setDate(event.target.value)}
          inputProps={{ min: dayjs().format("YYYY-MM-DD") }}
          InputLabelProps={{ shrink: true }}
          required
          sx={{ flex: "1 1 180px" }}
        />
        <TextField
          label="Heure"
          type="time"
          value={time}
          onChange={event => setTime(event.target.value)}
          InputLabelProps={{ shrink: true }}
          required
          sx={{ flex: "1 1 140px" }}
        />
        <Button type="submit" variant="contained" disabled={loading} sx={{ minHeight: 56, px: 3, borderRadius: 2.5, bgcolor: "#0284c7", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#0369a1" } }}>
          {loading ? "Ajout…" : "Ajouter l’horaire"}
        </Button>
      </Box>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
        Créneaux ouverts ({slots.length})
      </Typography>
      {slots.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Aucun créneau à venir. Ajoute un horaire ci-dessus.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {slots.map(slot => (
            <Box key={slot.id} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.8, border: "1px solid #bae6fd", borderRadius: 2.5, bgcolor: "#f0f9ff" }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: "#075985" }}>
                {dayjs(slot.date).format("ddd D MMM YYYY")} · {slot.time.slice(0, 5)}
              </Typography>
              <Button size="small" color="error" onClick={() => removeSlot(slot.id)} sx={{ minWidth: 0, textTransform: "none" }}>
                Retirer
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default SlotManager;
