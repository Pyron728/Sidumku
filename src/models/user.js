import Datastore from '@seald-io/nedb';

class UserService {
  constructor() {
    this.userDb = new Datastore({ filename: 'user.db', autoload: true });
    this.loggedInUser = null;
  }

  async createUser(username, password) {
    if (!username) {
      throw new Error('Username missing');
    }
    if (!password) {
      throw new Error('Password missing');
    }

    const existingUsers = await this.queryUsers();
    if (existingUsers.filter(user => user.username === username).length > 0) {
      throw new Error('User with this name already exists');
    }

    const currentTimestamp = new Date().toISOString();
    const user = {
      username: username,
      password: password,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };
    
    return await this.userDb.insertAsync(user);
  }

  /*Codebeispiel für Registration, einfach nen normaler Methodenaufruf:
  try {
        const newUser = await userService.createUser(
          this.usernameInput.value, 
          this.passwordInput.value
        );  
      } catch (error) {
        console.error('Registrierung fehlgeschlagen:', error.message);
        ->hier halt noch die fehlermeldung anzeigen
      }
    });
    */

  async login(username, password) {
    const users = await this.queryUsers();
    const user = users.filter(user => user.username === username)[0];
    
    if (!user || user.password !== password) {
      throw new Error('Username / Password mismatch');
    }
    
    this.loggedInUser = user;
    return user;
  }

  async logout() {
    this.loggedInUser = null;
  }

  getCurrentUser() {
    return this.loggedInUser;
  }

  async getUserById(userId) {
    const users = await this.queryUsers();
    const user = users.filter(user => user._id === userId)[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { username: user.username };
  }

  async deleteUser(userId) {
    const users = await this.queryUsers();
    const user = users.filter(user => user._id === userId)[0];
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return await this.userDb.removeAsync({ _id: userId });
  }

  async queryUsers() {
    return await this.userDb.findAsync({});
  }
}

const userService = new UserService();
export default userService;