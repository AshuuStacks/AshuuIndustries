import React, { useState } from "react";
import axios from "axios";
import ReservationList from "./ReservationList";
import { Alert, TextField, Button, Box, Typography, Paper, Container } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const AdminRoute: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.get(`${API_URL}/api/admin/auth-check`, { auth: { username, password } });
      setAuthenticated(true);
    } catch {
      setError("Identifiant ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
  };

  return authenticated ? (
    <ReservationList username={username} password={password} onLogout={handleLogout} />
  ) : (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: 4,
        background: "radial-gradient(circle at 15% 15%, #cffafe 0, transparent 32%), linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={handleLogin}
          elevation={0}
          sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5, border: "1px solid", borderColor: "divider", boxShadow: "0 24px 70px rgba(15, 23, 42, .12)" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Box sx={{ width: 54, height: 54, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "#cffafe", color: "#0e7490", fontSize: 24, fontWeight: 800 }}>A</Box>
            <Box>
              <Typography variant="overline" sx={{ color: "#0e7490", fontWeight: 800, letterSpacing: 1.4 }}>ESPACE PRIVÉ</Typography>
              <Typography variant="h5" fontWeight={800}>Administration</Typography>
            </Box>
          </Box>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Connecte-toi pour gérer les demandes de réservation.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Identifiant"
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              fullWidth
              required
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, borderRadius: 2.5, bgcolor: "#0284c7", fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#0369a1" } }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 3 }}>
            Accès réservé aux comptes administrateurs
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminRoute;
