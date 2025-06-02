const firebaseConfig = {
  apiKey: "AIzaSyAE4E4I_BFedhnf4k5XG0zQkhMa5qR_N7Q",
  authDomain: "typing-practice-71c79.firebaseapp.com",
  projectId: "typing-practice-71c79",
  storageBucket: "typing-practice-71c79.appspot.com",
  messagingSenderId: "516338322050",
  appId: "1:516338322050:web:7994eef25e3fb92717c29b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Quotes by difficulty
const quotesByLevel = {
  beginner: [
    "The sun rises in the east and sets in the west.",
    "He is reading a book by the window.",
    "This is a beautiful garden with many flowers."
  ],
  medium: [
    "It was the best of times, it was the worst of times.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "The moment you doubt whether you can fly, you cease forever to be able to do it."
  ],
  high: [
    "It is a melancholy truth that even great men have their poor relations.",
    "In the midst of the war, the city stood quiet for the first time in months.",
    "It was a bright cold day in April, and the clocks were striking thirteen."
  ]
};

const quoteElement = document.getElementById("quoteText");
const inputArea = document.getElementById("inputArea");
const resultElement = document.getElementById("result");
const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("startBtn");
const gameArea = document.getElementById("gameArea");

let selectedQuote = "";
let startTime = null;
let hasStarted = false;

function selectQuoteByDifficulty(level) {
  const quotes = quotesByLevel[level];
  const randomIndex = Math.floor(Math.random() * quotes.length);
  selectedQuote = quotes[randomIndex];
  quoteElement.textContent = selectedQuote;
  inputArea.value = "";
  resultElement.innerHTML = "";
  hasStarted = false;
  inputArea.disabled = false;
}

function calculateScore(time) {
  if (time < 30) return 100;
  if (time < 60) return 80;
  if (time < 90) return 60;
  if (time < 120) return 40;
  return 20;
}

function getWordList(text) {
  return [...new Set(text.toLowerCase().match(/\b[a-z]+\b/g))];
}

async function fetchDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (response.ok) {
      const data = await response.json();
      return data[0]?.meanings?.[0]?.definitions?.[0]?.definition || "(Definition not found)";
    }
  } catch {}
  return "(Definition not found)";
}

async function displayResults(timeTaken, score, wordList) {
  let wordHtml = '<ul>';
  for (let word of wordList) {
    const definition = await fetchDefinition(word);
    wordHtml += `<li><strong>${word}</strong><div class="definition">${definition}</div></li>`;
  }
  wordHtml += '</ul>';

  resultElement.innerHTML = `
    <p>Time taken: ${timeTaken.toFixed(2)} seconds</p>
    <p>Your score: ${score}</p>
    <div class="word-list">
      <strong>Word list with definitions:</strong><br />
      ${wordHtml}
    </div>
  `;
}

function highlightMistakes() {
  const typed = inputArea.value;
  const expected = selectedQuote;
  let highlighted = "";
  for (let i = 0; i < expected.length; i++) {
    const char = typed[i] || "";
    if (char === expected[i]) {
      highlighted += expected[i];
    } else if (char !== undefined) {
      highlighted += `<span class="highlight">${expected[i]}</span>`;
    } else {
      highlighted += expected[i];
    }
  }
  quoteElement.innerHTML = highlighted;
}

inputArea.addEventListener("input", async () => {
  if (!hasStarted) {
    hasStarted = true;
    startTime = new Date();
  }

  highlightMistakes();

  if (inputArea.value === selectedQuote) {
    const timeTaken = (new Date() - startTime) / 1000;
    const score = calculateScore(timeTaken);
    const wordList = getWordList(selectedQuote);

    inputArea.disabled = true;
    await displayResults(timeTaken, score, wordList);

    // Save score to Firebase
    db.collection("typingScores").add({
      time: timeTaken,
      score: score,
      quote: selectedQuote,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
});

startBtn.addEventListener("click", () => {
  const difficulty = difficultySelect.value;
  gameArea.style.display = "block";
  selectQuoteByDifficulty(difficulty);
});

window.onload = () => {
  gameArea.style.display = "none";
};