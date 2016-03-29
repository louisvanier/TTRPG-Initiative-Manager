
var constants = (function() {
    var instance = {};
    var effectTypeBeneficial = 'beneficial';
    var effectTypeNeutral = 'neutral';
    var effectTypeHarmful = 'harmful';
    var effectDurationForever = -1;

    instance.effectTypeBeneficial = function () {
                return effectTypeBeneficial;
    }
    instance.effectTypeNeutral = function () {
        return effectTypeNeutral;
    }
    instance.effectTypeHarmful = function () {
        return effectTypeHarmful;
    }

    instance.effectDurationForever = function () {
        return effectDurationForever;
    }

    return instance
})();

//Model for a character in a fight
//  data => Character data and specifications
//  services => Injected services, such as logger
var Character = function(data, services) {
    this.name = ko.observable();
    this.rankInCombat = ko.observable();
    this.outOfCombat = ko.observable();

    this.update(data);
};

//can pass fresh data to this function at anytime to apply updates or revert to a prior version
Character.prototype.update = function(data, services) { 
    //the character's name
    this.name(data.name || "New Character");

    //the current rank in the combat. Do not track a real initiative, only the position at which the character is acting
    this.rankInCombat(data.rankInCombat);

    //a flag to indicate the character is out of combat. 
    this.outOfCombat(data.outOfCombat || false);
};

//Model for a trackable effect in a fight (buffs, debuffs, conditions)
//  data => Effect data and specifications
//  services => Injected services, such as logger
var TrackableEffect = function(data, services) {
    //friendly display for the effect
    this.name = ko.observable();
    this.description = ko.observable();

    //the duration in rounds of the effect. Some effects have a special duration which means it is not tracked
    this.duration = ko.observable();

    //the effect type (beneficial, neutral, harmful
    this.effectType = ko.observable();

    //the rank at which the effect came into the fight, and at which it will decrease its duration
    this.rankInCombatOrder = ko.observable();

}

TrackableEffect.prototype.update = function(data) {
    this.name(data.name || "New Trackable Effect");
    this.description(data.description || "description missing");
    this.duration(data.duration || constants.effectDurationForever());
    this.effectType(data.effectType || constants.effectTypeNeutral());
    this.rankInCombatOrder(data.rankInCombatOrder || 0);
}

var FightModel = function(fightData) {
    
    this.currentRound = ko.observable(fightData.currentRound);


    //Load characters
    this.characters = ko.observableArray(ko.utils.arrayMap(fightData.characters, function(data) {
        return new Character(data);
    }));
    
    //hold the currently selected character
    this.selectedCharacter = ko.observable();
    
    //make edits to a copy
    this.characterForEditing = ko.observable();
    
    this.selectCharacter = this.selectCharacter.bind(this);
    this.acceptCharacter = this.acceptCharacter.bind(this);
    this.revertCharacter = this.revertCharacter.bind(this);
    this.addCharacter = this.addCharacter.bind(this);
    this.addingNewCharacter = false;

    //Load trackable effects
    this.effects = ko.observableArray(ko.utils.arrayMap(fightData.effects, function(data) {
        return new TrackableEffect(data);
    }));

    //hold the currently selected effect
    this.selectedEffect = ko.observable();

    this.effectForEditing = ko.observable();

    this.selectEffect = this.selectEffect.bind(this);
    this.acceptEffect = this.acceptEffect.bind(this);
    this.revertEffect = this.revertEffect.bind(this);
    this.addEffect = this.addEffect.bind(this);
    this.addingNewEffect = false;


};

ko.utils.extend(FightModel.prototype, {
    //select a character and make a copy of it for editing
    selectCharacter: function(character) {
        this.selectedCharacter(character);
        this.characterForEditing(new Character(ko.toJS(character)));
    },
    
    acceptCharacter: function(character) {
        var selected = this.selectedCharacter(),
            edited = ko.toJS(this.characterForEditing()); //clean copy of edited
        
        if (this.addingNewCharacter) {
            this.characters.push(new Character(edited));
        } else {
            //apply updates from the edited character to the selected character
            selected.update(edited);
        }
        
        //always clear this flag
        this.addingNewCharacter = false;
        //clear selected item
        this.selectedCharacter(null);
        this.characterForEditing(null);
    },
    
    //just throw away the edited item and clear the selected observables
    revertCharacter: function() {
        this.addingNewCharacter = false;
        this.selectedCharacter(null);
        this.characterForEditing(null);
    },

    addCharacter: function() {
        this.addingNewCharacter = true;
        var newCharacter = new Character({})
        this.selectedCharacter(newCharacter);
        this.characterForEditing(newCharacter);
    },

    //select a effect and make a copy of it for editing
    selectEffect: function(effect) {
        this.selectedEffect(effect);
        this.effectForEditing(new TrackableEffect(ko.toJS(effect)));
    },
    
    acceptEffect: function(effect) {
        var selected = this.selectedEffect(),
            edited = ko.toJS(this.effectForEditing()); //clean copy of edited
        
        if (this.addingNewEffect) {
            //we're adding a new effect
            this.effects.push(new TrackableEffect(edited));
        }
        else {
            //apply updates from the edited effect to the selected effect
            selected.update(edited);
        }
        
        //clear selected item
        this.selectedEffect(null);
        this.effectForEditing(null);
    },
    
    //just throw away the edited item and clear the selected observables
    revertEffect: function() {
        this.addingNewEffect = false;
        this.selectedEffect(null);
        this.effectForEditing(null);
    },

    addEffect: function() {
        this.addingNewEffect = true;
        var newEffect = new Effect({})
        this.selectedEffect(newEffect);
        this.effectForEditing(newEffect);
    }
});
