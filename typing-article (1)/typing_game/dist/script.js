const firebaseConfig = {
  apiKey: "AIzaSyAE4E4I_BFedhnf4k5XG0zQkhMa5qR_N7Q",
  authDomain: "typing-practice-71c79.firebaseapp.com",
  projectId: "typing-practice-71c79",
  storageBucket: "typing-practice-71c79.firebasestorage.app",
  messagingSenderId: "516338322050",
  appId: "1:516338322050:web:7994eef25e3fb92717c29b",
  measurementId: "G-C4KXJ2JRHW"
};
const quotes = [
  `It is a melancholy truth that even great men have their poor relations. Dickens opens 'The Christmas Books' with this dry observation, and it sets the tone for the entirety of the story. As we navigate the plight of Ebenezer Scrooge, we are reminded that kindness costs nothing but delivers much.`,

  `In the midst of the war, the city stood quiet for the first time in months. Buildings were shattered, windows blown out, but the air was still. The people waited for what came next, uncertain if peace had finally arrived or if another storm was building beyond the horizon.`,

  `It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions. Though not quickly enough to prevent a swirl of gritty dust from entering along with him.`
];

const quoteElement = document.getElementById("quoteText");
const inputArea = document.getElementById("inputArea");
const resultElement = document.getElementById("result");
let selectedQuote = "";
let startTime = null;
let hasStarted = false;

function selectRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  selectedQuote = quotes[randomIndex];
  quoteElement.textContent = selectedQuote;
}

function calculateScore(timeTaken) {
  if (timeTaken < 30) return 100;
  if (timeTaken < 60) return 80;
  if (timeTaken < 90) return 60;
  if (timeTaken < 120) return 40;
  return 20;
}

function getWordList(text) {
  return [...new Set(text.toLowerCase().match(/\b[a-z]+\b/g))];
}

async function fetchDefinition(word) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  if (response.ok) {
    const data = await response.json();
    if (data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
      return data[0].meanings[0].definitions[0].definition;
    }
  }
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

inputArea.addEventListener("keydown", () => {
  if (!hasStarted) {
    hasStarted = true;
    startTime = new Date();
  }
});

inputArea.addEventListener("input", async () => {
  if (inputArea.value.trim() === selectedQuote) {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    const score = calculateScore(timeTaken);
    const wordList = getWordList(selectedQuote);

    inputArea.disabled = true;
    await displayResults(timeTaken, score, wordList);
  }
});

window.onload = () => {
  selectRandomQuote();
};