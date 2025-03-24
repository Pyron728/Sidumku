import express from 'express';
import { createUser, queryUsers } from '../models/user.js';

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
    let [email, password] = atob(b64auth).split(':');
    const user = (await queryUsers()).filter(user => user.email === email)[0];
    if (!user || user.password !== password) {
        return res.status(401).send('E-mail / Password mismatch');
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
    console.log('Creating user:');

    if ((await queryUsers()).filter(user => user.email === req.body.email).length > 0) {
        res.status(409);
        return res.json({message: 'E-Mail already exists'});
    } else if (!req.body.email) {
        res.status(400);
        return res.json({message: 'E-Mail missing'});
    }

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const user = await createUser(email, username, password);

    res.status(201).json(user);
});

export default router;