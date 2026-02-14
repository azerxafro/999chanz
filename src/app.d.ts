declare global {
  namespace App {
    interface Locals {
      discordUser: {
        id: string;
        username: string;
      } | null;
      user: {
        id: string;
        username: string;
        nsfwAcceptedAt?: string | null;
      } | null;
      sessionId: string;
    }
  }
}

export {};
