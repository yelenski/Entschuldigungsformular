import { 
  users, 
  absences, 
  type User, 
  type InsertUser, 
  type Absence, 
  type InsertAbsence
} from "@shared/schema";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Absence related methods
  getAbsence(id: number): Promise<Absence | undefined>;
  getAbsencesByStatus(status: string): Promise<Absence[]>;
  getAllAbsences(): Promise<Absence[]>;
  createAbsence(absence: InsertAbsence): Promise<Absence>;
  updateAbsenceStatus(id: number, status: string, processedDate: string): Promise<Absence | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private absences: Map<number, Absence>;
  private userCurrentId: number;
  private absenceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.absences = new Map();
    this.userCurrentId = 1;
    this.absenceCurrentId = 1;
    
    // Add some initial users for testing
    this.seedUsers();
  }

  private seedUsers() {
    const sampleUsers: InsertUser[] = [
      {
        username: "student",
        password: "password",
        role: "student",
        name: "Max Mustermann"
      },
      {
        username: "teacher",
        password: "password",
        role: "teacher",
        name: "Frau Müller"
      }
    ];

    sampleUsers.forEach(user => this.createUser(user));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAbsence(id: number): Promise<Absence | undefined> {
    return this.absences.get(id);
  }

  async getAbsencesByStatus(status: string): Promise<Absence[]> {
    return Array.from(this.absences.values()).filter(
      (absence) => absence.status === status
    );
  }
  
  async getAllAbsences(): Promise<Absence[]> {
    return Array.from(this.absences.values());
  }

  async createAbsence(insertAbsence: InsertAbsence): Promise<Absence> {
    const id = this.absenceCurrentId++;
    const absence: Absence = { 
      ...insertAbsence, 
      id, 
      status: "pending",
      processedDate: null
    };
    this.absences.set(id, absence);
    return absence;
  }

  async updateAbsenceStatus(id: number, status: string, processedDate: string): Promise<Absence | undefined> {
    const absence = await this.getAbsence(id);
    
    if (!absence) {
      return undefined;
    }
    
    const updatedAbsence: Absence = {
      ...absence,
      status,
      processedDate
    };
    
    this.absences.set(id, updatedAbsence);
    return updatedAbsence;
  }
}

export const storage = new MemStorage();
