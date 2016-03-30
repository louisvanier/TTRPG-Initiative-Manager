//constant values and references
(function(cons) {

	// effectTypes
    
    cons.effectTypeBeneficial = function () {
                return 'beneficial';
    }
    cons.effectTypeNeutral = function () {
        return 'neutral';
    }
    cons.effectTypeHarmful = function () {
        return 'harmful';
    }

	//effectDurations
    cons.effectDurationForever = function () {
        return -1;
    }
	
	//characterStatuses
	cons.characterStatusReadying = function() {
		return 'Readying';
	}
	cons.characterStatusCurrentlyActing = function() {
		return 'CurrentlyActing';
	}
	cons.characterStatusDelaying = function() {
		return 'Delaying';
	}
	cons.characterStatusAboutToAct = function() {
		return 'AboutToAct';
	}
	cons.characterStatusOutOfCombat = function() {
		return 'OutOfCombat';
	}
	cons.characterStatusAlreadyActed = function() {
		return 'AlreadyActed';
	}

    return cons
})(window.Constants = window.Constants || {});

//Model for a character in a fight
//  data => Character data and specifications
var Character = function(data) {
	var self = this;
    self.name = ko.observable();
    self.rankInCombat = ko.observable();
    self.status = ko.observable();

    self.update(data);
};

//can pass fresh data to this function at anytime to apply updates or revert to a prior version
Character.prototype.update = function(data) { 
    //the character's name
    this.name(data.name || "New Character");

    //the current rank in the combat. Do not track a real initiative, only the position at which the character is acting
    this.rankInCombat(data.rankInCombat);

    //a flag to indicate the character is out of combat. 
    this.status(data.status || window.Constants.characterStatusAboutToAct());
};

//Model for a trackable effect in a fight (buffs, debuffs, conditions)
//  data => Effect data and specifications
var TrackableEffect = function(data) {
	var self = this;

    //friendly display for the effect
    self.name = ko.observable();
    self.description = ko.observable();

    //the duration in rounds of the effect. Some effects have a special duration which means it is not tracked
    self.duration = ko.observable();

    //the effect type (beneficial, neutral, harmful
    self.effectType = ko.observable();

    //the rank at which the effect came into the fight, and at which it will decrease its duration
    self.rankInCombat = ko.observable();
	
	//the character this effect is applied to
	self.character = ko.observable();
	self.characterName = ko.computed(function () { 
		return self.character() ? self.character().name() : ''; 
	});
	
	self.update(data);
}

TrackableEffect.prototype.update = function(data) {
    this.name(data.name || "New Trackable Effect");
    this.description(data.description || "description missing");
    this.duration(data.duration || constants.effectDurationForever());
    this.effectType(data.effectType || constants.effectTypeNeutral());
    this.rankInCombat(data.rankInCombat || 0);
}

var FightModel = function(fightData) {
    var self = this;
    self.currentRound = ko.observable(fightData.currentRound);

    //Load characters
    self.allCharacters = ko.observableArray(ko.utils.arrayMap(fightData.characters, function(data) {
		var newCharacter = new Character(data);
        return newCharacter;
    }));
	
	//return only characters that are not knocked out
	self.inCombatCharacters = ko.computed(function() {
		return ko.utils.arrayFilter(self.allCharacters(), ch => ch.status() !== window.Constants.characterStatusOutOfCombat());
	});
	
	self.alreadyPlayedCharacters = ko.computed(function() {
		return ko.utils.arrayFilter(self.allCharacters(), ch => ch.status() === window.Constants.characterStatusAboutToAct() 
															
															|| ch.status() === window.Constants.characterStatusReadying()
															|| ch.status() === window.Constants.characterStatusAlreadyActed());
	});
	self.haventPlayedYetCharacters = ko.computed(function() {
		return ko.utils.arrayFilter(self.allCharacters(), ch => ch.status() === window.Constants.characterStatusAboutToAct
															|| ch.status() === window.Constants.characterStatusDelaying());
	});
    
    //functions and observables to add/edit/cancel the edition of a new character
    self.selectedCharacter = ko.observable();
    self.characterForEditing = ko.observable();
    self.selectCharacter = self.selectCharacter.bind(this);
    self.acceptCharacter = self.acceptCharacter.bind(this);
    self.revertCharacter = self.revertCharacter.bind(this);
    self.addCharacter = self.addCharacter.bind(this);
    self.addingNewCharacter = false;

    //Load trackable effects
    self.effects = ko.observableArray(ko.utils.arrayMap(fightData.effects, function(data) {
		var newEffect = new TrackableEffect(data);
		newEffect.character(ko.utils.arrayFirst(self.allCharacters(), ch => ch.name() === data.characterName));
        return newEffect;
    }));

    //functions and observables to add/edit/cancel the edition of a new effect
    self.selectedEffect = ko.observable();
    self.effectForEditing = ko.observable();
    self.selectEffect = self.selectEffect.bind(this);
    self.acceptEffect = self.acceptEffect.bind(this);
    self.revertEffect = self.revertEffect.bind(this);
    self.addEffect = self.addEffect.bind(this);
    self.addingNewEffect = self;
	self.characterForEditingEffects = self.effects.filter(effect => effect.character() === self.selectedCharacter());
	
	//functions to manage effects
	self.removeEffect = function(effect) {
		console.log('inside remove effect');
		console.log(effect);
		ko.utils.arrayRemoveItem(self.effects(), effect);
	}


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
