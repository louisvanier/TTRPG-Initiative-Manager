describe("FightModel", function() {
  var FightModel = require('../../ViewModel/FightModel');
  var Character = require('../../ViewModel/Character');
  var TrackableEffect = require('../../ViewModel/TrackableEffect');
  var ko = require('../../knockout/ko');
  var fightModel;

  beforeEach(function() {
    fightModel = new FightModel({
    currentRound: 1,
    characters: [{name: 'Alpha', rankInCombat: 1, status: window.Constants.characterStatusCurrentlyActing()}, {name: 'Beta', rankInCombat: 2}, {name: 'Gamma', rankInCombat: 3}],
    effects: [{name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Alpha', effectType: window.Constants.effectTypeNeutral()},
			  {name: 'Super-jetstream', description: 'the power of the wind', duration: 2, rankInCombat: 3, characterName: 'Beta', effectType: window.Constants.effectTypeNeutral()}]
	  }, {
		sortCanceled: function(eventData) { 
			console.log(eventData.character.name());
		},
		newRoundBeginning: function(eventData) {
			console.log('round ' + eventData.round + ' has just begun');
		},
		effectRemoved: function(eventData) {
			console.log('round ' + eventData.round + ', effect "' + eventData.effectName + '" on "' + eventData.effectTarget + '" was removed');
		}
	  });
  });

  it("should say there is one character about to Act, and its name is Alpha", function() {
    expect(fightModel.currentlyActingCharacters().length).toEqual(1);
	expect(fightModel.currentlyActingCharacters()[0].name()).toEqual('Alpha');

    //demonstrates use of custom matcher
    // expect(player).toBePlaying(song);
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
