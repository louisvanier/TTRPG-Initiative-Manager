let EncounterModel = require('../../app/assets/javascripts/encounter.js').encounter;

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
          effectType: 'Beneficial'
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
    it("should return undefined when it cannot find the character by its name", () => {
      expect(encounter.findCharacter('Yoda great master')).toEqual(null);
    });
  });
});
