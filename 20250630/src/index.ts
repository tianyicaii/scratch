/**
 * Main entry point for the TypeScript project
 */

interface User {
  id: number;
  name: string;
  email: string;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`User ${user.name} added successfully!`);
  }

  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  removeUser(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      const removedUser = this.users.splice(index, 1)[0];
      if (removedUser) {
        console.log(`User ${removedUser.name} removed successfully!`);
      }
      return true;
    }
    return false;
  }
}

// Example usage
function main(): void {
  console.log('🚀 TypeScript Project Started!');
  
  const userManager = new UserManager();
  
  // Add some sample users
  userManager.addUser({ id: 1, name: 'Alice', email: 'alice@example.com' });
  userManager.addUser({ id: 2, name: 'Bob', email: 'bob@example.com' });
  
  // Display all users
  console.log('All users:', userManager.getAllUsers());
  
  // Get a specific user
  const user = userManager.getUser(1);
  if (user) {
    console.log('Found user:', user);
  }
  
  console.log('✅ Example completed successfully!');
}

// Run the main function
main(); 