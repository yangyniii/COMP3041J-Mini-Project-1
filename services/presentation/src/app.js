import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Send, Event } from '@mui/icons-material';

function App() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    organiser: ''
  });
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubmitResult(data);
      setFormData({ title: '', description: '', location: '', date: '', organiser: '' });
      fetchRecords(); // Refresh records after submission
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

  React.useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
        Campus Buzz
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Submit and manage campus events
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Submit New Event
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Organiser"
            name="organiser"
            value={formData.organiser}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Send />}
            fullWidth
          >
            Submit Event
          </Button>
        </Box>
      </Paper>

      {submitResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Event submitted successfully! ID: {submitResult.id}, Status: {submitResult.status}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recent Events
        </Typography>
        {records.length === 0 ? (
          <Typography color="text.secondary">No events submitted yet.</Typography>
        ) : (
          <List>
            {records.map((record, index) => (
              <React.Fragment key={record.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`${record.title} - ${record.status}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {record.location} | {record.date} | {record.organiser}
                        </Typography>
                        <br />
                        {record.description}
                        <br />
                        Category: {record.category} | Priority: {record.priority}
                        {record.note && ` | Note: ${record.note}`}
                      </>
                    }
                  />
                </ListItem>
                {index < records.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default App;