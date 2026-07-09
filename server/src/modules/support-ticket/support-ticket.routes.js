const express = require('express');
const supportTicketController = require('./support-ticket.controller');
const ticketReplyController = require('./ticket-reply.controller');
const {
  validateCreateSupportTicket,
  validateGetSupportTickets,
  validateGetSupportTicket,
  validateUpdateSupportTicket,
  validateAssignTicket,
  validateSearchTickets,
  validateStatusUpdate,
} = require('./support-ticket.validation');
const {
  validateCreateReply,
  validateUpdateReply,
} = require('./ticket-reply.validation');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, validateCreateSupportTicket, supportTicketController.createSupportTicket);

router.get('/my-tickets', authenticate, validateGetSupportTickets, supportTicketController.getUserTickets);

router.get('/search', authenticate, validateSearchTickets, supportTicketController.searchTickets);

router.get('/', authenticate, authorize(['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']), validateGetSupportTickets, supportTicketController.getAllTickets);

router.get('/:id', authenticate, validateGetSupportTicket, supportTicketController.getTicket);

router.patch('/:id', authenticate, validateUpdateSupportTicket, supportTicketController.updateTicket);

router.patch('/:id/status', authenticate, validateStatusUpdate, supportTicketController.updateTicketStatus);

router.post('/:id/assign', authenticate, authorize(['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']), validateAssignTicket, supportTicketController.assignTicket);

router.post('/:id/resolve', authenticate, authorize(['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']), validateGetSupportTicket, supportTicketController.resolveTicket);

router.post('/:id/close', authenticate, authorize(['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']), validateGetSupportTicket, supportTicketController.closeTicket);

router.post('/:id/reply', authenticate, validateCreateReply, ticketReplyController.createReply);

router.get('/:id/replies', authenticate, ticketReplyController.getReplies);

router.patch('/replies/:replyId', authenticate, validateUpdateReply, ticketReplyController.updateReply);

router.delete('/replies/:replyId', authenticate, ticketReplyController.deleteReply);

router.get('/:id/history', authenticate, supportTicketController.getTicketHistory);

router.post('/:id/escalate', authenticate, authorize(['COORDINATOR', 'ADMIN', 'SUPER_ADMIN']), supportTicketController.escalateTicket);

router.delete('/:id', authenticate, validateGetSupportTicket, supportTicketController.deleteTicket);

module.exports = router;
