class SudokuGenerator {
  constructor() {
    // Initialize empty 9x9 grid
    this.grid = Array(9).fill().map(() => Array(9).fill(0));
    this.solution = Array(9).fill().map(() => Array(9).fill(0));
  }

  /**
   * Generates a new Sudoku puzzle
   * @param {string} difficulty 
   * @returns {Array<Array<number>>} The generated puzzle
   */
  generate(difficulty = "medium") {
    // First generate a complete solution
    this.fillGrid();
    
    // Copy the solution
    this.solution = this.grid.map(row => [...row]);
    
    // Remove numbers based on difficulty
    this.removeNumbers(difficulty);
    
    return this.grid;
  }

  // Fills the grid with a valid Sudoku solution
  fillGrid() {
    this.grid = Array(9).fill().map(() => Array(9).fill(0));
    this.fillCell(0, 0);
  }

  // Recursive function to fill cells in the grid
  fillCell(row, col) {
    if (row === 9) {
      return true;
    }
    
    let nextRow = col === 8 ? row + 1 : row;
    let nextCol = col === 8 ? 0 : col + 1;
    
    if (this.grid[row][col] !== 0) {
      return this.fillCell(nextRow, nextCol);
    }
    
    // Create shuffled array of numbers 1-9
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // Try each number
    for (let i = 0; i < 9; i++) {
      const num = numbers[i];
      
      if (this.isValid(row, col, num)) {
        this.grid[row][col] = num;
        
        if (this.fillCell(nextRow, nextCol)) {
          return true;
        }
        
        // Backtracking
        this.grid[row][col] = 0;
      }
    }
    
    return false;
  }

  // Checks if a number is valid at a position
  isValid(row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (this.grid[row][c] === num) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (this.grid[r][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 block
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.grid[blockRow + r][blockCol + c] === num) {
          return false;
        }
      }
    }
    
    return true;
  }

  
  // Removes numbers from the grid based on difficulty
  removeNumbers(difficulty) {
    const removedCellsBasedOnDifficulty = {
      "easy": 30,
      "medium": 50,
      "hard": 60
    }[difficulty] || 50;
    

    this.grid = this.solution.map(row => [...row]);
    
    // List of filled positions
    const filledPositions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        filledPositions.push([r, c]);
      }
    }
    
    let emptyCells = 0;
    
    while (emptyCells < removedCellsBasedOnDifficulty && filledPositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filledPositions.length);
      const [row, col] = filledPositions[randomIndex];
      
      filledPositions.splice(randomIndex, 1);
      
      const originalValue = this.grid[row][col];
      this.grid[row][col] = 0;
      
      if (this.hasUniqueSolution()) {
        emptyCells++;
      } else {
        this.grid[row][col] = originalValue;
      }
    }
  }

  // Checks if the current grid has exactly one solution
  hasUniqueSolution() {
    const tempGrid = this.grid.map(row => [...row]);
    
    const solver = new SudokuSolver(tempGrid);
    const firstSolution = solver.solve();
    
    if (!firstSolution) {
      return false;
    }
    
    solver.grid = tempGrid.map(row => [...row]);
    
    const secondSolution = solver.findAlternativeSolution(firstSolution);
    
    return !secondSolution;
  }

  getSolution() {
    return this.solution;
  }

  // Returns a formatted string representation of the Sudoku for console checking
  formatGrid(grid = this.grid) {
    let result = '';
    
    for (let r = 0; r < 9; r++) {
      if (r % 3 === 0 && r !== 0) {
        result += '------+-------+------\n';
      }
      
      for (let c = 0; c < 9; c++) {
        if (c % 3 === 0 && c !== 0) {
          result += '| ';
        }
        
        result += grid[r][c] === 0 ? '· ' : grid[r][c] + ' ';
      }
      
      result += '\n';
    }
    
    return result;
  }
}

// Helper class to solve Sudoku puzzles and check for unique solutions
class SudokuSolver {
  constructor(grid) {
    this.grid = grid.map(row => [...row]);
    this.size = 9;
  }

  // Solves the Sudoku 
  solve() {
    if (this.solveCell(0, 0)) {
      return this.grid;
    }
    return null;
  }

  // Recursively solves cells
  solveCell(row, col) {
    if (row === this.size) {
      return true;
    }
    
    let nextRow = col === this.size - 1 ? row + 1 : row;
    let nextCol = col === this.size - 1 ? 0 : col + 1;
    
    if (this.grid[row][col] !== 0) {
      return this.solveCell(nextRow, nextCol);
    }
    
    for (let num = 1; num <= this.size; num++) {
      if (this.isValidPlacement(row, col, num)) {
        this.grid[row][col] = num;
        
        if (this.solveCell(nextRow, nextCol)) {
          return true;
        }
        
        this.grid[row][col] = 0;
      }
    }
    
    return false;
  }

  //Checks if an alternative solution exists
  findAlternativeSolution(solution) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === 0) {
          const valueInSolution = solution[row][col];
          
          for (let num = 1; num <= this.size; num++) {
            if (num !== valueInSolution && this.isValidPlacement(row, col, num)) {
              this.grid[row][col] = num;
              
              if (this.solveCell(row, col === this.size - 1 ? row + 1 : row, col === this.size - 1 ? 0 : col + 1)) {
                return this.grid;
              }
              
              this.grid[row][col] = 0;
            }
          }
          
          return null;
        }
      }
    }
    
    return null;
  }

  // Core Sudoku Logic for number placement
  isValidPlacement(row, col, num) {
    // Check row
    for (let c = 0; c < this.size; c++) {
      if (this.grid[row][c] === num) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < this.size; r++) {
      if (this.grid[r][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 block
    const blockSize = 3;
    const blockRow = Math.floor(row / blockSize) * blockSize;
    const blockCol = Math.floor(col / blockSize) * blockSize;
    
    for (let r = 0; r < blockSize; r++) {
      for (let c = 0; c < blockSize; c++) {
        if (this.grid[blockRow + r][blockCol + c] === num) {
          return false;
        }
      }
    }
    
    return true;
  }
}


function convert2DArrayToSudokuCellArray(puzzle) {
  const boardWithCells = [];
  
  for (let row = 0; row < 9; row++) {
    const rowCells = [];
    
    for (let col = 0; col < 9; col++) {
      const value = puzzle[row][col];
      
      // Create new cell object
      const cell = {
        value: value === 0 ? null : value,
        isGiven: value !== 0,
        notes: [],
        color: ""
      };
      
      rowCells.push(cell);
    }
    
    boardWithCells.push(rowCells);
  }
  
  return boardWithCells;
}

function createSudoku(difficulty) {
  const generator = new SudokuGenerator();
  const puzzleArray = generator.generate(difficulty);
  const solutionArray = generator.getSolution();

  // Console log the sudoku
  console.log("Sudoku Puzzle:");
  console.log(generator.formatGrid(puzzleArray));
  
  console.log("Solution:");
  console.log(generator.formatGrid(solutionArray));

  const currentBoard = convert2DArrayToSudokuCellArray(puzzleArray, solutionArray);
  const solvedBoard = convert2DArrayToSudokuCellArray(solutionArray, solutionArray);
  const gameId = 'sudoku_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  const sudokuObject = {
    id: gameId,
    currentBoard: currentBoard,
    solvedBoard: solvedBoard,
    difficulty: difficulty,
    mistakes: 0,
    hintsUsed: 0,
    solved: false,
    timeSpent: Date.now()
  };
  return sudokuObject;
}

export function generateSudoku(difficulty = "medium"){
  return createSudoku(difficulty)
}

// Example call
createSudoku();