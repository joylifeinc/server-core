const inquirerFileTreeSelection = require('inquirer-file-tree-selection-prompt');

const controller = {
  type: 'add',
  path: '{{directory}}/{{dotCase model}}/controller.ts',
  templateFile: 'data/controller.hbs'
};

const model = {
  type: 'add',
  path: '{{directory}}/{{dotCase model}}/model.ts',
  templateFile: 'data/model.hbs'
};

const view = {
  type: 'add',
  path: '{{directory}}/{{dotCase model}}/view.ts',
  templateFile: 'data/view.hbs'
};

const schema = {
  type: 'add',
  path: '{{directory}}/{{dotCase model}}/schema.ts',
  templateFile: 'data/schema.hbs'
};

const modelPrompt = {
  type: 'input',
  name: 'model',
  message: 'What is the name of this model'
};

const contextPrompt = {
  type: 'input',
  name: 'context',
  message: 'What is the name of your service'
}

const directoryPrompt = {
  type: 'directory',
  name: 'directory',
  message: 'Where are you adding this Component?',
  onlyShowDir: true,
  root: '.'
};

module.exports = plop => {
  plop.setPrompt('directory', inquirerFileTreeSelection)

  plop.setGenerator('Component', {
    description: 'Create an object w/ Controller, View, Model, and Schema',
    prompts: [modelPrompt, contextPrompt, directoryPrompt],
    actions: [controller, model, view, schema]
  });
}