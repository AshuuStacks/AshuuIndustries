import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Box,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import 'dayjs/locale/fr';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import SlotManager from "./SlotManager";

dayjs.locale('fr');
dayjs.extend(localizedFormat);

export interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  comment: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface ReservationListProps {
  username: string;
  password: string;
  onLogout: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ReservationList: React.FC<ReservationListProps> = ({ username, password, onLogout }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<"PENDING" | "ACCEPTED" | "PAST">("PENDING");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const prevLength = useRef(0);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await axios.get<Reservation[]>(`${API_URL}/api/reservations`, { auth: { username, password } });
      setReservations(res.data);

      if (res.data.length > prevLength.current) setOpenSnackbar(true);
      prevLength.current = res.data.length;
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
    }
  }, [username, password]);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 5000);
    return () => clearInterval(interval);
  }, [fetchReservations]);

  const updateStatus = async (id: number, action: "accept" | "reject") => {
    try {
      await axios.put(`${API_URL}/api/reservations/${id}/${action}`, undefined, { auth: { username, password } });
      fetchReservations();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    return dayjs(`${date}T${time}`).format("D MMMM [à] HH[h]mm");
  };

  const now = dayjs();

  const pastReservations = reservations
    .filter(r => dayjs(`${r.date}T${r.time}`).isBefore(now) || r.status === "REJECTED")
    .sort((a, b) => dayjs(`${b.date}T${b.time}`).unix() - dayjs(`${a.date}T${a.time}`).unix());

  const pendingReservations = reservations
    .filter(r => r.status === "PENDING")
    .sort((a, b) => dayjs(`${a.date}T${a.time}`).unix() - dayjs(`${b.date}T${b.time}`).unix());

  const acceptedReservations = reservations
    .filter(r => r.status === "ACCEPTED")
    .sort((a, b) => dayjs(`${a.date}T${a.time}`).unix() - dayjs(`${b.date}T${b.time}`).unix());

  const getNextReservation = () => {
    const futureAccepted = acceptedReservations.filter(r => dayjs(`${r.date}T${r.time}`).isAfter(now));
    return futureAccepted.length > 0 ? futureAccepted[0] : null;
  };

  const nextReservation = getNextReservation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue as any);
  };

  const displayedReservations = tab === "PENDING" ? pendingReservations
    : tab === "ACCEPTED" ? acceptedReservations
    : pastReservations;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box />
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Liste des réservations
        </Typography>
        <Button onClick={onLogout}>Se déconnecter</Button>
      </Box>

      <SlotManager username={username} password={password} />

      {/* Prochaine course */}
      {nextReservation && (
        <>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'green', textAlign: 'center' }}>
            Votre prochaine course
          </Typography>
          <Card variant="outlined" sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{nextReservation.name}</Typography>
              <Typography>{nextReservation.email} | {nextReservation.phone}</Typography>
              <Typography sx={{ mt: 1, fontSize: '1.1rem' }}>
                {formatDateTime(nextReservation.date, nextReservation.time)}
              </Typography>
              <Typography sx={{ mt: 1, fontStyle: 'italic' }}>{nextReservation.comment}</Typography>
            </CardContent>
          </Card>
          <Divider sx={{ mb: 3 }} />
        </>
      )}

      {/* Onglets */}
      <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Passée" value="PAST" />
        <Tab label="Pending" value="PENDING" />
        <Tab label="Acceptée" value="ACCEPTED" />
      </Tabs>

      {/* Liste des réservations */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {displayedReservations.map(r => (
          <Box key={r.id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", md: "calc(33.333% - 16px)" } }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                borderColor: r.status === "PENDING" ? "orange" : r.status === "ACCEPTED" ? "green" : "grey",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.03)" }
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>{r.name}</Typography>
                <Typography color="textSecondary">{r.email} | {r.phone}</Typography>
                <Typography sx={{ mt: 1 }}>{formatDateTime(r.date, r.time)}</Typography>
                {r.comment && <Typography sx={{ mt: 1, fontStyle: "italic" }}>{r.comment}</Typography>}
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    mt: 2,
                    color: r.status === "PENDING" ? "orange" : r.status === "ACCEPTED" ? "green" : "red",
                    textAlign: 'center'
                  }}
                >
                  {r.status}
                </Typography>
              </CardContent>
              {r.status === "PENDING" && (
                <CardActions sx={{ justifyContent: "center", mb: 1 }}>
                  <Button variant="contained" color="success" onClick={() => updateStatus(r.id, "accept")}>Accepter</Button>
                  <Button variant="contained" color="error" onClick={() => updateStatus(r.id, "reject")}>Refuser</Button>
                </CardActions>
              )}
            </Card>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          Nouvelle réservation reçue !
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReservationList;
