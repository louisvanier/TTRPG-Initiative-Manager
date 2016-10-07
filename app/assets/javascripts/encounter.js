let ko = require('knockout')
let TrackableEffectModel = require('trackableEffect.js').trackableEffect;
let CharacterModel = require('character.js').character;

let EncounterModel = class {
  constructor() {
    //--------------
    //not observable
    //--------------
    //key => effect, value => Set(characters)
    this.targetsAndEffects = new Map();
    //key => character, value => Set(effects)
    this.effectsPerTarget = new Map();

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
    this.targetsAndEffects.get(effect).add(target);
    this.effectsPerTarget.get(target).add(effect);

    return this;
  }

  removeTargetFromEffect(effect, target) {
    let removedEffect = this.effectsPerTarget.get(target).delete(effect);
    if (removedEffect && this.effectsPerTarget.get(target).size === 0) {
      this.effectsPerTarget.delete(target);
    }

    let removedTarget = this.targetsAndEffects.get(effect).delete(target);
    if (removedTarget && this.targetsAndEffects.get(effect).size === 0) {
      this.removeEffect(effect);
    }

    return removed;
  }

  addCharacter(character) {
    if (this.findCharacter(character.name())) {
        throw new Error("CharacterNameAlreadyTaken");
    }

    this.effectsPerTarget.set(target, new Set());
    this.characters.push(character);
  }

  addEffect(effect, targets) {
    if (this.findEffect(effect.title())) {
        throw new Error("EffectNameAlreadyTaken");
    }

    this.targetsAndEffects.set(effect, new Set());
    this.effects.push(effect);
    if (targets) {
        for (let target of targets) {
            this.addTargetToEffect(effect, target);
        }
    }
  }

  removeEffect(effect) {
    this.effects.remove(effect);
    this.targetsAndEffects.delete(effect);
    //UNit-test => publish removedEffect event
  }

  next() {
    let actingCharacters = ko.utils.arrayFilter(this.characters(), (ch) => {
        return ch.status() === CharacterModel.characterStatusCurrentlyActing();
    });
    for (var character of actingCharacters) {
        character.status(CharacterModel.characterStatusAlreadyActed());
    }

    let newRankInCurrentRound = this.rankInCurrentRound() + 1;
    let maxRank = Math.max.apply(null, ko.utils.arrayMap(this.characters(), (ch) => { return ch.rankInCombat(); }));
    if (newRankInCurrentRound > maxRank) {
        newRankInCurrentRound = 1;
        //Unit-test => publish newRound event
    }

    let noCharactersToPlay = true;
    let referenceRankInCurrentRound = newRankInCurrentRound;

    do {
        this.rankInCurrentRound(referenceRankInCurrentRound);

        let aboutToActCharacters = ko.utils.arrayFilter(this.characters(), (ch) => {
            return ch.rankInCombat() === referenceRankInCurrentRound
                && ch.status() !== CharacterModel.characterStatusOutOfCombat();
        });
        for (var ch of aboutToActCharacters) {
            ch.status(CharacterModel.characterStatusCurrentlyActing());
        }

        let newRankEffects = ko.utils.arrayFilter(this.effects(), (eff) => {
            return eff.rankInCombat() === newRankInCurrentRound
                && eff.duration() !== -1;
        });
        for (var effect of newRankEffects) {
            effect.duration(effect.duration() - 1);
            if (effect.duration() === 0) {
                this.removeEffect(effect);
            }
        }

        if (aboutToActCharacters.length === 0) {
            referenceRankInCurrentRound += 1;
            if (referenceRankInCurrentRound > maxRank) {
                referenceRankInCurrentRound = 1;
            }
        } else {
            noCharactersToPlay = false;
            for (let ch of aboutToActCharacters) {
              ch.status(CharacterModel.characterStatusCurrentlyActing());
            }
        }
    }
    while (noCharactersToPlay && this.rankInCurrentRound() !== referenceRankInCurrentRound)
  }
}

exports.encounter = EncounterModel;