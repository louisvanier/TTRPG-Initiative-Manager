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
    let rankInCombat = parseInt(data.rankInCombat || "");
    this.rankInCombat(parseInt(isNaN(rankInCombat) ? 1 : rankInCombat));

    let characterStatus = data.status ? CharacterModel.parseCharacterStatus(data.status) : CharacterModel.characterStatusAboutToAct();
    this.status(characterStatus);
  }

  static characterStatusReadying() { return "READYING"; }  
  static characterStatusCurrentlyActing() { return "CURRENTLY_ACTING"; }
  static characterStatusDelaying() { return "DELAYING"; }
  static characterStatusAboutToAct() { return "ABOUT_TO_ACT"; }
  static characterStatusOutOfCombat() { return "OUT_OF_COMBAT"; }
  static characterStatusAlreadyActed() { return "ALREADY_ACTED"; }

  static parseCharacterStatus(input) {
    input = input.toUpperCase();

    let parsedType = CharacterModel.characterStatusAboutToAct();

    switch (input) {
      case "READYING":
        parsedType = CharacterModel.characterStatusReadying()
        break;
      case "CURRENTLY_ACTING":
        parsedType = CharacterModel.characterStatusCurrentlyActing()
        break;
      case "DELAYING":
        parsedType = CharacterModel.characterStatusDelaying()
        break;
      case "ABOUT_TO_ACT":
        parsedType = CharacterModel.characterStatusAboutToAct()
        break;
      case "OUT_OF_COMBAT":
        parsedType = CharacterModel.characterStatusOutOfCombat()
        break;
      case "ALREADY_ACTED":
        parsedType = CharacterModel.characterStatusAlreadyActed()
        break;
    }

    return parsedType;
  }

}

exports.character = CharacterModel