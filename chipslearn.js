class Chipslearn {
  state = {
    activeTab: 'edit',
    text: '',
    sentences: [],
    availableWords: [],
    confirmedSection: [],
    proposedSection: [],
    correctSentence: [],
    score: 0,
    learning: false,
    messageClass: 'info',
    completedSentences: 0,
    currentSentenceIndex: 0,
    hintWord: null,
    usedHints: 0,
    sessionTotalUsedHints: 0
  };

  constructor(state, resetSentence) {
    this.state = state;
    this.resetSentence = resetSentence;
  }

  moveToUserSentence(word, index) {
    this.state.proposedSection.push(word);
    this.state.availableWords.splice(index, 1);
    if (this.state.availableWords.length === 0) {
      this.checkOrder();
    }
    this.state.hintWord = null;
  }

  moveBackToAvailableWords(word, index) {
    this.state.availableWords.push(word);
    this.state.proposedSection.splice(index, 1);
    this.state.hintWord = null;
  }

  checkOrder() {
    const correct = this.state.confirmedSection.concat(this.state.proposedSection).join(' ') === this.state.correctSentence.join(' ');
    if (correct) {
      if (this.state.usedHints === 0) {
        this.state.score += 10;
      } else {
        this.state.score += Math.max(0, Math.round(10 * (this.state.correctSentence.length - this.state.usedHints) / this.state.correctSentence.length));
      }
      this.state.completedSentences++;
      this.state.currentSentenceIndex++;
      this.resetSentence();
    } else {
      // Find the index of the first incorrect word
      let incorrectIndex = 0;
      for (let i = 0; i < this.state.proposedSection.length; i++) {
        if (this.state.proposedSection[i] !== this.state.correctSentence[i]) {
          incorrectIndex = i;
          break;
        }
      }

      // Move incorrect words back to availableWords
      for (let i = this.state.proposedSection.length - 1; i >= incorrectIndex; i--) {
        const word = this.state.proposedSection[i];
        this.state.availableWords.push(word);
        this.state.proposedSection.splice(i, 1);
      }
    }
  }

  hint() {
    // Move incorrect words back to availableWords
    for (let i = this.state.proposedSection.length - 1; i >= 0; i--) {
      if (this.state.proposedSection[i] !== this.state.correctSentence[i]) {
        const word = this.state.proposedSection[i];
        this.state.availableWords.push(word);
        this.state.proposedSection.splice(i, 1);
      }
    }

    // Highlight the next correct word
    if (this.state.proposedSection.length < this.state.correctSentence.length) {
      this.state.hintWord = this.state.correctSentence[this.state.proposedSection.length];
    }
    this.state.usedHints++;
    this.state.sessionTotalUsedHints++;
  }
}

export default Chipslearn;
