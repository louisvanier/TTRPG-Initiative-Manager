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

      if (effectData.targets) {
        for (let targetName of effectData.targets) {
          let character = this.findCharacter(targetName);
          if (character !== null) {
            this.addTargetToEffect(effect, character);
          }
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

    return this;
  }

  removeTargetFromEffect(effect, target) {
    let removed = this.targetsAndEffects.get(effect).delete(target);
    if (removed) {
        if (this.targetsAndEffects.get(effect).size === 0) {
            this.effects.remove(effect);
            this.targetsAndEffects.delete(effect);
        }
    }

    return removed;
  }

  addCharacter(character) {
    if (this.findCharacter(character.name())) {
        throw new Error("CharacterNameAlreadyTaken");
        return;
    }

    this.characters.push(character);
  }

  addEffect(effect, targets) {
    if (this.findEffect(effect.title())) {
        throw new Error("EffectNameAlreadyTaken");
        return;
    }

    this.effects.push(effect);
    if (targets) {
        for (let target of targets) {
            this.addTargetToEffect(effect, target);
        }
    }
  }

}

exports.encounter = EncounterModel