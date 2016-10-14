let ko = require('knockout');

let CharacterModel = class {
  constructor() {
    this.id = null;
    this.name = ko.observable();
    this.rankInCombat = ko.observable();
    this.status = ko.observable();
    this.isPlayerControlled = ko.observable();

    this.characterType = ko.pureComputed(function() {
      return this.isPlayerControlled()? 'Player' : 'NPC';
    }, this);
    this.hasntPlayedYet = ko.computed(() => {
      return this.status() === CharacterModel.characterStatusAboutToAct()
      || this.status() === CharacterModel.characterStatusDelaying();
    });
    this.alreadyPlayed = ko.computed(() => {
      return this.status() === CharacterModel.characterStatusReadying()
      || this.status() === CharacterModel.characterStatusAlreadyActed();
    });
    this.hasDelayedCurrentRound = ko.computed(() => {
      
    });
  }

  update(data) {
    this.id = data.id || null;
    this.name(data.name || "New Character");
    let rankInCombat = parseInt(data.rankInCombat || "1", 10);
    if (isNaN(rankInCombat)) {
      this.rankInCombat(1);
    } else {
      this.rankInCombat(rankInCombat);
    }

    this.status(CharacterModel.parseCharacterStatus(data.status || ""));
    this.isPlayerControlled(data.isPlayerControlled || false);

  }

  static characterStatusReadying() { return "READYING"; }
  static characterStatusCurrentlyActing() { return "CURRENTLY_ACTING"; }
  static characterStatusDelaying() { return "DELAYING"; }
  static characterStatusAboutToAct() { return "ABOUT_TO_ACT"; }
  static characterStatusOutOfCombat() { return "OUT_OF_COMBAT"; }
  static characterStatusAlreadyActed() { return "ALREADY_ACTED"; }

  static indexURL() {
    return window.Configurations.paths.characters.index;
  }
  static createURL() {
    return window.Configurations.paths.characters.create;
  }
  static updateURL(id) {
    return window.Configurations.paths.characters.edit.replace('/id/', '/' + id + '/');
  }
  static destroyURL(id) {
    return window.Configurations.paths.characters.delete.replace('/id', '/' + id);
  }
  static jsonRoot() {
    return 'character';
  }


  static parseCharacterStatus(input) {
    let upperCased = input.toUpperCase();

    switch (upperCased) {
      case "READYING":
        return CharacterModel.characterStatusReadying();
      case "CURRENTLY_ACTING":
        return CharacterModel.characterStatusCurrentlyActing();
      case "DELAYING":
        return CharacterModel.characterStatusDelaying();
      case "ABOUT_TO_ACT":
        return CharacterModel.characterStatusAboutToAct();
      case "OUT_OF_COMBAT":
        return CharacterModel.characterStatusOutOfCombat();
      case "ALREADY_ACTED":
        return CharacterModel.characterStatusAlreadyActed();
      default:
        return CharacterModel.characterStatusAboutToAct();
    }
  }

}

exports.character = CharacterModel;