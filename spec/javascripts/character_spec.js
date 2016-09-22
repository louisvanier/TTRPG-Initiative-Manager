let CharacterModel = require('../../app/assets/javascripts/character.js').character;

describe("CharacterModel", () => {
  let character = null;
  beforeEach(() => {
    character = new CharacterModel({});
  });

  describe("parseCharacterStatus", () => {
    it("should parse ReAdYiNg case insensitive", () => {
      expect(CharacterModel.parseCharacterStatus("ReAdYiNg")).toEqual("READYING");
    });
    it("should parse CuRrEnTlY_aCtInG case insensitive", () => {
      expect(CharacterModel.parseCharacterStatus("CuRrEnTlY_aCtInG")).toEqual("CURRENTLY_ACTING");
    });
    it("should parse DeLaYiNg case insensitive", () => {
      expect(CharacterModel.parseCharacterStatus("DeLaYiNg")).toEqual("DELAYING");
    });
    it("should parse OuT_oF_cOmBaT case insensitive", () => {
      expect(CharacterModel.parseCharacterStatus("OuT_oF_cOmBaT")).toEqual("OUT_OF_COMBAT");
    });
    it("should parse AlReAdY_aCtEd case insensitive", () => {
      expect(CharacterModel.parseCharacterStatus("AlReAdY_aCtEd")).toEqual("ALREADY_ACTED");
    });
    it("should default to ABOUT_TO_ACT", () => {
      expect(CharacterModel.parseCharacterStatus("nothing that is a character status")).toEqual("ABOUT_TO_ACT");
    });
  });

  describe("update model", () => {
    it("should properly set name, rankInCombat and status", () => {
      let modelData = {
        name: "Jabba",
        rankInCombat: "3",
        status: CharacterModel.characterStatusReadying()
      };

      character.update(modelData);
      expect(character.name()).toEqual("Jabba");
      expect(character.rankInCombat()).toEqual(3);
      expect(character.status()).toEqual("READYING");
    });

    it("should default name to 'New Character'", () => {
      let modelData = {
        rankInCombat: "3",
        status: CharacterModel.characterStatusReadying()
      };

      character.update(modelData);
      expect(character.name()).toEqual("New Character");
    });

    it("should default rankInCombat to 1", () => {
      let modelData = {
        name: "Jabba",
        status: CharacterModel.characterStatusReadying()
      };

      character.update(modelData);
      expect(character.rankInCombat()).toEqual(1);
    });

    it("should default characterStatus to ABOUT_TO_ACT", () => {
      let modelData = {
        name: "Jabba",
        rankInCombat: "3"
      };

      character.update(modelData);
      expect(character.status()).toEqual("ABOUT_TO_ACT");
    });
  });
});