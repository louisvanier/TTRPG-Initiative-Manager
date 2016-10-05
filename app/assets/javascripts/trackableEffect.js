let ko = require('knockout')

let TrackableEffectModel = class {

  constructor() {
    this.title = ko.observable();
    this.description = ko.observable();
    this.duration = ko.observable();
    this.effectType = ko.observable();
    this.rankInCombat = ko.observable();
    this.creator = ko.observable();
    this.creatorName = ko.pureComputed(() => {
      if (this.creator()) {
        return this.creator().name();
      }

      return 'unbound effect';
    });
  }

  update(data) {
    this.title(data.title || "New effect");
    this.description(data.description || "");

    let rankInCombat = parseInt(data.rankInCombat || "1", 10);
    if (isNaN(rankInCombat)) {
      this.rankInCombat(1);
    } else {
      this.rankInCombat(rankInCombat);
    }

    let duration = parseInt(data.duration || "-1", 10);
    if (isNaN(duration)) {
      this.duration(1);
    } else {
      this.duration(duration);
    }

    data.effectType(TrackableEffectModel.parseEffectType(data.effectType || ""));
  }

  static effectTypeBeneficial() { return "BENEFICIAL" }
  static effectTypeNeutral() { return "NEUTRAL" }
  static effectTypeHarmful() { return "HARMFUL" }

  static parseEffectType(input) {
    let upperCased = input.toUpperCase();

    switch (upperCased) {
      case "NEUTRAL":
        return TrackableEffectModel.effectTypeNeutral();
      case "HARMFUL":
        return TrackableEffectModel.effectTypeHarmful();
      default:
        return TrackableEffectModel.effectTypeBeneficial();
    }
  }
}

exports.trackableEffect = TrackableEffectModel