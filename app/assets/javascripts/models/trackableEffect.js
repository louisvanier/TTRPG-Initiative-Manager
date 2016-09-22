import { ko } from  'knockout'

const effectTypeBeneficial = "BENEFICIAL";
const effectTypeNeutral = "NEUTRAL";
const effectTypeHarmful = "HARMFUL";

let parseEffectType = (input) => {
  input = input.toUpperCase();
  let parsedType = effectTypeBeneficial;

  switch (input) {
    case "NEUTRAL":
      parsedType = effectTypeNeutral;
      break;
    case "HARMFUL":
      parsedType = effectTypeHarmful;
      break;
  }

  return parsedType;
}

let trackableEffectModel = (data) => {
  let self = this;

  self.title = ko.observable();
  self.description = ko.observable();
  this.duration = ko.observable();
  this.effectType = ko.observable();
}

trackableEffectModel.prototype.update = (data) => {
  this.title(data.title || "New effect");
  this.description(data.description || "");

  let duration = parseInt(data.duration || "");
  this.duration(parseInt(isNaN(duration) ? -1 : duration);

  let effectType = data.effectType ? effectTypeBeneficial : parseEffectType(data.effectType);
  this.effectType(effectType);
}

export { effectTypeBeneficial, effectTypeNeutral, effectTypeHarmful, parseEffectType trackableEffectModel }