let ko = require('knockout');
let jQuery = require('jquery');

let CrudViewModel = class {
  constructor(activeModel) {
    this.activeModel = activeModel;
    this.flash = ko.observable();
    this.shownOnce = ko.observable();
    this.currentPage = ko.observable();
    this.errors = ko.observableArray();
    this.items = ko.observableArray();
    this.selectedItem = ko.observable();
    this.tempItem = new activeModel();
    let csrfToken = jQuery('meta[name="csrf-token"]').attr('content');
    jQuery.ajaxSetup({
      beforeSend: function(jqxhr, event, settings) {
        jqxhr.setRequestHeader('X-CSRF-Token', csrfToken);
        return true;
      }
    });
  }

  setFlash(flash) {
    this.flash(flash);
    this.shownOnce(false);
  }
  checkFlash() {
    if (this.shownOnce() == true) {
      this.flash('');
    }
  }
  clearTempItem() {
    this.tempItem.update({});
  }
  prepareTempItem() {
    this.tempItem.update(JSON.parse(ko.toJSON(this.selectedItem())));
  }
  indexAction() {
    let self = this;
    self.checkFlash();
    jQuery.get(this.activeModel.indexURL())
      .then((response) => {
      self.items([]);
      if (response) {
        for (let data of response) {
          let model = new self.activeModel();
          model.update(data);
          self.items.push(model);
        }
      }
      self.currentPage('index');
      self.shownOnce(true);  
    });
  }
  showAction(itemToShow) {
    this.checkFlash();
    this.errors([]);
    this.selectedItem(itemToShow);
    this.currentPage('show');
    this.shownOnce(true);
  }
  newAction() {
    this.checkFlash();
    this.currentPage('new');
    this.clearTempItem();
    this.shownOnce(true);
  }
  editAction(itemToEdit) {
    this.checkFlash();
    this.selectedItem(itemToEdit);
    this.prepareTempItem();
    this.currentPage('edit');
    this.shownOnce(true);
  }
  createAction(itemToCreate) {
    let self = this;
    let json_data = {};
    json_data[self.activeModel.jsonRoot()] = ko.toJS(itemToCreate);

    jQuery.ajax({
      type: 'POST',
      url: this.activeModel.createURL(),
      data: json_data,
      dataType: "json"
    }, (createdItem) => {
      self.errors([]);
      self.setFlash('Post successfully created.');  //actually use pub/sub
      self.clearTempItem();
      self.indexAction();
    }, (msg) => {
      self.errors(JSON.parse(msg.responseText));
    });
  }
  updateAction(itemToUpdate) {
    let self = this;
    let json_data = {};
    let json_model = ko.toJS(itemToCreate);
    delete json_model.id;
    delete json_model.created_at;
    delete json_model.updated_at;
    json_data[self.activeModel.jsonRoot()] = json_model

    jQuery.ajax({
      type: 'PUT',
      url: this.activeModel.updateURL(itemToUpdate.id()), 
      data: json_data,
      dataType: "json"
    }, (updatedItem) => {
      self.errors([]);
      self.setFlash('Post successfully updated.');   //actually use pub/sub
      self.showAction(updatedItem);
    }, (msg) => {
      self.errors(JSON.parse(msg.responseText));
    });
    
  }
  destroyAction(itemToDestroy) {
    let self = this;
    if (confirm('Are you sure?')) {
      jQuery.ajax({
        type: "DELETE",
        url: this.activeModel.destroyURL(itemToDestroy.id), 
        dataType: "json",
        success: () =>{
          self.errors([]);
          self.setFlash('Post successfully deleted.');  //actually use pub/sub
          debugger;
          self.indexAction();
        }, 
        error: (msg) => {
          self.errors(JSON.parse(msg.responseText));
        }
      });
    }
  }
};

exports.crudViewModel = CrudViewModel;
