
let characterModel = (data) => {
  let self = this;

  self.name = ko.observable();
}

characterModel.prototype.update = (data) => {
  this.name(data.name || "New Character");
}