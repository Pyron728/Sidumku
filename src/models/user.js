import Datastore from '@seald-io/nedb';

const userDb = new Datastore({ filename: 'user.db', autoload: true });

export async function createUser(username, password) {
    const currentTimestamp = new Date().toISOString();
    const user = {
        username: username,
        password: password,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
    };
    return await userDb.insertAsync(user);
}

export async function deleteUser(userId) {
    return await userDb.removeAsync({ _id: userId });
}

export async function queryUsers() {
    return await userDb.findAsync({});
}