import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Paper,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Mail, Phone, MapPin
} from 'lucide-react';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for button loading

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    if (!validateEmail(formData.email)) {
      setSnackbarMessage('Please enter a valid email address.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to a backend
    try {
      // In a real application, replace this with a call to your backend API
      const response = await new Promise(resolve => setTimeout(() => resolve({ ok: true }), 1500)); // Simulating a network request

      if (response.ok) {
        setSnackbarMessage('Message sent successfully! We will get back to you shortly.');
        setSnackbarSeverity('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSnackbarMessage('Failed to send message. Please try again later.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbarMessage('An error occurred. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsSubmitting(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, color: 'text.primary' }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Get In Touch
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 'md', mx: 'auto' }}>
          Have questions, feedback, or just want to say hello? We'd love to hear from you!
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        <Grid item xs={12} md={7}>
          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: '12px' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Send Us a Message
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Your Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Your Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={6}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2, borderRadius: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={24} color="primary" />
                <Typography variant="body1" color="text.secondary">
                  Greenock Reads! <br />
                  123 High Street, <br />
                  Greenock, PA15 1LA <br />
                  Scotland, UK
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone size={24} color="primary" />
                <Typography variant="body1" color="text.secondary">
                  +44 1475 555 123
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Mail size={24} color="primary" />
                <Typography variant="body1" color="text.secondary">
                  info@greenockreads.com
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ mt: 4, borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d-4.7570!3d55.9472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4889c1b7e41103ad%3A0x6708c2a933221a9!2sGreenock%2C%20UK!5e0!3m2!1sen!2sus!4v1625078400000!5m2!1sen!2sus"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Greenock Location Map"
                ></iframe>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactUsPage;