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
  let trackableEffect 
  beforeEach(() => {
    //instantiate a new model
  });

  describe("update model data", () => {
    beforeEach(() => {
      //reset the models data
    });

    it("should properly set values for title, description, duration and effectType", () => {
    
    });
    it("should default title to 'New effect'", () => {
    
    });
    it("should default description to an empty string", () => {
    
    });
    it("should default duration to -1", () => {
    
    });
    it("should default effectType to Beneficial", () => {
    
    });
  })
});