import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper,
  Alert, List, ListItem, ListItemText, Divider, Chip, Stack
} from '@mui/material';
import { Send, Event, Assignment, Category, PriorityHigh } from '@mui/icons-material';

function App() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    organiser: ''
  });

  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null); // ✅ 只新增：统一错误提示栏
  const [records, setRecords] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'NEEDS REVISION': return 'warning';
      case 'INCOMPLETE': return 'error';
      case 'PENDING': return 'default';
      default: return 'default';
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =========================
  // ONLY ADD VALIDATION LOGIC (NO UI CHANGE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitResult(null);

    // frontend validation (Case 2 + Case 3 + empty fields)
    if (!formData.title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description cannot be empty");
      return;
    }

    if (formData.description.trim().length < 40) {
      setError("Description must be at least 40 characters");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location cannot be empty");
      return;
    }

    if (!formData.date.trim()) {
      setError("Date cannot be empty");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      setError("Date must be in YYYY-MM-DD format");
      return;
    }

    if (!formData.organiser.trim()) {
      setError("Organiser cannot be empty");
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const msg = await response.json();
        throw new Error(msg.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setSubmitResult(data);

      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        organiser: ''
      });

      fetchRecords();

    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:5002/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
        <Event sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
        Campus Buzz
      </Typography>

      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Campus Event Submission & Automatic Review System
      </Typography>

      <Paper elevation={4} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Assignment sx={{ mr: 1 }} /> Submit New Event
        </Typography>

        {/* ========================= */}
        {/* 🔴 ONLY ADDED ERROR BAR */}
        {/* ========================= */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth label="Event Title" name="title"
            value={formData.title} onChange={handleChange} sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label="Description (Min 40 characters)" name="description"
            value={formData.description} onChange={handleChange} multiline rows={3}
            error={formData.description.length > 0 && formData.description.length < 40}
            helperText={`${formData.description.length}/40 characters minimum (warning only)`}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label="Location" name="location"
            value={formData.location} onChange={handleChange} sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label="Date" name="date" type="date"
            value={formData.date} onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            helperText="Format: YYYY-MM-DD (warning only)"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label="Organiser Name" name="organiser"
            value={formData.organiser} onChange={handleChange} sx={{ mb: 3 }}
          />

          <Button
            type="submit" variant="contained" color="primary" size="large"
            startIcon={<Send />} fullWidth sx={{ py: 1.5 }}
          >
            Submit for Review
          </Button>
        </Box>
      </Paper>

      {submitResult && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Submission received (ID: {submitResult.id}). The background process is now verifying your event.
        </Alert>
      )}

      <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Recent Submissions
        </Typography>

        {records.length === 0 ? (
          <Typography color="text.secondary">No events submitted yet.</Typography>
        ) : (
          <List>
            {records.map((record, index) => {
              const status = record.final_status || record.status;
              const category = record.assigned_category || record.category;
              const priority = record.assigned_priority || record.priority;
              const note = record.note || 'No additional notes.';

              return (
                <React.Fragment key={record.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{record.title}</Typography>
                          <Chip label={status} color={getStatusColor(status)} size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {record.location} | {record.date} | {record.organiser}
                          </Typography>

                          <Typography variant="body2" sx={{ fontStyle: 'italic', my: 1 }}>
                            "{record.description}"
                          </Typography>

                          {status !== 'PENDING' && (
                            <Box sx={{ mt: 1 }}>
                              <Stack direction="row" spacing={1}>
                                <Chip label={`Category: ${category}`} size="small" variant="outlined" />
                                <Chip label={`Priority: ${priority}`} size="small" variant="outlined" />
                              </Stack>
                              <Alert severity="info" icon={false} sx={{ mt: 1, py: 0 }}>
                                <strong>Note:</strong> {note}
                              </Alert>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < records.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default App;