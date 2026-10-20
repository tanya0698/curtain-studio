import type { OrderStatus } from '../types';

// Orders progress linearly through these — 'cancelled' is a separate,
// out-of-band terminal state that doesn't fit on this track (it can happen
// from any prior status), so it's handled separately wherever this is used.
export const ORDER_STATUS_STEPS: { key: OrderStatus; title: string }[] = [
  { key: 'pending_payment', title: 'Payment' },
  { key: 'paid', title: 'Paid' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'ready', title: 'Ready' },
  { key: 'delivered', title: 'Delivered' },
];

export const orderStatusStepIndex = (status: OrderStatus): number =>
  ORDER_STATUS_STEPS.findIndex(s => s.key === status);

// Pre-filled WhatsApp message text, contextual to where an order currently
// stands. Used both for the customer messaging the business, and the admin
// messaging the customer.
export const orderWhatsAppMessage = (orderId: string, status: OrderStatus): string => {
  const ref = `#${orderId.slice(0, 8).toUpperCase()}`;
  switch (status) {
    case 'pending_payment':
      return `Hi, I have a question about my order ${ref}.`;
    case 'paid':
      return `Hi, checking in on order ${ref} — I see it's been paid, just wondering about next steps.`;
    case 'in_progress':
      return `Hi, checking in on order ${ref} — I see it's in progress.`;
    case 'ready':
      return `Hi, I saw order ${ref} is ready — when can I collect/receive it?`;
    case 'delivered':
      return `Hi, following up on order ${ref}.`;
    case 'cancelled':
      return `Hi, I have a question about order ${ref} — I see it was cancelled.`;
    default:
      return `Hi, I have a question about order ${ref}.`;
  }
};
