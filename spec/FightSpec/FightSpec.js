describe("FightModel", function() {
  var FightModel = require('../../ViewModel');
  var Character = require('../../ViewModel/Character');
  var TrackableEffect = require('../../ViewModel/TrackableEffect');
  var ko = require('../../knockout/ko');
  var fightModel,
  characterAlpha, characterBeta, characterGamma, 
  effectOnAlpha, effectOnBeta;
  
  

  beforeEach(function() {
	characterAlpha = {name: 'Alpha', rankInCombat: 1, status: window.Constants.characterStatusCurrentlyActing()};
	characterBeta = {name: 'Beta', rankInCombat: 2};
	characterGamma = {name: 'Gamma', rankInCombat: 3};
	effectOnAlpha = {name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Alpha', effectType: window.Constants.effectTypeNeutral()};
	effectOnBeta = {name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Beta', effectType: window.Constants.effectTypeNeutral()}  
	
	var effectsRemovedArgs = [];
	var newRoundBeginningFired = [];
	
    fightModel = new FightModel({
    currentRound: 1,
    characters: [characterAlpha, characterBeta, characterGamma],
    effects: [effectOnAlpha, effectOnBeta]
	}, 
	{
		sortCanceled: function(eventData) { 
			console.log(eventData.character.name());
		},
		newRoundBeginning: function(eventData) {
			newRoundBeginningFired.push(eventData);
		},
		effectRemoved: function(eventData) {
			effectsRemovedArgs.push(eventData);
		}
	  });
  });

  it("should say there is one character currently acting, and its name is Alpha", function() {
    expect(fightModel.currentlyActingCharacters().length).toEqual(1);
	expect(fightModel.currentlyActingCharacters()[0].name()).toEqual(characterAlpha.name());

    //demonstrates use of custom matcher
    // expect(player).toBePlaying(song);
  });
  
  it("should say there are two characters about to act, and their names should be Beta and Gamma", function() {
	expect(fightModel.haventPlayedYetCharacters().length).toEqual(2);
	expect(fightModel.haventPlayedYetCharacters()[0].name()).toEqual(characterBeta.name());
	expect(fightModel.haventPlayedYetCharacters()[1].name()).toEqual(characterGamma.name());
  });
  
  it("should fire the event removed event once, and the effect should be removed on alpha", function() {
	 fightModel.removeEffect(fightModel.effects()[0]);
	 
	 expect(effectsRemovedFired.length).toEqual(1);
	 expect(effectsRemovedFired[0].effectTarget).toEqual(characterAlpha.name());
  });

  // describe("when song has been paused", function() {
    // beforeEach(function() {
      // player.play(song);
      // player.pause();
    // });

    // it("should indicate that the song is currently paused", function() {
      // expect(player.isPlaying).toBeFalsy();

      // // demonstrates use of 'not' with a custom matcher
      // expect(player).not.toBePlaying(song);
    // });

    // it("should be possible to resume", function() {
      // player.resume();
      // expect(player.isPlaying).toBeTruthy();
      // expect(player.currentlyPlayingSong).toEqual(song);
    // });
  // });

  // // demonstrates use of spies to intercept and test method calls
  // it("tells the current song if the user has made it a favorite", function() {
    // spyOn(song, 'persistFavoriteStatus');

    // player.play(song);
    // player.makeFavorite();

    // expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  // });

  // //demonstrates use of expected exceptions
  // describe("#resume", function() {
    // it("should throw an exception if song is already playing", function() {
      // player.play(song);

      // expect(function() {
        // player.resume();
      // }).toThrowError("song is already playing");
    // });
  // });
});
