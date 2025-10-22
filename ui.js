export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.instructionsElement = document.getElementById('instructions');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        this.replayButton = document.getElementById('replay-button');
        this.replayViewer = document.getElementById('replay-viewer');
        this.replayVideo = document.getElementById('replay-video');
        this.closeReplayButton = document.getElementById('close-replay');
        this.downloadReplayButton = document.getElementById('download-replay');
        this.replayControlsElement = document.getElementById('replay-controls');
        this.submitStatusElement = document.getElementById('submit-status');
        this.leaderboardButton = document.getElementById('leaderboard-button');
        this.leaderboardElement = document.getElementById('leaderboard');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.closeLeaderboardButton = document.getElementById('close-leaderboard');
        this.perfectStreakElement = document.getElementById('perfect-streak');
        this.perfectStreakSpan = this.perfectStreakElement.querySelector('span');

        this.currentReplayBlob = null;
        this.streakTimeout = null;
    }

    setupEventListeners({ onPointerDown, onRestart, onViewReplay, onWindowResize, onViewLeaderboard, onCloseLeaderboard }) {
        window.addEventListener('pointerdown', onPointerDown);
        this.restartButton.addEventListener('click', onRestart);
        this.replayButton.addEventListener('click', onViewReplay);
        this.closeReplayButton.addEventListener('click', () => this.hideReplayViewer());
        this.downloadReplayButton.addEventListener('click', () => this.downloadReplay());
        this.leaderboardButton.addEventListener('click', onViewLeaderboard);
        this.closeLeaderboardButton.addEventListener('click', onCloseLeaderboard);
        window.addEventListener('resize', onWindowResize, false);
    }

    updateStreak(count, isGolden, isPerfectHit) {
        clearTimeout(this.streakTimeout);
        this.perfectStreakElement.classList.remove('visible');

        if (!isPerfectHit) {
            return;
        }

        if (isGolden) {
            this.perfectStreakElement.innerHTML = `GOLDEN! <span>${count}</span>`;
            setTimeout(() => this.perfectStreakElement.classList.add('visible'), 50);
            this.streakTimeout = setTimeout(() => this.perfectStreakElement.classList.remove('visible'), 1500);
        } else if (count > 0) {
            this.perfectStreakElement.innerHTML = `Perfect! <span>${count}</span>`;
            setTimeout(() => this.perfectStreakElement.classList.add('visible'), 50);
            this.streakTimeout = setTimeout(() => this.perfectStreakElement.classList.remove('visible'), 1500);
        }
    }

    updateScore(score) {
        this.scoreElement.innerText = score;
    }

    showInstructions(visible) {
        if (visible) {
            this.instructionsElement.classList.remove('hidden');
        } else {
            this.instructionsElement.classList.add('hidden');
        }
    }

    showGameOver(score) {
        this.finalScoreElement.innerText = score;
        this.gameOverElement.classList.remove('hidden');
        this.replayControlsElement.classList.remove('hidden');
        this.setSubmitStatus('Submitting score...', 'white');
    }

    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
        this.replayControlsElement.classList.add('hidden');
        this.updateScore(0);
        this.showInstructions(true);
    }

    showReplayViewer(blobOrUrl) {
        let url;
        if (blobOrUrl instanceof Blob) {
            this.currentReplayBlob = blobOrUrl;
            url = URL.createObjectURL(blobOrUrl);
        } else {
            url = blobOrUrl;
            this.currentReplayBlob = null;
            this.downloadReplayButton.style.display = 'none';
        }

        this.replayVideo.src = url;
        this.gameOverElement.classList.add('hidden');
        this.hideLeaderboard();
        this.replayViewer.classList.remove('hidden');
    }

    hideReplayViewer() {
        this.replayViewer.classList.add('hidden');
        this.gameOverElement.classList.remove('hidden');
        if (this.replayVideo.src && this.currentReplayBlob) {
            URL.revokeObjectURL(this.replayVideo.src);
        }
        this.replayVideo.src = '';
        this.downloadReplayButton.style.display = 'inline-block';
    }
    
    downloadReplay() {
        if (!this.currentReplayBlob) return;
        
        const url = URL.createObjectURL(this.currentReplayBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stacker-replay-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    setReplayButtonState(disabled, text) {
        this.replayButton.disabled = disabled;
        this.replayButton.textContent = text;
    }

    setSubmitStatus(text, color = 'white') {
        if (this.submitStatusElement) {
            this.submitStatusElement.textContent = text;
            this.submitStatusElement.style.color = color;
        }
    }

    showLeaderboard() {
        this.leaderboardElement.classList.remove('hidden');
        this.gameOverElement.classList.add('hidden');
    }

    hideLeaderboard() {
        this.leaderboardElement.classList.add('hidden');
    }

    updateLeaderboard(scores, onViewReplayCallback) {
        this.leaderboardList.innerHTML = '';
        if (scores.length === 0) {
            this.leaderboardList.innerHTML = '<li>No scores yet. Be the first!</li>';
            return;
        }

        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="username">${entry.username}</span>
                <span class="score">${entry.score}</span>
            `;
            if (entry.replayUrl) {
                const button = document.createElement('button');
                button.textContent = '▶️';
                button.onclick = () => onViewReplayCallback(entry.replayUrl);
                li.appendChild(button);
            }
            this.leaderboardList.appendChild(li);
        });
    }
}