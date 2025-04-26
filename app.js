import Chipslearn from './chipslearn.js';


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

const ConfigureTab = {
  view: (vnode) => {
    return m('div', [
      m('label', { class: 'label' }, 'Autocheck for words'),
      m('input', {
        class: 'input',
        type: 'number',
        min: 0,
        value: vnode.attrs.autocheckForWords,
        oninput: (event) => {
          const value = event.target.value === "" ? null : parseInt(event.target.value);
          if (value === null || value > 0) {
            vnode.attrs.setAutocheckForWords(value);
          }
        }
      })
    ]);
  }
};

const LearnTab = {
  view: (vnode) => {
    const chipslearn = vnode.attrs.chipslearn;
    const state = chipslearn.state;
    const progress = chipslearn.progress;

    return m('div', [
      m('progress', { class: 'progress is-success', value: progress, max: '100' }, `${progress}%`),
      m('div', { class: 'mb-4' }, [
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, state.availableWords.map((word, index) =>
          m('button', {
            class: `button ${word === state.hintWord ? 'is-success' : 'is-info'} mr-1`,
            onclick: () => chipslearn.moveToUserSentence(word, index)
          }, word)
        )),
        m('div', { class: 'flex flex-wrap gap-2 mb-2' }, [
          state.confirmedSection.map((word, index) =>
            m('button', {
              class: 'button is-black mr-1',
              disabled: true
            }, word)
          ),
          state.proposedSection.map((word, index) =>
            m('button', {
              class: 'button is-success mr-1',
              onclick: () => chipslearn.moveBackToAvailableWords(word, index)
            }, word)
          )
        ])
      ]),
      m('div', { class: 'field is-grouped mb-4' }, [
        m('button', {
          class: 'button control is-link',
          onclick: () => chipslearn.hint(),
          disabled: state.correctSentence.length === 0 || state.hintWord !== null
        }, 'Hint'),
        m('button', {
          class: 'button control is-warning',
          onclick: () => chipslearn.restart(vnode.attrs.text),
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
    messageClass: 'info',
  },
  chipslearn: new Chipslearn({
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
      autocheckForWords: 2
  }),
  setActiveTab: function(tab) {
    this.state.activeTab = tab;
  },
  setText: function(event) {
    this.state.text = event.target.value;
    this.chipslearn.restart(this.state.text);
  },
  view: function() {
    let message = '';
    let messageClass = 'info';
    if (this.state.activeTab === 'edit') {
      message = this.state.text === '' ? 'Enter text to get started!' : 'Go to the ‘Learn’ tab to start learning!';
    } else if (this.state.activeTab === 'learn') {
      if (this.state.text === '') {
        message = 'Please go to the ‘edit’ tab to get started!';
      } else if (this.chipslearn.progress < 100) {
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
          ),
          m('li', { class: this.state.activeTab === 'configure' ? 'is-active' : '' },
            m('a', { onclick: () => this.setActiveTab('configure') }, 'Configure')
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
            chipslearn: this.chipslearn,
            text: this.state.text
          })
          : null,
        this.state.activeTab === 'configure' ?
          m(ConfigureTab, {
            autocheckForWords: this.chipslearn.state.autocheckForWords,
            setAutocheckForWords: (value) => {
              this.chipslearn.state.autocheckForWords = value;
            }
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
