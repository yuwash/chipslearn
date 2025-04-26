class Chipslearn {
  state = {
    sentences: [],
    availableWords: [],
    confirmedSection: [],
    proposedSection: [],
    correctSentence: [],
    score: 0,
    completedSentences: 0,
    currentSentenceIndex: 0,
    hintWord: null,
    usedHints: 0,
    sessionTotalUsedHints: 0,
    autocheckForWords: 2,
    totalTime: 0,
    totalWords: 0,
    lastMoveTime: null,
    autoHintAfter: 2000
  };

  constructor(state) {
    this.state = state;
    this.setupAutoHint();
  }

  get progress() {
    return 0 < this.state.sentences.length ? (
      (this.state.completedSentences / this.state.sentences.length) * 100
    ): 0;
  }

  get averageTime() {
    return 0 < this.state.totalTime ? (
      this.state.totalTime / this.state.totalWords
    ): null;
  }

  resetSentence() {
    this.state.correctSentence = this.state.sentences[this.state.currentSentenceIndex] || [];
    this.state.availableWords = [...this.state.correctSentence]; // Store the correct sentence
    this.state.availableWords.sort();
    this.state.confirmedSection = [];
    this.state.proposedSection = [];
    this.state.hintWord = null;
    this.state.usedHints = 0;
  }

  restart(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    this.state.sentences = sentences.map(sentence => sentence.trim().split(/\s+/)).reduce(
      (acc, current) => {
        if (current.length < 5 && 0 < acc.length) {
          acc[acc.length - 1] = acc[acc.length - 1].concat(current);
        } else if (0 < current.length) {
          acc.push(current);
        }
        return acc;
      },
      []
    );
    this.state.currentSentenceIndex = 0;
    this.resetSentence();
    this.state.completedSentences = 0;
    this.state.sessionTotalUsedHints = 0;
    this.state.totalTime = 0;
    this.state.totalWords = 0;
    this.state.lastMoveTime = performance.now();
    this.setupAutoHint();
  }

  moveToUserSentence(word, index) {
    const now = performance.now();
    this.state.proposedSection.push(word);
    this.state.availableWords.splice(index, 1);
    if (this.state.availableWords.length === 0) {
      this.checkOrder();
    } else if (this.state.autocheckForWords && this.state.proposedSection.length >= this.state.autocheckForWords) {
      this.moveBackIncorrectWords();
    }
    this.state.hintWord = null;
    this.state.lastMoveTime = now;
  }

  moveBackToAvailableWords(word, index) {
    this.state.availableWords.push(word);
    this.state.proposedSection.splice(index, 1);
    this.state.hintWord = null;
  }

  checkOrder() {
    const correct = this.state.confirmedSection.concat(this.state.proposedSection).join(' ') === this.state.correctSentence.join(' ');
    if (correct) {
      const now = performance.now();
      if (this.state.usedHints === 0) {
        this.state.score += 10;
      } else {
        this.state.score += Math.max(0, Math.round(10 * (this.state.correctSentence.length - this.state.usedHints) / this.state.correctSentence.length));
      }
      this.state.completedSentences++;
      this.state.currentSentenceIndex++;
      const timeTaken = now - this.state.lastMoveTime;
      this.state.totalTime += timeTaken;
      this.state.totalWords++;
      this.resetSentence();
    } else {
      this.moveBackIncorrectWords();
    }
  }

  moveBackIncorrectWords() {
    const confirmedLength = this.state.confirmedSection.length;
    const incorrectIndex = this.state.proposedSection.findIndex(
      (word, index) => word !== this.state.correctSentence[confirmedLength + index]
    )
    if (incorrectIndex < 0) {  // Everything is correct.
      this.state.confirmedSection.push(...this.state.proposedSection);
      this.state.proposedSection = [];
      return;
    }

    // Move correct words to confirmedSection
    const additionalConfirmed = this.state.proposedSection.splice(0, incorrectIndex);
    this.state.confirmedSection.push(...additionalConfirmed);

    // Move incorrect words back to availableWords
    this.state.availableWords.push(...this.state.proposedSection);
    this.state.proposedSection = [];
  }

  hint() {
    this.moveBackIncorrectWords();
    const totalUserWords = this.state.confirmedSection.length + this.state.proposedSection.length;

    // Highlight the next correct word
    if (totalUserWords < this.state.correctSentence.length) {
      this.state.hintWord = this.state.correctSentence[totalUserWords];
    }
    this.state.usedHints++;
    this.state.sessionTotalUsedHints++;
    this.state.lastMoveTime = performance.now();
  }

  moveBackIncorrectWords() {
    const confirmedLength = this.state.confirmedSection.length;
    const incorrectIndex = this.state.proposedSection.findIndex(
      (word, index) => word !== this.state.correctSentence[confirmedLength + index]
    )
    if (incorrectIndex < 0) {  // Everything is correct.
      this.state.confirmedSection.push(...this.state.proposedSection);
      this.state.proposedSection = [];
      return;
    }

    // Move correct words to confirmedSection
    const additionalConfirmed = this.state.proposedSection.splice(0, incorrectIndex);
    this.state.confirmedSection.push(...additionalConfirmed);

    // Move incorrect words back to availableWords
    this.state.availableWords.push(...this.state.proposedSection);
    this.state.proposedSection = [];
  }

  setupAutoHint() {
    clearInterval(this.autoHintInterval); // Clear existing interval if any
    if (!this.state.autoHintAfter) {
      return;
    }
    this.autoHintInterval = setInterval(() => {
      if (
        this.state.hintWord === null &&
        this.state.correctSentence.length > 0 &&
        performance.now() - this.state.lastMoveTime > this.state.autoHintAfter
      ) {
        this.hint();
        m.redraw(); // Trigger Mithril to redraw the view
      }
    }, this.state.autoHintAfter);
  }
}

export default Chipslearn;
