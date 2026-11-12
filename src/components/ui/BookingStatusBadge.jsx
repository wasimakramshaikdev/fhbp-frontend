import React from 'react';
import { Badge } from './Badge';

export const BookingStatusBadge = ({ status }) => {
  const statusConfig = {
    PAYMENT_PENDING: { label: 'Payment Pending', variant: 'warning' },
    PENDING_OWNER_CONFIRMATION: { label: 'Awaiting Owner Response', variant: 'warning' },
    CONFIRMED: { label: 'Confirmed', variant: 'success' },
    COMPLETED: { label: 'Completed', variant: 'info' },
    REJECTED: { label: 'Declined', variant: 'danger' },
    CANCELLED_BY_CUSTOMER: { label: 'Cancelled by Customer', variant: 'danger' },
    CANCELLED_BY_OWNER: { label: 'Cancelled by Owner', variant: 'danger' },
    CANCELLED_BY_ADMIN: { label: 'Cancelled by Admin', variant: 'danger' },
    DISPUTED: { label: 'Disputed', variant: 'warning' },
    REFUND_PENDING: { label: 'Refund Pending', variant: 'warning' },
    REFUNDED: { label: 'Refunded', variant: 'warning' },
  };

  const config = statusConfig[status] || { label: status || 'Unknown', variant: 'default' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
