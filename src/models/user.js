import Datastore from '@seald-io/nedb';

const userDb = new Datastore({ filename: 'user.db', autoload: true });

export async function createUser(email, username, password) {
    const currentTimestamp = new Date().toISOString();
    const user = {
        email: email,
        username: username,
        password: password,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
    };
    return await userDb.insertAsync(user);
}

export async function queryUsers() {
    return await userDb.findAsync({});
}