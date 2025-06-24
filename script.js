const slots = document.querySelectorAll('.slot');
const header = document.getElementById('game-header');
const balloonData = [
  { shape: 'star', emoji: '⭐' },
  { shape: 'heart', emoji: '❤️' },
  { shape: 'circle', emoji: '⚪️' }
];
let matches = 0;
const jsConfetti = new JSConfetti();
let balloonInstanceCounter = 0;
let setNumber = 1;

// Add Play Again button
let playAgainBtn = document.getElementById('play-again-btn');
if (!playAgainBtn) {
  playAgainBtn = document.createElement('button');
  playAgainBtn.id = 'play-again-btn';
  playAgainBtn.textContent = 'Play Again';
  playAgainBtn.style.display = 'none';
  playAgainBtn.style.margin = '1rem auto';
  playAgainBtn.style.padding = '0.5rem 1.5rem';
  playAgainBtn.style.fontSize = '1.2rem';
  playAgainBtn.style.background = 'var(--barbie-pink, #E0218A)';
  playAgainBtn.style.color = 'white';
  playAgainBtn.style.border = 'none';
  playAgainBtn.style.borderRadius = '8px';
  playAgainBtn.style.cursor = 'pointer';
  document.body.appendChild(playAgainBtn);
}
playAgainBtn.onclick = resetGame;

// Attach slot event listeners ONCE
slots.forEach(slot => {
  slot.addEventListener('dragenter', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    slot.classList.add('over');
  });
  slot.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });
  slot.addEventListener('dragleave', () => slot.classList.remove('over'));
  slot.addEventListener('drop', e => {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.remove('over');
    const id = e.dataTransfer.getData('text/plain');
    const b = document.getElementById(id);
    if (!b) return;
    if (b.dataset.shape === dropZone.dataset.shape) {
      dropZone.appendChild(b);
      onCorrect();
    } else {
      playAudio('wrong');
    }
  });
});

function shuffleArray(arr) {
  let array = arr.slice(); // copy to avoid mutating original
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderBalloons() {
  const container = document.getElementById('balloons');
  container.innerHTML = '';
  const shuffled = shuffleArray(balloonData);
  shuffled.forEach(({ shape, emoji }) => {
    const div = document.createElement('div');
    div.className = 'balloon';
    div.dataset.shape = shape;
    div.draggable = true;
    div.textContent = emoji;
    // Give a unique id for drag-and-drop, incrementing counter for each render
    balloonInstanceCounter++;
    div.id = `balloon-${shape}-${Math.floor(Math.random()*10000)}-${balloonInstanceCounter}`;
    container.appendChild(div);
  });
}

function clearSlots() {
  slots.forEach(slot => {
    // Remove any balloon children from slots
    const balloon = slot.querySelector('.balloon');
    if (balloon) {
      slot.removeChild(balloon);
    }
  });
}

function returnAllBalloonsToContainer() {
  const container = document.getElementById('balloons');
  slots.forEach(slot => {
    const balloon = slot.querySelector('.balloon');
    if (balloon) {
      container.appendChild(balloon);
    }
  });
}

function setupDragAndDrop() {
  const balloons = document.querySelectorAll('.balloon');
  balloons.forEach(b => {
    b.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', b.id);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => b.classList.add('hide'), 0);
    });
    b.addEventListener('dragend', () => b.classList.remove('hide'));
  });
}

function clearAllBalloons() {
  // Remove all balloons from both the main container and all slots
  document.querySelectorAll('.balloon').forEach(b => b.remove());
}

function startGame() {
  matches = 0;
  balloonInstanceCounter = 0; // Reset counter for each set
  header.textContent = `Set ${setNumber}: Match the shapes — 0/${balloonData.length}`;
  playAgainBtn.style.display = 'none'; // Always hide at start
  clearAllBalloons(); // Remove all balloons from everywhere (main container and slots)
  renderBalloons();   // Add new, randomized balloons to the main container
  setupDragAndDrop();
}

startGame();

function resetGame() {
  matches = 0; // Ensure matches is reset
  setNumber++;
  startGame(); // This will always randomize balloons
}

function onCorrect() {
  if (matches < balloonData.length) {
    playAudio('pop');
    sparkle();
    matches++;
    header.textContent = `Set ${setNumber}: Match the shapes — ${matches}/${balloonData.length}`;
    if (matches === balloonData.length) {
      celebrate();
      playAgainBtn.style.display = 'inline-block'; // Always show at completion
    }
  }
}

function playAudio(name) {
  // Uncomment and add audio files to use sound
  // new Audio(`assets/audio/${name}.mp3`).play();
}

function sparkle() {
  const last = document.querySelector('.slot .balloon:last-child');
  if (last && last.parentElement) {
    last.parentElement.classList.add('sparkle');
    setTimeout(() => last.parentElement.classList.remove('sparkle'), 500);
  }
}

function celebrate() {
  playAudio('level-up');
  jsConfetti.addConfetti({
    confettiColors: ['#E0218A', '#F18DBC'],
    emojis: ['🎉','⭐','❤️']
  });
  // Do not show playAgainBtn here, handled in onCorrect
}
