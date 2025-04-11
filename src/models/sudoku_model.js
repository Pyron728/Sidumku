import Datastore from '@seald-io/nedb';
const sudokuDb = new Datastore({ filename: 'sudoku.db', autoload: true });

/**
 * Creates a new Sudoku game or updates an existing one
 * @param {Object} sudoku - The Sudoku game object
 * @returns {Promise<Object>} The created or updated Sudoku game
 */
export async function createAndUpdateSudoku(sudoku) {
  const timestamp = new Date();
  if (!sudoku._id) {
    // Create new Sudoku game
    const newSudoku = {
      ...sudoku,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const inserted = await sudokuDb.insertAsync(newSudoku);
    return inserted;
  } else {
      const existingSudoku = await sudokuDb.findOneAsync({ _id: sudoku._id });
      if (!existingSudoku) {
        const newSudoku = {
          ...sudoku,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        const inserted = await sudokuDb.insertAsync(newSudoku);
        return inserted;
      } else {
        const updatedSudoku = {
          ...sudoku,
          updatedAt: timestamp
        };
        await sudokuDb.updateAsync({ _id: sudoku._id }, { $set: updatedSudoku }, {});
        return await sudokuDb.findOneAsync({ _id: sudoku._id });
    }
  }
}

/**
 * Deletes a Sudoku game by its ID
 * @param {string} sudokuId - The ID of the Sudoku game to delete
 * @returns {Promise<number>} Number of documents removed
 */
export async function deleteSudoku(sudokuId) {
  return await sudokuDb.removeAsync({ _id: sudokuId });
}

/**
 * Gets all Sudoku games for a specific user
 * @param {string} playerId - The ID of the player
 * @returns {Promise<Array>} Array of Sudoku games
 */
export async function getSudokuFromUser(playerId) {
  return await sudokuDb.findAsync({ playerId: playerId }).sort({ updatedAt: -1 });
}

/**
 * Gets a specific Sudoku game by its ID
 * @param {string} sudokuId - The ID of the Sudoku game
 * @returns {Promise<Object>} The Sudoku game
 */
export async function getSudokuById(sudokuId) {
  const sudoku = await sudokuDb.findOneAsync({ _id: sudokuId });
  return sudoku;
}