declare global {
  namespace App {
    interface Locals {
      discordUser: {
        id: string;
        username: string;
      } | null;
      sessionId: string;
    }
  }
}

export {};
