describe("FightModel", function() {
	var fightModel,
	characterAlpha, characterBeta, characterGamma, 
	effectOnAlpha, effectOnBeta,
	effectsRemovedFired, newRoundBeginningFired;



	beforeEach(function() {
		characterAlpha = {name: 'Alpha', rankInCombat: 1, status: window.Constants.characterStatusCurrentlyActing()};
		characterBeta = {name: 'Beta', rankInCombat: 2};
		characterGamma = {name: 'Gamma', rankInCombat: 3};
		effectOnAlpha = {name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Alpha', effectType: window.Constants.effectTypeNeutral()};
		effectOnBeta = {name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Beta', effectType: window.Constants.effectTypeNeutral()}  
		
		effectsRemovedFired = [];
		newRoundBeginningFired = [];
		
		fightModel = new FightModel({
currentRound: 1,
characters: [characterAlpha, characterBeta, characterGamma],
effects: [effectOnAlpha, effectOnBeta]
		}, {sortCanceled: function(eventData) { 
				console.log(eventData.character.name());
			},
newRoundBeginning: function(eventData) {
				newRoundBeginningFired.push(eventData);
			},
effectRemoved: function(eventData) {
				effectsRemovedFired.push(eventData);
			}
		}
		);
	});

	it("should say there is one character currently acting, and its name is Alpha", function() {
		expect(fightModel.currentlyActingCharacters().length).toEqual(1);
		expect(fightModel.currentlyActingCharacters()[0].name()).toEqual(characterAlpha.name);

		//demonstrates use of custom matcher
		// expect(player).toBePlaying(song);
	});

	it("should say there are two characters about to act, and their names should be Beta and Gamma", function() {
		expect(fightModel.haventPlayedYetCharacters().length).toEqual(2);
		expect(fightModel.haventPlayedYetCharacters()[0].name()).toEqual(characterBeta.name);
		expect(fightModel.haventPlayedYetCharacters()[1].name()).toEqual(characterGamma.name);
	});

	it("should fire the eventRemoved event once, and the effect should be removed on alpha", function() {
		fightModel.removeEffect(fightModel.effects()[0]);
		
		expect(effectsRemovedFired.length).toEqual(1);
		expect(effectsRemovedFired[0].effectTarget).toEqual(characterAlpha.name);
	});
});
