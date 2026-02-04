import { User } from './types.js';

// 模拟数据库数据
let users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];

let nextId = 4;

export function getAllUsers(): User[] {
  return [...users];
}

export function getUserById(id: number): User | undefined {
  return users.find(user => user.id === id);
}

export function createUser(name: string, email: string): User {
  const newUser: User = {
    id: nextId++,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  return newUser;
}

export function deleteUser(id: number): boolean {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
}

export function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const user = users.find(u => u.id === id);
  if (user) {
    Object.assign(user, updates);
    return user;
  }
  return null;
}

export function resetData(): void {
  users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      createdAt: '2024-01-03T00:00:00.000Z',
    },
  ];
  nextId = 4;
}
