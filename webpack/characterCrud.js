let CrudViewModel = require('../app/frontend/javascripts/crudViewModel').crudViewModel;
let CharacterModel = require('../app/frontend/javascripts/Character').character;
let jQuery = require('jQuery');

jQuery(document).ready(function() {
  let viewModel = new CrudViewModel(CharacterModel);
  ko.applyBindings(viewModel);
  viewModel.indexAction();
  viewModel.clearTempItem();
});
