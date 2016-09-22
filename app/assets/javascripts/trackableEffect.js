let ko = require('knockout')



let TrackableEffectModel = class {

  constructor() {
    this.title = ko.observable();
    this.description = ko.observable();
    this.duration = ko.observable();
    this.effectType = ko.observable();
  }

  update(data) {
    this.title(data.title || "New effect");
    this.description(data.description || "");

    let duration = parseInt(data.duration || "");
    this.duration(parseInt(isNaN(duration) ? -1 : duration));

    let effectType = data.effectType ? TrackableEffectModel.parseEffectType(data.effectType) : TrackableEffectModel.effectTypeBeneficial();
    this.effectType(effectType);
  }

  static effectTypeBeneficial() { return "BENEFICIAL"}
  static effectTypeNeutral() { return "NEUTRAL"};
  static effectTypeHarmful() { return "HARMFUL"};

  static parseEffectType(input) {
    input = input.toUpperCase();
    let parsedType = TrackableEffectModel.effectTypeBeneficial();

    switch (input) {
      case "NEUTRAL":
        parsedType = TrackableEffectModel.effectTypeNeutral();
        break;
      case "HARMFUL":
        parsedType = TrackableEffectModel.effectTypeHarmful();
        break;
    }

    return parsedType;
  }
}

exports.trackableEffect = TrackableEffectModel