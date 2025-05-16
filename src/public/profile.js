import { ApiService } from "./services/api.service.js";

const username = localStorage.getItem("username") || "undefined";
document.getElementById("username").textContent = username;

if (localStorage.getItem("username") == null) {
    window.location.href = '/';
}

async function fetchAndDisplayProfile() {
    const apiService = new ApiService();
    let sudokus = await apiService.getAllSudokus(
        localStorage.getItem("username"),
        localStorage.getItem("password")
    );
    console.log("Sudoku data:", sudokus);

    if (!sudokus || sudokus.length === 0) {
        console.warn("Keine Sudoku-Daten gefunden.");
        return;
    }

    const stats = extractStats(sudokus);

    document.getElementById("gamesWon").textContent = stats.won;
    document.getElementById("bestTime").textContent = stats.bestTime;
    document.getElementById("avgHints").textContent = stats.avgHints;
    document.getElementById("avgTime").textContent = stats.avgTime;
    document.getElementById("avgErrors").textContent = stats.avgMistakes;

    const container = document.getElementById("difficultyBreakdown");
    for (const [level, count] of Object.entries(stats.difficultyCount)) {
        const div = document.createElement("div");
        div.textContent = `${level}: ${count}`;
        div.style.fontWeight = "600";
        container.appendChild(div);
    }
}

function extractStats(sudokuList) {
    const stats = {
        total: sudokuList.length,
        won: 0,
        bestTime: Infinity,
        totalHints: 0,
        totalTime: 0,
        totalMistakes: 0,
        difficultyCount: {}
    };

    for (const s of sudokuList) {
        if (s.solved) {
            stats.won++;
            if (s.timeSpent > 0) stats.bestTime = Math.min(stats.bestTime, s.timeSpent);
        }

        stats.totalHints += s.hintsUsed ?? 0;
        stats.totalTime += s.timeSpent ?? 0;
        stats.totalMistakes += s.mistakes ?? 0;

        const diff = s.difficulty || "Unbekannt";
        stats.difficultyCount[diff] = (stats.difficultyCount[diff] || 0) + 1;
    }

    const avg = (val) => (val / stats.total).toFixed(1);
    return {
        won: stats.won,
        bestTime: isFinite(stats.bestTime) ? stats.bestTime + "s" : "–",
        avgHints: avg(stats.totalHints),
        avgTime: avg(stats.totalTime) + "s",
        avgMistakes: avg(stats.totalMistakes),
        difficultyCount: stats.difficultyCount
    };
}

fetchAndDisplayProfile();