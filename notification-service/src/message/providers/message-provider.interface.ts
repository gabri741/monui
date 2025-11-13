export interface MessageProvider {
  sendMessage(to: string, message: string): Promise<void>;
}