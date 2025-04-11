import express from 'express';
import { createAndUpdateSudoku, deleteSudoku, getSudokuFromUser, getSudokuById } from '../models/sudoku_model.js';
import { authorizeUser } from './user_controller.js';

const router = express.Router();

/**
 * Validate the input for a sudoku game
 */
async function validateSudokuInput(req, res, next) {
    if (!req.body.playerId) {
        return res.status(400).json({ message: 'Player ID missing' });
    } else if (!req.body.currentBoard) {
        return res.status(400).json({ message: 'Current board missing' });
    } else if (!req.body.solvedBoard) {
        return res.status(400).json({ message: 'Solved board missing' });
    } else if (!req.body.difficulty) {
        return res.status(400).json({ message: 'Difficulty missing' });
    } else if (!['easy', 'medium', 'hard'].includes(req.body.difficulty)) {
        return res.status(400).json({ message: 'Invalid difficulty level' });
    } else {
        next();
    }
}

/**
 * Get all sudoku games for the authenticated user
 */
router.get('/', authorizeUser, async (req, res) => {
    try {
        const sudokuGames = await getSudokuFromUser(req.body.user._id);
        res.json(sudokuGames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get a specific sudoku game by ID
 */
router.get('/:sudokuId', async (req, res) => {
    try {
        const sudokuId = req.params.sudokuId;
        const sudoku = await getSudokuById(sudokuId);
        if (!sudoku) {
            return res.status(404).json({ message: `Sudoku with ID ${sudokuId} not found` });
        }
        res.json(sudoku);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Create a new sudoku game
 */
router.post('/', validateSudokuInput, async (req, res) => {
    try {
        const sudoku = req.body;
        if (!sudoku) {
            return res.status(400).json({ message: `Sudoku is missing. The Sudoku is ${sudoku}` });
        }
        const sudokuAlreadyExists = await getSudokuById(sudoku._id)
        if (sudokuAlreadyExists) {
            return res.status(403).json({ message: `Sudoku with ID ${sudoku._id} already exists` });       
        }
        const response = await createAndUpdateSudoku(sudoku);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Update an existing sudoku game
 */
router.put('/:sudokuId', validateSudokuInput, async (req, res) => {
    try {
        const sudokuId = req.params.sudokuId;
        const sudoku = await getSudokuById(sudokuId);
        if (!sudoku) {
            return res.status(404).json({ message: 'Sudoku game not found' });
        }
        const sudokuData = req.body
        const response = await createAndUpdateSudoku(sudokuData);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Delete a sudoku game
 */
router.delete('/:sudokuId', authorizeUser, async (req, res) => {
    try {
        const sudokuId = req.params.sudokuId;
        const sudoku = await getSudokuById(sudokuId);
        if (!sudoku) {
            return res.status(404).json({ message: 'Sudoku game not found' });
        }
        
        await deleteSudoku(sudokuId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;