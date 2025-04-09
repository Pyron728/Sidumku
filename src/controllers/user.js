import express from 'express';
import { createUser, deleteUser, queryUsers } from '../models/user.js';

const router = express.Router();

async function validateInput(req, res, next) {
    if (!req.body.username) {
        res.status(400);
        res.json({message: 'Username missing'});
    } else if (!req.body.password) {
        res.status(400);
        res.json({message: 'Password missing'});
    } else {
        next();
    }
}

export async function validateUser(req, res, next) {
    const b64auth = req.headers.authorization?.split(' ')[1];
    if (!b64auth) {
        return res.status(401).send('Authorization required');
    }
    let [username, password] = atob(b64auth).split(':');
    const user = (await queryUsers()).filter(user => user.username === username)[0];
    if (!user || user.password !== password) {
        return res.status(401).send('Username / Password mismatch');
    }
    res.status(202);
    req.body.user = user;
    next();
}

router.get('/', validateUser, async (req, res) => {
    res.json(req.body.user);
});

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = (await queryUsers()).filter(user => user._id === userId)[0];
    if (!user) {
        return res.status(404).send();
    }

    res.json({username: user.username});
});

router.post('/', validateInput, async (req, res) => {
    if ((await queryUsers()).filter(user => user.username === req.body.username).length > 0) {
        res.status(409);
        return res.json({message: 'User with this name already exists'});
    } else if (!req.body.username) {
        res.status(400);
        return res.json({message: 'Username missing'});
    }

    const username = req.body.username;
    const password = req.body.password;

    const user = await createUser(username, password);

    res.status(201).json(user);
});

router.delete('/:userId', validateUser, async (req, res) => {
    const userId = req.params.userId;
    const user = (await queryUsers()).filter(user => user._id === userId)[0];
    if (!user) {
        res.status(404);
        return res.json({message: 'User not found'});
    }

    await deleteUser(userId);
    res.status(204).send();
});

export default router;