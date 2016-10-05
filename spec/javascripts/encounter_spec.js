let EncounterModel = require('../../app/assets/javascripts/encounter.js').encounter;
let TrackableEffectModel = require('../../app/assets/javascripts/trackableEffect.js').trackableEffect;
let CharacterModel = require('../../app/assets/javascripts/character.js').character;

describe("EncounterModel", () => {
  let encounter = null;
  let modelData = null;
  beforeEach(() => {
    encounter = new EncounterModel({});
    modelData = {
        currentRound: 5,
        rankInCurrentRound: 2,
        characters: [{ 
          name: 'Jimmay',
          rankInCombat: 1,
          status: "ALREADY_ACTED"
          },
          { 
          name: 'Timmay',
          rankInCombat: 2,
          status: "CURRENTLY_ACTING"
          }
        ],
        effects: [{
          title: 'Blood for the blood god',
          description: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
          duration: 4,
          effectType: 'Beneficial',
          rankInCombat: 2,
          targets: ['Timmay']
        }]
      };
  });

  describe("Update", () => {
    it("should set currentRound, rankInCurrentRound, characters and effects", () => {
      encounter.update(modelData);
      expect(encounter.currentRound()).toEqual(5);
      expect(encounter.rankInCurrentRound()).toEqual(2);
      expect(encounter.characters().length).toEqual(2);
      expect(encounter.characters()[0].name()).toEqual('Jimmay');
      expect(encounter.characters()[1].name()).toEqual('Timmay');
      expect(encounter.effects().length).toEqual(1);
      expect(encounter.effects()[0].title()).toEqual('Blood for the blood god');
    });
    it("should default currentRound to 1", () => {
      delete modelData.currentRound;
      expect(typeof modelData.currentRound).toEqual('undefined');

      encounter.update(modelData);
      expect(encounter.currentRound()).toEqual(1);
    });
    it("should default rankInCurrentRound to 1", () => {
      delete modelData.rankInCurrentRound;
      expect(typeof modelData.rankInCurrentRound).toEqual('undefined');

      encounter.update(modelData);
      expect(encounter.rankInCurrentRound()).toEqual(1);
    });
    it("should default characters to an empty array", () => {
      delete modelData.characters;
      expect(typeof modelData.characters).toEqual('undefined');

      expect(encounter.characters.length).toEqual(0);
    });
    it("should default effects to an empty array", () => {
      delete modelData.effects;
      expect(typeof modelData.effects).toEqual('undefined');
      
      expect(encounter.characters.length).toEqual(0);
    });
    it("should support assigning multiple targets to an effect", () => {
      modelData.effects.push({
        title: 'Mind numbness',
        description: "blows your mind",
        duration: 6,
        effectType: 'Harmful',
        targets: ['Timmay', 'Jimmay']
      });

      encounter.update(modelData);
      expect(encounter.effects().length).toEqual(2);
      let mindNumbness = encounter.findEffect('Mind numbness');
      expect(encounter.targetsAndEffects.get(mindNumbness).size).toEqual(2);
    });
  });

  describe("findCharacter", () => {
    let jimmay = null;
    beforeEach(() => {
      encounter.update(modelData);
      jimmay = encounter.characters()[0];
    });
    it("should return a character by its name", () => {
      expect(encounter.findCharacter('Jimmay')).toEqual(jimmay);
    });
    it("should return null when it cannot find the character by its name", () => {
      expect(encounter.findCharacter('Yoda great master')).toEqual(null);
    });
  });

  describe("findEffect", () => {
    let bloodGodEffect = null;
    beforeEach(() => {
      encounter.update(modelData);
      bloodGodEffect = encounter.effects()[0];
    });

    it("should return a effect by its name", () => {
      expect(encounter.findEffect('Blood for the blood god')).toEqual(bloodGodEffect);
    });
    it("should return null when it cannot find the effect by its name", () => {
      expect(encounter.findEffect('Rainbows and unicorn farts')).toEqual(null);
    });
  });

  describe("addTargetToEffect", () => {
    let jimmay = null;
    let timmay = null;
    let newEffect = new TrackableEffectModel();
    newEffect.update({
      title: 'Curse of the red moon',
      description: 'add target to effect',
      duration: 3,
      effectType: "HARMFUL",
      targets: ['Jimmay']
    });
    beforeEach(() => {
      encounter.update(modelData);
      jimmay = encounter.characters()[0];
      timmay = encounter.characters()[1];
    });

    it("should add the new effect and the target to targetsAndEffects", () => {
      expect(encounter.targetsAndEffects.has(newEffect)).toEqual(false);
      encounter.addTargetToEffect(newEffect, jimmay);
      expect(encounter.targetsAndEffects.get(newEffect).has(jimmay)).toEqual(true);
    });
    it("should not create a new Set for targets when the effect already exists", () => {
      spyOn(encounter.targetsAndEffects, 'set').and.callThrough();
      expect(encounter.targetsAndEffects.set.calls.count()).toEqual(0)

      encounter.addTargetToEffect(newEffect, jimmay);
      expect(encounter.targetsAndEffects.set.calls.count()).toEqual(1)
      
      encounter.addTargetToEffect(newEffect, timmay);
      expect(encounter.targetsAndEffects.set.calls.count()).toEqual(1);
    });
  });

  describe("removeTargetFromEffect", () => {
    let jimmay = null;
    let timmay = null;
    let bloodForTheBloodGod = null;
    let newEffect = new TrackableEffectModel();
    newEffect.update({
      title: 'Curse of the red moon',
      description: 'add target to effect',
      duration: 3,
      effectType: "HARMFUL",
      rankInCombat: 2,
      targets: ['Jimmay']
    });
    beforeEach(() => {
      encounter.update(modelData);
      jimmay = encounter.characters()[0];
      timmay = encounter.characters()[1];
      bloodForTheBloodGod = encounter.effects()[0];
    });

    it("should return false if the target was not targeted by the effect", () => {
      expect(encounter.removeTargetFromEffect(bloodForTheBloodGod, jimmay)).toEqual(false);
    });
    it("should return true if the target was targeted by the effect", () => {
      expect(encounter.removeTargetFromEffect(bloodForTheBloodGod, timmay)).toEqual(true);
    });
    it("should not remove the effect if there are targets left", () => {
      spyOn(encounter.effects, 'remove').and.callThrough();
      encounter.addTargetToEffect(bloodForTheBloodGod, jimmay);
      encounter.removeTargetFromEffect(bloodForTheBloodGod, timmay);
      expect(encounter.effects.remove.calls.count()).toEqual(0);
    });
    it("should remove the effect if there are no more targets", () => {
      expect(encounter.targetsAndEffects.get(bloodForTheBloodGod).size).toEqual(1);
      encounter.removeTargetFromEffect(bloodForTheBloodGod, timmay);
      expect(encounter.targetsAndEffects.get(bloodForTheBloodGod)).not.toBeDefined();
      expect(ko.utils.arrayFirst(encounter.effects(), (eff) => { eff === bloodForTheBloodGod})).toEqual(null);
    });
  });

  describe("addCharacter", () => {
    let newCharacter = null;
    beforeEach(() => {
      encounter.update(modelData);
      newCharacter = new CharacterModel();
      newCharacter.update({
        name: 'Billy',
        rankInCombat: 3,
        status: "ALREADY_ACTED",
      });
    });

    it("should add the character", () => {
      let characterCount = encounter.characters().length;
      encounter.addCharacter(newCharacter);
      expect(encounter.characters().length).toEqual(characterCount + 1);
    });
    it("should raise if a character with the same name is already present", () => {
      newCharacter.name(encounter.characters()[0].name());
      expect(() => { encounter.addCharacter(newCharacter) }).toThrow();
    });
  });

  describe("addEffect", () => {
    let newEffect = null;
    beforeEach(() => {
      encounter.update(modelData);
      newEffect = new TrackableEffectModel();
      newEffect.update({
        title: 'Unicorn kisses',
        description: "pink stuff",
        duration: 4,
        effectType: 'Beneficial',
        rankInCombat: 2
      });
    });

    it("should add the Effect", () => {
      let effectCount = encounter.effects().length;
      encounter.addEffect(newEffect);
      expect(encounter.effects().length).toEqual(effectCount + 1);
    });
    it("should raise if an effect with the same name is already present", () => {
      newEffect.title(encounter.effects()[0].title());
      expect(() => { encounter.addEffect(newEffect) }).toThrow();
    });
    it("should add all the targets to the effect", () => {
      encounter.addEffect(newEffect, encounter.characters());
      expect(encounter.targetsAndEffects.get(newEffect).size).toEqual(encounter.characters().length);
    });
  });

  describe("next", () => {
    beforeEach(() => {
      modelData.rankInCurrentRound = 1;
      modelData.characters[0].status = "CURRENTLY_ACTING";
      modelData.characters[1].status = "ABOUT_TO_ACT";
      modelData.characters.push({
        name: 'Henry',
        rankInCombat: 3,
        status: "ABOUT_TO_ACT"
      });
      modelData.characters.push({
        name: 'Tommy',
        rankInCombat: 2,
        status: "OUT_OF_COMBAT"
      });
      encounter.update(modelData);
    });

    it("should properly change the status of acting characters and nextrank characters", () => {
      encounter.next();
      expect(encounter.characters()[0].status()).toEqual("ALREADY_ACTED");
      expect(encounter.characters()[1].status()).toEqual("CURRENTLY_ACTING");
      expect(encounter.characters()[2].status()).toEqual("ABOUT_TO_ACT");
      expect(encounter.characters()[3].status()).toEqual("OUT_OF_COMBAT");
    });
    it("should increment rankInCurrentRound by 1 if its not the last rank already", () => {
      encounter.next();
      expect(encounter.rankInCurrentRound()).toEqual(2);
    });
    it("should reset rankInCurrentRound to 1 if its the last rank", () => {
      encounter.rankInCurrentRound(3);
      encounter.next();
      expect(encounter.rankInCurrentRound()).toEqual(1);
    });
    it("should decrement effect's duration for the new rank", () => {
      encounter.next();
      expect(encounter.effects()[0].duration()).toEqual(3);
    });
    it("should remove effect with a duration of 0", () => {
      let bloodGodEffect = encounter.effects()[0];
      bloodGodEffect.duration(1);
      encounter.next();
      expect(encounter.findEffect(bloodGodEffect.title())).toEqual(null);
    });
    it("should not adjust duration of -1(infinite) effects", () => {
      let bloodGodEffect = encounter.effects()[0];
      bloodGodEffect.duration(-1);
      encounter.next();
      expect(encounter.findEffect(bloodGodEffect.title()).duration()).toEqual(-1);
    });
  });

  describe("removeEffect", () => {
    let bloodGodEffect = null;
    beforeEach(() => {
      encounter.update(modelData);
      bloodGodEffect = encounter.effects()[0];
    });

    it("should remove the effect from the targetsAndEffects map", () => {
      encounter.removeEffect(bloodGodEffect);
      expect(encounter.targetsAndEffects.has(bloodGodEffect)).toEqual(false);
    });
    it("should remove the effect from the effects list", () => {
      encounter.removeEffect(bloodGodEffect);
      expect(encounter.findEffect(bloodGodEffect.title())).toEqual(null);
    });
  });
});
