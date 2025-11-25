export interface NotificationChart {
  sent: number;
  failed: number;
  date: string;
}

export interface PaginatedRecipients {
  data: NotificationRecipient[];
  total: number;
}

export interface NotificationRecipient {
  id: string;
  userId: string;          
  notificationId: string;  

  status: "pending" | "sent" | "failed";  
  retryCount: number;           
  lastAttempt: string ; 

  createdAt: string;
  updatedAt: string;
  phoneNumber: string;

  
  notification?: {
    id: string;
    title: string;
    body: string;
    createdBy: string;
    createdAt: string;
  };
}


export interface CreateReminderDTO {
  title: string;
  body: string;
  triggerDates: string[];
  eventId: string;
  createdBy: string;
  recipients: { phoneNumber: string }[];
}