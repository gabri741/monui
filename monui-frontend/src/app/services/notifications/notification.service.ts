import { createReminder} from "./notification.api";
import { CreateReminderDTO } from "./notification.types";



class NotificationService {

  async createReminder(data: CreateReminderDTO) {
    try {
      const response = await createReminder(data);
      return response;
    } catch (error) {
      console.error("Erro ao criar reminder:", error);
      throw error;
    }
  }

  

}



export const notificationService = new NotificationService();

