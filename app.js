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
    return m('div', [
      m('progress', { class: 'progress is-success', value: vnode.attrs.progress, max: '100' }, `${vnode.attrs.progress}%`),
      m('div', { class: 'mb-4' }, [
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, vnode.attrs.availableWords.map((word, index) =>
          m('button', {
            class: `button ${word === vnode.attrs.hintWord ? 'is-success' : 'is-info'} mr-1`,
            onclick: () => vnode.attrs.moveToUserSentence(word, index)
          }, word)
        )),
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, vnode.attrs.userSentence.map((word, index) =>
          m('button', {
            class: 'button is-success mr-1',
            onclick: () => vnode.attrs.moveBackToAvailableWords(word, index)
          }, word)
        ))
      ]),
      m('div', { class: 'field is-grouped mb-4' }, [
        m('button', {
          class: 'button control is-link',
          onclick: () => vnode.attrs.hint(),
          disabled: vnode.attrs.correctSentence.length === 0 || vnode.attrs.hintWord !== null
        }, 'Hint'),
        m('button', {
          class: 'button control is-warning',
          onclick: () => vnode.attrs.restart(),
          disabled: vnode.attrs.sentences.length === 0
        }, 'Restart'),
      ]),
      m('p', `Score: ${vnode.attrs.score}`)
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
    message: '',
    completedSentences: 0,
    currentSentenceIndex: 0,
    hintWord: null
  },
  setActiveTab: function(tab) {
    this.state.activeTab = tab;
  },
  setText: function(event) {
    this.state.text = event.target.value;
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
    this.state.hintWord = null;
  },
  shuffleSentence: function() {
    this.state.availableWords.sort();
    this.state.userSentence = [];
  },
  moveToUserSentence: function(word, index) {
    this.state.userSentence.push(word);
    this.state.availableWords.splice(index, 1);
    if (this.state.availableWords.length === 0) {
      this.checkOrder();
    }
    this.state.hintWord = null;
  },
  moveBackToAvailableWords: function(word, index) {
    this.state.availableWords.push(word);
    this.state.userSentence.splice(index, 1);
    this.state.hintWord = null;
  },
  hint: function() {
     // Move incorrect words back to availableWords
     for (let i = this.state.userSentence.length - 1; i >= 0; i--) {
       if (this.state.userSentence[i] !== this.state.correctSentence[i]) {
         const word = this.state.userSentence[i];
         this.state.availableWords.push(word);
         this.state.userSentence.splice(i, 1);
       }
     }

     // Highlight the next correct word
     if (this.state.userSentence.length < this.state.correctSentence.length) {
       this.state.hintWord = this.state.correctSentence[this.state.userSentence.length];
     }
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
            progress: progress,
            availableWords: this.state.availableWords,
            userSentence: this.state.userSentence,
            correctSentence: this.state.correctSentence,
            hintWord: this.state.hintWord,
            moveToUserSentence: this.moveToUserSentence.bind(this),
            moveBackToAvailableWords: this.moveBackToAvailableWords.bind(this),
            hint: this.hint.bind(this),
            restart: this.restart.bind(this),
            sentences: this.state.sentences,
            score: this.state.score
          })
          : null
      ]),
      m('div', {class: 'message'},
        m('div', {class: 'message-body'}, message)
      )
    ]);
  }
};

m.mount(document.getElementById('app'), app);
