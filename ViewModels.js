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
	
	self.hasntPlayedYet = ko.computed(function() {
		return self.status() === Constants.characterStatusAboutToAct()
			|| self.status() === Constants.characterStatusDelaying();
	});
	
	self.alreadyPlayed = ko.computed(function() {
		return self.status() === Constants.characterStatusReadying()
			|| self.status() === Constants.characterStatusAlreadyActed();
	});
	
	self.hasDelayedCurrentRound = ko.computed(function() {
		return self.status() === Constants.characterStatusDelaying();
	});

    self.update(data);
};

//can pass fresh data to this function at anytime to apply updates or revert to a prior version
Character.prototype.update = function(data) { 
    //the character's name
    this.name(data.name || "New Character");

    //the current rank in the combat. Do not track a real initiative, only the position at which the character is acting
    this.rankInCombat(data.rankInCombat);

    //a flag to indicate the character is out of combat. 
    this.status(data.status || Constants.characterStatusAboutToAct());
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
	self.durationFormatted = ko.pureComputed(function() {
		//return the unicode symbol for infinity when duration is -1, it is treated as such anyway. Otherwise return the duration as a string.
		return self.duration() === -1 ? "\u221E" : self.duration() + "";
	});

    //the effect type (beneficial, neutral, harmful
    self.effectType = ko.observable();

    //the rank at which the effect came into the fight, and at which it will decrease its duration
    self.rankInCombat = ko.observable();
	
	//the character this effect is applied to
	self.character = ko.observable();
	self.characterName = ko.pureComputed(function () { 
		return self.character() ? self.character().name() : ''; 
	});
	
	self.update(data);
}

TrackableEffect.prototype.update = function(data) {
    this.name(data.name || "New Trackable Effect");
    this.description(data.description || "description missing");
    this.duration(data.duration || Constants.effectDurationForever());
    this.effectType(data.effectType || Constants.effectTypeNeutral());
    this.rankInCombat(data.rankInCombat || 1);
}

var FightModel = function(fightData, eventCallbacks) {
    var self = this;
	
	//helper function to fire subscribed events
    var fireEventCallback = function(eventCallbackName, callbackData) {
		if (eventCallbacks && eventCallbacks[eventCallbackName] && typeof eventCallbacks[eventCallbackName] === 'function') {
			eventCallbacks[eventCallbackName].call(self, callbackData);
		}
	}

    //Load characters
    self.allCharacters = ko.observableArray(ko.utils.arrayMap(fightData.characters, function(data) {
		var newCharacter = new Character(data);
        return newCharacter;
    }));
	
	//return only characters that are not knocked out
	self.inCombatCharacters = self.allCharacters.filter( ch => ch.status() !== Constants.characterStatusOutOfCombat());
	
	//return characters that are in statuses where they've already spend their turn
	self.alreadyPlayedCharacters = self.allCharacters.filterByProperty("alreadyPlayed", true);
															
	//return  characters that are in statuses where they haven't already acted this turn
	self.haventPlayedYetCharacters = self.allCharacters.filterByProperty("hasntPlayedYet", true);
	
	//return all the characters that have the status saying they are currently action
	self.currentlyActingCharacters = self.allCharacters.filterByProperty("status", Constants.characterStatusCurrentlyActing());
    
    //functions and observables to add/edit/cancel the edition of a new character
    self.selectedCharacter = ko.observable();
    self.characterForEditing = ko.observable();
    self.selectCharacter = self.selectCharacter.bind(this);
    self.acceptCharacter = self.acceptCharacter.bind(this);
    self.revertCharacter = self.revertCharacter.bind(this);
    self.addCharacter = self.addCharacter.bind(this);
    self.addingNewCharacter = ko.observable(false);

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
    self.addingNewEffect = ko.observable(false);
	self.characterForEditingEffects = self.effects.filter(effect => effect.character() === self.selectedCharacter());
	self.selectedTargets = ko.observableArray([]);
	
	//functions to manage effects
	self.removeEffect = function(effect) {
		fireEventCallback('effectRemoved', {round: self.currentRound(), effectName: effect.name(), effectTarget: effect.characterName()});
	
		ko.utils.arrayRemoveItem(self.effects(), effect);
		//TODO => dive deeper, why do we have to notify manually that there was a change? problem seems to rely in characterForEditingEffects
		self.effects.valueHasMutated();
	}
	self.removeEffectList = function(effects) {
		//TODO => raise an effectRemoved event at once, concatenating all the effects properly per effect
		var effectsRemoved = {}
	
		ko.utils.arrayForEach(effects, function (effect) { 
			if (!effectsRemoved[effect.name()]) {
				effectsRemoved[effect.name()] = effect.characterName();
			} else {
				effectsRemoved[effect.name()] += (', ' + effect.characterName());
			}
			ko.utils.arrayRemoveItem(self.effects(), effect)
		});
		
		ko.utils.objectForEach(effectsRemoved, function(key, value) {
			fireEventCallback('effectRemoved', {round: self.currentRound(), effectName: key, effectTarget: value});
		});
		
		self.effects.valueHasMutated();
	}
	
	
	//round management related functions
	self.currentRound = ko.observable(fightData.currentRound);
	self.currentRankInCombat = ko.observable(fightData.currentRankInCombat || 1);
	
	self.canGoToNextCharacter = ko.pureComputed(function () {
		return self.allCharacters().length > 1;
	})
	
	self.nextCharacter = function() {
		//have we reached the end of all characters?
		if (self.currentRankInCombat() === self.allCharacters().length) {
			//reset the status of all characters except the ready status, because it can carry over from round to round
			ko.utils.arrayForEach(ko.utils.arrayFilter(self.allCharacters(), cha => cha.status() !== Constants.characterStatusReadying()), ch => ch.status(Constants.characterStatusAboutToAct()));
			self.currentRound(self.currentRound() + 1);
			fireEventCallback('newRoundBeginning', {round: self.currentRound()});
		}
	
		//move the currentRank forward by 1, or reset to 0 if we have moved through all the characters
		self.currentRankInCombat(self.currentRankInCombat() === self.allCharacters().length ? 1 : self.currentRankInCombat() + 1);
		
		//set everyone currentlyActing as alreadyActed
		ko.utils.arrayForEach(ko.utils.arrayFilter(self.allCharacters(), cha => cha.status() === Constants.characterStatusCurrentlyActing()), ch => ch.status(Constants.characterStatusAlreadyActed()));
		
		//set everyone in the currentRank as currentlyActingCharacters
		ko.utils.arrayForEach(ko.utils.arrayFilter(self.allCharacters(),cha => cha.rankInCombat() === self.currentRankInCombat()), ch => ch.status(Constants.characterStatusCurrentlyActing()));
		
		//update effect duration
		ko.utils.arrayForEach(ko.utils.arrayFilter(self.effects(), eff => eff.rankInCombat() === self.currentRankInCombat() && eff.duration() !== -1), effect => effect.duration(effect.duration() - 1));
		
		var removedEffects = ko.utils.arrayFilter(self.effects(), eff => eff.duration() === 0);
		if (removedEffects.length > 0) {
			self.removeEffectList(removedEffects);
		}
		
		self.allCharacters.valueHasMutated();
	}
	
	self.afterSortHandler = function(args) {
		for (var index = 0; index < self.allCharacters().length; index++) {
                    self.allCharacters()[index].rankInCombat(index);
        }
		
		//set the status of the character we have delayed
		args.item.status(Constants.characterStatusDelaying());
		
		//We need to move forward to the next character unless there were other characters at the same rank
		if (ko.utils.arrayFilter(self.allCharacters(), ch => ch.status() === Constants.characterStatusCurrentlyActing()).length === 0) {
			self.nextCharacter();
		}
		
		self.allCharacters.valueHasMutated();
	}
	self.beforeSortHandler = function(args) {
		//early bail if already delayed
		if (args.item.status() !== Constants.characterStatusCurrentlyActing()) {
			fireEventCallback('sortCanceled', {character: args.item});
			args.cancelDrop = true;
			return false;
		}
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
        
        if (this.addingNewCharacter()) {
            this.allCharacters.push(new Character(edited));
        } else {
            //apply updates from the edited character to the selected character
            selected.update(edited);
        }
        
        //always clear this flag
        this.addingNewCharacter(false);
        //clear selected item
        this.selectedCharacter(null);
        this.characterForEditing(null);
    },
    
    //just throw away the edited item and clear the selected observables
    revertCharacter: function() {
        this.addingNewCharacter(false);
        this.selectedCharacter(null);
        this.characterForEditing(null);
    },

    addCharacter: function() {
        this.addingNewCharacter(true);
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
        
        if (this.addingNewEffect()) {
            //we're adding a new effect
			var fightModel = this;
			ko.utils.arrayForEach(this.selectedTargets(), function(target) {
				var newEffect = new TrackableEffect(edited)
				newEffect.character(ko.utils.arrayFirst(fightModel.allCharacters(), ch => ch.name() === target.name()));
				fightModel.effects.push(newEffect);
			});
			
            
        }
        else {
            //apply updates from the edited effect to the selected effect
            selected.update(edited);
        }
		
		this.selectedTargets([]);
        
        //clear selected item
        this.selectedEffect(null);
        this.effectForEditing(null);
    },
    
    //just throw away the edited item and clear the selected observables
    revertEffect: function() {
        this.addingNewEffect(false);
        this.selectedEffect(null);
        this.effectForEditing(null);
    },

    addEffect: function() {
        this.addingNewEffect(true);
        var newEffect = new TrackableEffect({})
        this.selectedEffect(newEffect);
        this.effectForEditing(newEffect);
    }
});
