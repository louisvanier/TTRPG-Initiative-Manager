let ko = require('knockout')
let TrackableEffectModel = require('trackableEffect.js').trackableEffect;
let CharacterModel = require('character.js').character;

let EncounterModel = class {
  constructor() {
    //--------------
    //not observable
    //--------------
    this.targetsAndEffects = new Map();

    //--------------
    //basic info
    //--------------
    this.currentRound = ko.observable();
    this.rankInCurrentRound = ko.observable();

    //--------------
    //characters
    //--------------
    this.characters = ko.observableArray();
    //when editing a character
    this.selectedCharacter = ko.observable();
    //when adding a character
    this.temporaryCharacter = ko.observable();

    //--------------
    //effects
    //--------------
    this.effects = ko.observableArray();
    //when editing an effect
    this.selectedEffect = ko.observable();
    //when adding an effect
    this.temporaryEffect = ko.observable();
  }

  update(data) {
    this.currentRound(data.currentRound || 1);
    this.rankInCurrentRound(data.rankInCurrentRound || 1);

    (data.characters || []).forEach((characterData) => {
      let character = new CharacterModel();
      character.update(characterData);
      this.characters.push(character);
    }, this);
    (data.effects || []).forEach((effectData) => {
      let effect = new TrackableEffectModel();
      effect.update(effectData);
      this.effects.push(effect);

      if (effectData.target) {
        let character = this.findCharacter(effectData.target);
        if (character !== null) {
            effect.target(character);
            this.addTargetToEffect(effect, character);
        }
      }
    }, this);
  }

  findCharacter(characterName) {
    return ko.utils.arrayFirst(this.characters(), (character) => {
        return character.name() === characterName;
    });
  }

  findEffect(effectName) {
    return ko.utils.arrayFirst(this.effects(), (effect) => {
        return effect.title() === effectName;
    });
  }

  addTargetToEffect(effect, target) {
    if (!this.targetsAndEffects.get(effect)) {
        this.targetsAndEffects.set(effect, new Set());
    }
    this.targetsAndEffects.get(effect).add(target);
  }

  //TODO => add removeTargetFromEffect
  //TODO => add addEffect
  //TODO => add addCharacter
}

exports.encounter = EncounterModel