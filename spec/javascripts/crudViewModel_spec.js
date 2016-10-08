let CrudViewModel = require('../../app/assets/javascripts/crudViewModel.js').crudViewModel;
let CharacterModel = require('../../app/assets/javascripts/character.js').character;

describe("CrudViewModel", () => {
  let crudViewModel = null;
  let characterModel = null;
  beforeEach(() => {
    crudViewModel = new CrudViewModel(CharacterModel);
  });

  describe("constructor", () => {
    it("should create tempItem as a new instance of constructor parameter (characterModel)", () => {
      expect(crudViewModel.tempItem.constructor.name).toEqual('CharacterModel');
    });
  });

  describe("setFlash", () => {
    it("should set the new flash value and reset shownOnce flag", () => {
      crudViewModel.setFlash('Ermagerhd');
      expect(crudViewModel.flash()).toEqual('Ermagerhd');
      expect(crudViewModel.shownOnce()).toEqual(false);
    });
  });

  describe("checkFlash", () => {
    it("should not clear the flash if flash was not shownOnce", () => {
      crudViewModel.setFlash('Ermagerhd');
      crudViewModel.checkFlash();
      expect(crudViewModel.flash()).toEqual('Ermagerhd');
    });
    it("should clear the flash if flash was shownOnce", () => {
      crudViewModel.setFlash('Ermagerhd');
      crudViewModel.shownOnce(true);
      crudViewModel.checkFlash();
      expect(crudViewModel.flash()).toEqual('');
    });
  });

  describe("clearTempItem", () => {
    it("should default all values on the current activeModel", () => {
      expect(crudViewModel.tempItem.name()).not.toEqual('Darth Vader');
      crudViewModel.tempItem.update({name: 'Darth Vader'});
      crudViewModel.clearTempItem();
      expect(crudViewModel.tempItem.name()).toEqual('New Character');
    });
  });

  describe("prepareTempItem", () => {
    it("should copy all values from selectedItem over to tempItem", () => {
      let selectedCharacter = new CharacterModel();
      selectedCharacter.update({name: 'Darth Vader', isPlayerControlled: true});
      crudViewModel.selectedItem(selectedCharacter);
      crudViewModel.prepareTempItem();
      expect(crudViewModel.tempItem.name()).toEqual('Darth Vader');
      expect(crudViewModel.tempItem.isPlayerControlled()).toEqual(true);
    });
  });
}); 