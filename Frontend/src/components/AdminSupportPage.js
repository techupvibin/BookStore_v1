import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const AdminSupportPage = () => {
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Mock data for support tickets
  useEffect(() => {
    const mockTickets = [
      {
        id: 1,
        userEmail: 'user1@example.com',
        subject: 'Order not delivered',
        message: 'I placed an order 5 days ago but haven\'t received it yet. Order #12345',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        replies: [],
      },
      {
        id: 2,
        userEmail: 'user2@example.com',
        subject: 'Payment issue',
        message: 'I\'m having trouble with the payment gateway. It keeps showing an error.',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-01-14T15:45:00Z',
        replies: [
          {
            id: 1,
            message: 'We are investigating the payment issue. Please try again in a few minutes.',
            isAdmin: true,
            createdAt: '2024-01-14T16:00:00Z',
          },
        ],
      },
      {
        id: 3,
        userEmail: 'user3@example.com',
        subject: 'Book quality issue',
        message: 'The book I received has damaged pages. Can I get a replacement?',
        status: 'resolved',
        priority: 'low',
        createdAt: '2024-01-13T09:20:00Z',
        replies: [
          {
            id: 1,
            message: 'We apologize for the damaged book. We\'ll send you a replacement.',
            isAdmin: true,
            createdAt: '2024-01-13T10:00:00Z',
          },
        ],
      },
    ];
    setSupportTickets(mockTickets);
  }, []);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleReply = (ticket) => {
    setSelectedTicket(ticket);
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      const newReply = {
        id: Date.now(),
        message: replyMessage,
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };

      setSupportTickets(prev =>
        prev.map(ticket =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                replies: [...ticket.replies, newReply],
                status: 'in_progress',
              }
            : ticket
        )
      );

      setReplyMessage('');
      setReplyDialogOpen(false);
    }
  };

  const handleResolveTicket = (ticketId) => {
    setSupportTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: 'resolved' }
          : ticket
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Support Tickets
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {supportTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.userEmail}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status.replace('_', ' ')}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reply">
                    <IconButton
                      size="small"
                      onClick={() => handleReply(ticket)}
                      disabled={ticket.status === 'resolved'}
                    >
                      <ReplyIcon />
                    </IconButton>
                  </Tooltip>
                  {ticket.status !== 'resolved' && (
                    <Tooltip title="Mark as Resolved">
                      <IconButton
                        size="small"
                        onClick={() => handleResolveTicket(ticket.id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Ticket Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Support Ticket #{selectedTicket?.id} - {selectedTicket?.subject}
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Original Message
              </Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2">{selectedTicket.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(selectedTicket.createdAt)}
                </Typography>
              </Paper>

              {selectedTicket.replies.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Replies
                  </Typography>
                  {selectedTicket.replies.map((reply) => (
                    <Paper
                      key={reply.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        backgroundColor: reply.isAdmin ? 'primary.50' : 'grey.50',
                      }}
                    >
                      <Typography variant="body2">{reply.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reply.isAdmin ? 'Admin' : 'User'} - {formatDate(reply.createdAt)}
                      </Typography>
                    </Paper>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reply to Ticket #{selectedTicket?.id}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reply Message"
            fullWidth
            multiline
            rows={4}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendReply}
            variant="contained"
            disabled={!replyMessage.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSupportPage;
