let TrackableEffectModel = require('../../app/assets/javascripts/trackableEffect.js').trackableEffect;



describe("trackableEffectModel", () => {
  let trackableEffect = null;
  beforeEach(() => {
    trackableEffect = new TrackableEffectModel({});
  });

  describe("parseEffectType", () => {
    it("should parse NeUtRaL case insensitive", () => {
      expect(TrackableEffectModel.parseEffectType("NeUtRaL")).toEqual("NEUTRAL");
    });
    it("should parse HaRmFuL case insensitive", () => {
      expect(TrackableEffectModel.parseEffectType("HaRmFuL")).toEqual("HARMFUL");
    });
    it("should default to beneficial on anything but neutral and harmful", () => {
      expect(TrackableEffectModel.parseEffectType("anything but neutral and harmful")).toEqual("BENEFICIAL");
    });
  });

  describe("creatorName", () => {
    it("should return 'unbound effect' for creator less effects", () => {
      expect(trackableEffect.creatorName()).toEqual('unbound effect');
    });
    it("should return the character's name for bound effect", () => {
      trackableEffect.creator({name: ko.observable('Kutulu')})
      expect(trackableEffect.creatorName()).toEqual('Kutulu');
    });
  });

  describe("update model data", () => {
    beforeEach(() => {
      trackableEffect.update({});
    });

    it("should properly set values for title, description, duration and effectType", () => {
      let updateData = {
        title: 'Bless',
        description: 'Buff +1 morale bonus on attack rolls and saves vs fear effects',
        duration: 3,
        effectType: 'Neutral',
        rankInCombat: 2
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.title()).toEqual('Bless');
      expect(trackableEffect.description()).toEqual('Buff +1 morale bonus on attack rolls and saves vs fear effects');
      expect(trackableEffect.duration()).toEqual(3);
      expect(trackableEffect.effectType()).toEqual(TrackableEffectModel.effectTypeNeutral());
      expect(trackableEffect.rankInCombat()).toEqual(2);
    });
    it("should default title to 'New effect'", () => {
      let updateData = {
        description: 'description but I forgot a title',
        duration: 3,
        effectType: 'Neutral'
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.title()).toEqual('New effect');
    });
    it("should default description to an empty string", () => {
      let updateData = {
        title: "Bull's Strength",
        duration: 3,
        effectType: 'Neutral'
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.description()).toEqual('');
    });
    it("should default duration to -1", () => {
      let updateData = {
        title: "Bull's Strength",
        description: '+4 enhancement bonus to strength',
        effectType: 'Neutral'
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.duration()).toEqual(-1);
    });
    it("should default effectType to Beneficial", () => {
      let updateData = {
        title: "Bull's Strength",
        description: '+4 enhancement bonus to strength',
        duration: 3
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.effectType()).toEqual(TrackableEffectModel.effectTypeBeneficial());
    });
    it("should default rankInCombat to 1", () => {
      let updateData = {
        description: 'description but I forgot a title',
        duration: 3,
        effectType: 'Neutral'
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.rankInCombat()).toEqual(1);
    });
  })
});