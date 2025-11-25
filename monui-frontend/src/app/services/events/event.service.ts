
import { createEvent } from "./event.api";
import { CreateEventDTO } from "./event.types";


class EventService {
  async createEvent(data: CreateEventDTO) {
    try {
      const response = await createEvent(data);
      return response;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }

}

export const eventService = new EventService();
