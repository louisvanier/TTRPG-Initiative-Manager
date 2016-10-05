let ko = require('knockout')

let CharacterModel = class {
  constructor() {
    this.name = ko.observable();
    this.rankInCombat = ko.observable();
    this.status = ko.observable();
    this.hasntPlayedYet = ko.computed(() => {
      return this.status() === CharacterModel.characterStatusAboutToAct()
      || this.status() === CharacterModel.characterStatusDelaying();
    });
    this.alreadyPlayed = ko.computed(() => {
      return this.status() === CharacterModel.characterStatusReadying()
      || this.status() === CharacterModel.characterStatusAlreadyActed();
    });
    this.hasDelayedCurrentRound = ko.computed(() => {
      return this.status() === CharacterModel.characterStatusDelaying();
    });
  }

  update(data) {
    this.name(data.name || "New Character");
    let rankInCombat = parseInt(data.rankInCombat || "1", 10);
    if (isNaN(rankInCombat)) {
      this.rankInCombat(1);
    } else {
      this.rankInCombat(rankInCombat);
    }

    this.status(CharacterModel.parseCharacterStatus(data.status || ""));

  }

  static characterStatusReadying() { return "READYING"; }
  static characterStatusCurrentlyActing() { return "CURRENTLY_ACTING"; }
  static characterStatusDelaying() { return "DELAYING"; }
  static characterStatusAboutToAct() { return "ABOUT_TO_ACT"; }
  static characterStatusOutOfCombat() { return "OUT_OF_COMBAT"; }
  static characterStatusAlreadyActed() { return "ALREADY_ACTED"; }

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

exports.character = CharacterModel