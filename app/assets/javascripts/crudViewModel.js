let ko = require('knockout')
let jQuery = require('jquery')

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
    this.checkFlash();
    jQuery.getJSON(this.activeModel.indexURL, function(data) {
      this.items(data);
      this.currentPage('index');
      this.shownOnce(true);
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
    var json_data = ko.toJS(itemToCreate);
    jQuery.ajax({
      type: 'POST',
      url: this.activeModel.createURL,
      data: {
        // /// 17
        post: json_data
      },
      dataType: "json"
    }).success((createdItem) => {
      this.errors([]);
      this.setFlash('Post successfully created.');  //actually use pub/sub
      this.clearTempItem();
      this.showAction(createdItem);
    }).error((msg) => {
      this.errors(JSON.parse(msg.responseText));
    });
  }
  updateAction(itemToUpdate) {
    var json_data = ko.toJS(itemToUpdate);
    delete json_data.id;
    delete json_data.created_at;
    delete json_data.updated_at;

    jQuery.ajax({
      type: 'PUT',
      url: this.activeModel.updateURL(itemToUpdate.id()), 
      data: {
        post: json_data
      },
      dataType: "json"
    }).success((updatedItem) => {
      this.errors([]);
      this.setFlash('Post successfully updated.');   //actually use pub/sub
      this.showAction(updatedItem);
    }).error((msg) => {
      this.errors(JSON.parse(msg.responseText));
    });
    
  }
  destroyAction(itemToDestroy) {
    if (confirm('Are you sure?')) {
      jQuery.ajax({
        type: "DELETE",
        url: this.activeModel.destroyURL(itemToDestroy.id), 
        dataType: "json"
      }).success(() =>{
        this.errors([]);
        this.setFlash('Post successfully deleted.');  //actually use pub/sub
        this.indexAction();
      }).error((msg) => {
        this.errors(JSON.parse(msg.responseText));
      });
    }
  }
};

exports.crudViewModel = CrudViewModel
//TODO => GET SOME TESTS FOR THIS
//TODO => move this to the actual HTML
// jQuery(document).ready(function() {
//   ko.applyBindings(this);
//   this.indexAction();
//   this.clearTempItem();
// });
