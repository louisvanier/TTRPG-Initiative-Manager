import { effectTypeBeneficial,
  effectTypeNeutral,
  effectTypeHarmful,
  parseEffectType,
  trackableEffectModel } 
  from 'trackableEffect'

describe("parseEffectType", () => {
  beforeEach(() => {

  });

  it("should parse NeUtRaL case insensitive", () => {
    expect(parseEffectType("NeUtRaL").toEqual(effectTypeNeutral))
  });
  it("should parse HaRmFuL case insensitive", () => {
    expect(parseEffectType("HaRmFuL").toEqual(effectTypeHarmful))
  });
  it("should default to beneficial on giberrish", () => {
    expect(parseEffectType("Giberrish").toEqual(effectTypeBeneficial))
  });
});

describe("trackableEffect model", () => {
  let trackableEffect = null;
  beforeEach(() => {
    trackableEffect = trackableEffectModel({});
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
        effectType: 'Neutral'
      };

      trackableEffect.update(updateData);
      expect(trackableEffect.title()).toEqual('Bless');
      expect(trackableEffect.description()).toEqual('Buff +1 morale bonus on attack rolls and saves vs fear effects');
      expect(trackableEffect.duration()).toEqual(3);
      expect(trackableEffect.effectType()).toEqual(effectTypeNeutral);
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
      expect(trackableEffect.duration()).toEqual('');
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
      expect(trackableEffect.effectType()).toEqual(effectTypeBeneficial);
    });
  })
});