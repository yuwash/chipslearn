const app = {
  state: {
    activeTab: 'edit',
    text: '',
    sentences: [],
    availableWords: [],
    userSentence: [],
    correctSentence: [],
    score: 0,
    learning: false,
    message: '',
    completedSentences: 0,
    currentSentenceIndex: 0,
  },
   setActiveTab: function(tab) {
    this.state.activeTab = tab;
  },
  setText: function(text) {
    this.state.text = text;
    this.processText();
  },
  processText: function() {
    const sentences = this.state.text.match(/[^.!?]+[.!?]+/g) || [];
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
    console.log(this.state.sentences);
    this.state.currentSentenceIndex = 0;
    this.state.correctSentence = this.state.sentences[this.state.currentSentenceIndex] || [];
    this.state.availableWords = [...this.state.correctSentence]; // Store the correct sentence
    this.shuffleSentence();
    this.state.completedSentences = 0;
  },
  shuffleSentence: function() {
    this.state.availableWords.sort();
    this.state.userSentence = [];
  },
  moveToUserSentence: function(word, index) {
    this.state.userSentence.push(word);
    this.state.availableWords.splice(index, 1);
  },
  moveBackToAvailableWords: function(word, index) {
    this.state.availableWords.push(word);
    this.state.userSentence.splice(index, 1);
  },
   restart: function() {
      this.state.sentences = this.state.text.match(/[^.!?]+[.!?]+/g) || [];
      this.state.sentences = this.state.sentences.map(sentence => sentence.trim().split(/\s+/)).reduce(
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
      this.state.correctSentence = this.state.sentences[this.state.currentSentenceIndex] || [];
      this.state.availableWords = [...this.state.correctSentence];
      this.shuffleSentence();
      this.state.message = '';
    },
  checkOrder: function() {
    const correct = this.state.userSentence.join(' ') === this.state.correctSentence.join(' ');
    if (correct) {
      this.state.score += 1;
      this.state.completedSentences++;
      this.state.currentSentenceIndex++;
      this.state.correctSentence = this.state.sentences[this.state.currentSentenceIndex] || [];
      this.state.availableWords = [...this.state.correctSentence]; // Store the correct sentence
      if (this.state.correctSentence.length === 0) {
        this.state.message = 'Congratulations! You have completed the exercise!';
      } else {
        this.shuffleSentence();
      }
    } else {
      console.log('Incorrect', this.state.userSentence, this.state.correctSentence);
      // Find the index of the first incorrect word
      let incorrectIndex = 0;
      for (let i = 0; i < this.state.userSentence.length; i++) {
        if (this.state.userSentence[i] !== this.state.correctSentence[i]) {
          incorrectIndex = i;
          break;
        }
      }

      // Move incorrect words back to availableWords
      for (let i = this.state.userSentence.length - 1; i >= incorrectIndex; i--) {
        const word = this.state.userSentence[i];
        this.state.availableWords.push(word);
        this.state.userSentence.splice(i, 1);
      }
    }
  },
  view: function() {
    let message = '';
    if (this.state.activeTab === 'edit') {
      message = this.state.text === '' ? 'Enter text to get started!' : 'Go to the ‘Learn’ tab to start learning!';
    } else if (this.state.activeTab === 'learn') {
      message = (
        this.state.correctSentence.length === 0 ?
        'Please go to the ‘edit’ tab to get started!' :
        'Click on the words in the right order to make the sentence.'
      );
    }
    if (this.state.message) {
      message = this.state.message;
    }

    const progress = 0 < this.state.sentences.length ? (
      (this.state.completedSentences / this.state.sentences.length) * 100
    ): 0;

    return m('div', { class: 'section' }, [
      m('div', { class: 'tabs is-centered' },
        m('ul', [
          m('li', { class: this.state.activeTab === 'edit' ? 'is-active' : '' },
            m('a', { onclick: () => this.setActiveTab('edit') }, 'Edit')
          ),
          m('li', { class: this.state.activeTab === 'learn' ? 'is-active' : '' },
            m('a', { onclick: () => this.setActiveTab('learn') }, 'Learn')
          )
        ])
      ),
      m('div', { class: 'container mb-4' }, [
        this.state.activeTab === 'edit' ?
          m('textarea', {
            class: 'textarea',
            value: this.state.text,
            oninput: m.withAttr('value', this.setText.bind(this)),
            placeholder: 'Paste your text here...'
          })
          : null,
        this.state.activeTab === 'learn' ?
          m('div', [
            m('progress', { class: 'progress is-success', value: progress, max: '100' }, `${progress}%`),
            m('div', { class: 'mb-4' }, [
              m('div', { class: 'flex flex-wrap gap-2 mb-2' }, this.state.availableWords.map((word, index) =>
                m('button', {
                  class: 'button is-light mr-1',
                  onclick: () => this.moveToUserSentence(word, index)
                }, word)
              )),
              m('div', { class: 'flex flex-wrap gap-2 mb-2' }, this.state.userSentence.map((word, index) =>
                m('button', {
                  class: 'button is-info mr-1',
                  onclick: () => this.moveBackToAvailableWords(word, index)
                }, word)
              ))
            ]),
            m('div', { class: 'field is-grouped mb-4' }, [
              m('button', {
                class: 'button control is-success',
                onclick: this.checkOrder.bind(this),
                disabled: this.state.correctSentence.length === 0 || this.state.availableWords.length > 0
              }, 'Check Order'),
              m('button', {
                class: 'button control is-warning',
                onclick: () => this.restart()
              }, 'Restart'),
            ]),
            m('p', `Score: ${this.state.score}`)
          ])
          : null
      ]),
      m('div', {class: 'message'},
        m('div', {class: 'message-body'}, message)
      )
    ]);
  }
};

m.mount(document.getElementById('app'), app);
