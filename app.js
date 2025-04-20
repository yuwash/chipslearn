const EditTab =  {
  view: (vnode) => {
    return m('textarea', {
      class: 'textarea',
      value: vnode.attrs.text,
      oninput: (event) => vnode.attrs.setText(event),
      placeholder: 'Paste your text here...'
    });
  }
};

const LearnTab = {
  view: (vnode) => {
    const state = vnode.attrs.state;

    const moveToUserSentence = (word, index) => {
      state.userSentence.push(word);
      state.availableWords.splice(index, 1);
      if (state.availableWords.length === 0) {
        checkOrder();
      }
      state.hintWord = null;
    };

    const moveBackToAvailableWords = (word, index) => {
      state.availableWords.push(word);
      state.userSentence.splice(index, 1);
      state.hintWord = null;
    };

    const checkOrder = () => {
      const correct = state.userSentence.join(' ') === state.correctSentence.join(' ');
      if (correct) {
        if (state.usedHints === 0) {
          state.score += 10;
        } else {
          state.score += Math.max(0, Math.round(10 * (state.correctSentence.length - state.usedHints) / state.correctSentence.length));
        }
        state.completedSentences++;
        state.currentSentenceIndex++;
        vnode.attrs.resetSentence();
      } else {
        // Find the index of the first incorrect word
        let incorrectIndex = 0;
        for (let i = 0; i < state.userSentence.length; i++) {
          if (state.userSentence[i] !== state.correctSentence[i]) {
            incorrectIndex = i;
            break;
          }
        }

        // Move incorrect words back to availableWords
        for (let i = state.userSentence.length - 1; i >= incorrectIndex; i--) {
          const word = state.userSentence[i];
          state.availableWords.push(word);
          state.userSentence.splice(i, 1);
        }
      }
    };

    const hint = () => {
      // Move incorrect words back to availableWords
      for (let i = state.userSentence.length - 1; i >= 0; i--) {
        if (state.userSentence[i] !== state.correctSentence[i]) {
          const word = state.userSentence[i];
          state.availableWords.push(word);
          state.userSentence.splice(i, 1);
        }
      }

      // Highlight the next correct word
      if (state.userSentence.length < state.correctSentence.length) {
        state.hintWord = state.correctSentence[state.userSentence.length];
      }
      state.usedHints++;
      state.sessionTotalUsedHints++;
    };

    const progress = 0 < state.sentences.length ? (
      (state.completedSentences / state.sentences.length) * 100
    ): 0;

    return m('div', [
      m('progress', { class: 'progress is-success', value: progress, max: '100' }, `${progress}%`),
      m('div', { class: 'mb-4' }, [
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, state.availableWords.map((word, index) =>
          m('button', {
            class: `button ${word === state.hintWord ? 'is-success' : 'is-info'} mr-1`,
            onclick: () => moveToUserSentence(word, index)
          }, word)
        )),
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, state.userSentence.map((word, index) =>
          m('button', {
            class: 'button is-success mr-1',
            onclick: () => moveBackToAvailableWords(word, index)
          }, word)
        ))
      ]),
      m('div', { class: 'field is-grouped mb-4' }, [
        m('button', {
          class: 'button control is-link',
          onclick: hint,
          disabled: state.correctSentence.length === 0 || state.hintWord !== null
        }, 'Hint'),
        m('button', {
          class: 'button control is-warning',
          onclick: vnode.attrs.restart,
          disabled: state.sentences.length === 0
        }, 'Restart'),
      ]),
      m('p', `Score: ${state.score}`),
      m('p', `Hints used: ${state.sessionTotalUsedHints}`),
    ]);
  }
};

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
    messageClass: 'info',
    completedSentences: 0,
    currentSentenceIndex: 0,
    hintWord: null,
    usedHints: 0,
    sessionTotalUsedHints: 0
  },
  setActiveTab: function(tab) {
    this.state.activeTab = tab;
  },
  setText: function(event) {
    this.state.text = event.target.value;
    this.restart();
  },
  restart: function() {
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
    this.state.currentSentenceIndex = 0;
    this.resetSentence();
    this.state.completedSentences = 0;
    this.state.sessionTotalUsedHints = 0;
  },
  resetSentence: function() {
    this.state.correctSentence = this.state.sentences[this.state.currentSentenceIndex] || [];
    this.state.availableWords = [...this.state.correctSentence]; // Store the correct sentence
    this.state.availableWords.sort();
    this.state.userSentence = [];
    this.state.hintWord = null;
    this.state.usedHints = 0;
  },
  view: function() {
    let message = '';
    let messageClass = 'info';
    if (this.state.activeTab === 'edit') {
      message = this.state.text === '' ? 'Enter text to get started!' : 'Go to the ‘Learn’ tab to start learning!';
    } else if (this.state.activeTab === 'learn') {
      if (this.state.sentences.length === 0) {
        message = 'Please go to the ‘edit’ tab to get started!';
      } else if (this.state.completedSentences < this.state.sentences.length) {
        message = 'Click on the words in the right order to make the sentence.';
      } else {
        message = 'Congratulations! You have completed the exercise!';
        messageClass = 'success';
      }
    }
    const messageBulmaClass = `is-${messageClass}`;

    return [
      m('div', { class: 'tabs is-centered is-boxed' },
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
          m(EditTab, {
            text: this.state.text,
            setText: this.setText.bind(this)
          })
          : null,
        this.state.activeTab === 'learn' ?
          m(LearnTab, {
            state: this.state,
            resetSentence: this.resetSentence.bind(this),
            restart: this.restart.bind(this)
          })
          : null
      ]),
      m('div', {class: `message ${messageBulmaClass}`},
        m('div', {class: 'message-body'}, message)
      )
    ];
  }
};

m.mount(document.getElementById('app'), app);
