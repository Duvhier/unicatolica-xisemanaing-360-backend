import express from 'express';
import {
  twilioStatusCallback,
  twilioIncomingMessage,
  twilioDiagnostic
} from '../controllers/organizadorController.js';

const router = express.Router();

// Webhooks de Twilio (sin autenticación ya que Twilio llama directamente)
router.get('/twilio/status-callback', twilioStatusCallback);
router.post('/twilio/incoming-message', twilioIncomingMessage);
router.get('/twilio/diagnostic', twilioDiagnostic);

export default router;