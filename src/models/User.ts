import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { User, LoginDto } from '../types/auth';
import { hashPassword, comparePassword } from '../utils/auth';

// Simple path resolution: __dirname will be dist/models in production, src/models in dev
// So ../data/users.json resolves to dist/data/users.json (prod) or src/data/users.json (dev)
const USERS_FILE = join(__dirname, '../data/users.json');

export class UserModel {
  private static readUsers(): User[] {
    try {
      const data = readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private static writeUsers(users: User[]): void {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }

  static findByUsername(username: string): User | null {
    const users = this.readUsers();
    return users.find((u) => u.username === username) || null;
  }

  static async validateLogin(credentials: LoginDto): Promise<User | null> {
    const user = this.findByUsername(credentials.username);
    if (!user) {
      return null;
    }

    // Prevent sending hashed password as credentials
    if (credentials.password.startsWith('$2a$') || credentials.password.startsWith('$2b$')) {
      return null;
    }

    // Ensure user password is hashed
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const hashed = await hashPassword(credentials.password);
      user.password = hashed;
      const users = this.readUsers();
      const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
      this.writeUsers(updatedUsers);
    }

    // Compare plain text password with hashed password
    const isValid = await comparePassword(credentials.password, user.password);
    return isValid ? user : null;
  }

  static async createDefaultAdmin(): Promise<void> {
    const users = this.readUsers();
    if (users.length === 0) {
      const defaultPassword = await hashPassword('admin123');
      const admin: User = {
        id: 'admin-001',
        username: 'admin',
        password: defaultPassword,
        role: 'admin',
      };
      this.writeUsers([admin]);
    }
  }
}

