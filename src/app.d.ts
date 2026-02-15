declare global {
  namespace App {
    type UserRole = 'user' | 'mod' | 'admin';

    interface User {
      id: string;
      username: string;
      role: UserRole;
    }

    interface Locals {
      user: User | null;
      sessionId: string;
    }
  }
}

export {};
