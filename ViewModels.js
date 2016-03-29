//TODO => Split models per file
//TODO => remove character model dependecies for event log
//TODO => Add JSON import option for characterSet
//TODO => 

   toastr.options = {
            closeButton: true,
            newestOnTop: false,
            positionClass: "toast-bottom-left",
            showDuration: 200,
            hideDuration: 500
        };


        var constants = (function () {
            //use closure to protect constant values
            var instance = {};
            var effectTypeBeneficial = 'beneficial';
            var effectTypeNeutral = 'neutral';
            var effectTypeHarmful = 'harmful';
            var actingStatusAlreadyActed = 'alreadyActed';
            var actingStatusAboutToAct = 'aboutToAct';
            var actingStatusCurrentlyActing = 'currentlyActing';
            var actingStatusOutOfCombat = 'outOfCombat';

            instance.effectTypeBeneficial = function () {
                return effectTypeBeneficial;
            }
            instance.effectTypeNeutral = function () {
                return effectTypeNeutral;
            }
            instance.effectTypeHarmful = function () {
                return effectTypeHarmful;
            }

            instance.ActingStatusAlreadyActed = function () {
                return actingStatusAlreadyActed;
            }
            instance.ActingStatusAboutToAct = function () {
                return actingStatusAboutToAct;
            }
            instance.ActingStatusCurrentlyActing = function () {
                return actingStatusCurrentlyActing;
            }
            instance.ActingStatusOutOfCombat = function () {
                return actingStatusOutOfCombat;
            }


            return instance;
        })();

        
        var TrackableEffectModel = function (effectData) {
            var self = this;
            self.Title = ko.observable(effectData.Title);
            self.Duration = ko.observable(effectData.Duration);
            self.Description = ko.observable(effectData.Description);
            self.RankInCombatOrder = ko.observable(effectData.RankInCombatOrder);
            self.EffectType = ko.observable(effectData.EffectType)
            self.EffectTypeDisplay = ko.computed(function () {
                var effectDataLowered = self.EffectType() ? self.EffectType().toLowerCase() : constants.effectTypeNeutral();
                return effectDataLowered;
            });
            self.Display = ko.pureComputed(function () {
                return '(' + self.Duration() + ' rnds) ' + self.Title() + (self.Description() ? ' => ' + self.Description() : '');
            });
        }

        var CharacterModel = function (characterData) {
            var self = this;
            self.Label = ko.observable(characterData.Label);
            self.Hits = ko.observable(characterData.Hits);
        }

        var ParticipantModel = function (characterData) {
            var self = this;

            //basic participant properties
            self.Name = ko.observable(characterData.Name);
            self.IsPC = ko.observable(characterData.IsPC);
            self.HasDelayedCurrentRound = ko.observable(characterData.HasDelayedCurrentRound);
            self.HasReadiedCurrentRound = ko.observable(characterData.HasReadiedCurrentRound);
            self.RankInCombatOrder = ko.observable(characterData.RankInCombatOrder);
            self.OutOfCombat = ko.observable(characterData.OutOfCombat);

            //characters (mostly for managing several mobs at once)
            self.Characters = ko.observableArray(characterData.Characters);
            self.Character = ko.observable();
            self.CharacterUndo = null;
            self.characterModal = $('#characterModal');

            //trackable effects are buffs, debuffs or just conditions that will expire
            self.TrackableEffects = ko.observableArray(characterData.TrackableEffects);

            //effects related functions
            self.addEffect = function (effectModel) {
                self.TrackableEffects.push(effectModel);
                self.TrackableEffects.sort(function (effectA, effectB) {
                    if (effectA.EffectType() === effectB.EffectType()) {
                        return effectA.Title().localeCompare(effectB.Title());
                    }

                    switch(effectA.EffectType())
                    {
                        case constants.effectTypeBeneficial():
                            return -1;
                        case constants.effectTypeNeutral():
                            return effectB.EffectType() === constants.effectTypeBeneficial() ? 1 : -1;
                        case constants.effectTypeHarmful():
                            return 1;
                    }

                })
            }
            self.removeEffect = function (effect) {
                viewModel.EventLog.push('(round ' + viewModel.CurrentRound() + ') ' + self.Name() + ' => Effect removed: ' + self.TrackableEffects()[effect].Title());
                self.TrackableEffects.splice(effect, 1);
            };
            self.removeFinishedEffects = function () {
                //find all elements to remove
                var effectsToRemove = [];
                ko.utils.arrayForEach(self.TrackableEffects(), function (effect) {
                    if (effect.Duration() <= 0) {
                        effectsToRemove.push(effect);
                    }
                });

                //build the toast display
                var effectsRemoved = effectsToRemove.map(function (effect) { return '- ' + effect.Title()}).join('<br/>');
                //remove the effects
                $.each(effectsToRemove, function (index) {
                    viewModel.EventLog.push('(round ' + viewModel.CurrentRound() + ') ' + self.Name() + ' => Effect ended: ' + effectsToRemove[index].Title());
                    self.TrackableEffects.remove(effectsToRemove[index]);
                });
                //show a toast with the removed effects
                toastr.warning(effectsRemoved, self.Name(), { positionClass: "toast-bottom-center" })
            }
            self.removeAllEffects = function () {
                self.TrackableEffects.removeAll();
            }

            //character related functions
             //Cancel an edit                
            this.cancel = function() {
                self.Character(ko.mapping.fromJS(self.venueUndo));
                characterModal.modal("hide");
            }

            //Edit an existing character
            this.edit = function(venue) {
                self.Character(venue);
                self.venueUndo = ko.mapping.toJS(venue);
                characterModal.modal("show");
            };

            //Create a new character
            this.create = function() {
                self.Character(new Venue());
                characterModal.modal("show");
            };

            self.TakeOut = function () {
                self.OutOfCombat(true);
                viewModel.EventLog.push('(round ' + viewModel.CurrentRound() + ') ' + self.Name() + ' => Taken out of combat' + (viewModel.IsCurrentCharacter(self.RankInCombatOrder) ? ' on his own turn' : ' on ' + viewModel.CurrentCharacter().Name() + "'s turn"));
            }
        }
        
        var FightModel = function () {
            self = this;
            self.CurrentRound = ko.observable(1);
            self.CurrentCharacterIndex = ko.observable(0);
            self.NewTrackableEffect = ko.observable(new TrackableEffectModel({}));
            self.NewCharacter = ko.observable(new ParticipantModel({}));
            self.SelectedTargets = ko.observableArray([]);
            self.TrackableEffectTypes = ko.observableArray([constants.effectTypeBeneficial(), constants.effectTypeHarmful(), constants.effectTypeNeutral()]);
            self.EventLog = ko.observableArray([]);
            self.EventLogForDisplay = ko.computed(function () {
                return self.EventLog().slice(0).reverse();
            });
            
            //self.Characters = ko.observableArray([]);
            

            self.Characters = ko.observableArray([]);

            self.ValuesActBeforeNewCharacter = ko.computed(function () {
                var array = ko.utils.arrayMap(self.Characters(), function (character) {
                    return new ParticipantModel({ Name: character.Name(), RankInCombatOrder: character.RankInCombatOrder (), IsPC: character.IsPC()})
                })
                array.unshift(new ParticipantModel({ Name: 'First to act', RankInCombatOrder: -1, IsPC: false }));

                return array;
                
            });

            self.CanAddNewEffect = ko.computed(function () {
                return self.SelectedTargets().length > 0 && self.NewTrackableEffect().Duration() && self.NewTrackableEffect().Duration() > 0 && self.NewTrackableEffect().Title();
            });
            self.CanGoToNextCharacter = ko.computed(function () {
                return self.Characters().length > 1;
            })
            self.CanAddNewCharacter = ko.computed(function () {
                return self.NewCharacter().Name() && self.NewCharacter().RankInCombatOrder() >= -1 && self.NewCharacter().RankInCombatOrder() < self.Characters().length;
            })
            
            self.CurrentCharacter = ko.computed(function () {
                return self.Characters()[self.CurrentCharacterIndex()];
            });
            self.IsCurrentCharacter = function (index) {
                return index() == self.CurrentCharacterIndex();
            }

            self.updateRankInCombatOrderAfterDrag = function(args) {
                //on vient de remonter dans la liste
                args.item.HasDelayedCurrentRound(true);
                for (var index = 0; index < self.Characters().length; index++) {
                    self.Characters()[index].RankInCombatOrder(index);
                }
                   
                if (args.sourceIndex === self.CurrentCharacterIndex() && args.targetIndex < args.sourceIndex) {
                    self.NextCharacter();
                }
                
                
            }
            self.SortCharactersByRankInCombatOrder = function () {
                
                self.Characters().sort(function (characterA, characterB) {
                    return characterA.RankInCombatOrder == characterB.RankInCombatOrder ? 0 : characterA.RankInCombatOrder > characterB.RankInCombatOrder ? 1 : -1;
                });
                self.Characters.valueHasMutated();
            }
            self.addCharacter = function () {
                var characterToAddRank = self.NewCharacter().RankInCombatOrder();
                var clonedCharacter = new ParticipantModel(ko.mapping.toJS(ko.unwrap(self.NewCharacter())));
                ko.utils.arrayForEach(self.Characters(), function (character) {
                    if (character.RankInCombatOrder() >= characterToAddRank) {
                        character.RankInCombatOrder(character.RankInCombatOrder() + 1);
                    }
                });
                self.Characters.splice(characterToAddRank, 0, clonedCharacter);
                if (self.CurrentCharacterIndex() >= characterToAddRank) {
                    self.CurrentCharacterIndex(self.CurrentCharacterIndex() + 1);
                }
                $('#addParticipantDialog').modal('hide');
            }
            self.addCharacterFromModel = function (rankInCombatOrder, model) {
                self.Characters.splice(rankInCombatOrder, 0, model);
            }
            self.NextCharacter = function () {
                //is it a new round?
                if (self.CurrentCharacterIndex() == self.Characters().length - 1) {
                    ko.utils.arrayForEach(self.Characters(), function (character) {
                        character.HasDelayedCurrentRound(false);
                    });
                    self.CurrentRound(self.CurrentRound() + 1);
                    toastr.success('new round!', 'Round ' + self.CurrentRound() + ' has just begun!', { positionClass: "toast-top-center" });
                    self.EventLog.push('--------- round ' + self.CurrentRound() + ' has just begun! ---------');
                } 

                self.CurrentCharacterIndex(self.CurrentCharacterIndex() == self.Characters().length - 1 ? 0 : self.CurrentCharacterIndex() + 1);
                
                self.Characters()[self.CurrentCharacterIndex()].HasReadiedCurrentRound(false);

                //adjust the duration of trackableEffects
                ko.utils.arrayForEach(self.Characters(), function (character) {
                    //clean up the duration
                    var effectsToClean = false;
                    ko.utils.arrayForEach(character.TrackableEffects(), function (effect) {
                        if (effect.RankInCombatOrder() == self.CurrentCharacterIndex()) {
                            effect.Duration(effect.Duration() - 1);
                            if (effect.Duration() <= 0) {
                                effectsToClean = true;
                            }
                        }
                    });
                    //ask the character model to flush his dead durations
                    if (effectsToClean) {
                        character.removeFinishedEffects();
                    }
                });

                //is the new current character out of combat?
                if (self.Characters()[self.CurrentCharacterIndex()].OutOfCombat()) {
                    self.NextCharacter();
                }
            }
            self.addTrackableEffect = function (effect, targets) {
                
                ko.utils.arrayForEach(targets(), function (target) {
                    var clonedEffect = new TrackableEffectModel(ko.mapping.toJS(ko.unwrap(effect)));
                    target.addEffect(clonedEffect);
                });

                $('#addTrackableEffectDialog').modal('hide');
            }

            self.showAddTrackableEffectDialog = function () {
                self.NewTrackableEffect(new TrackableEffectModel({ Title: '', Duration: 1, Description: '', RankInCombatOrder: self.CurrentCharacterIndex(), EffectType: constants.effectTypeBeneficial() }));
                self.SelectedTargets.removeAll();
                $('#addTrackableEffectDialog').modal()
            }

            self.showAddParticipantDialog = function () {
                self.NewCharacter(new ParticipantModel({ Name: '', RankInCombatOrder: -1, IsPC: false }));
                $('#addParticipantDialog').modal()
            }


            //returns the status of a character, wether he's the current player, has already acted, or is about to act;
            self.ActingStatus = function (index) {
                if (self.Characters() && self.Characters()[index()] && self.Characters()[index()].OutOfCombat()) {
                    return constants.ActingStatusOutOfCombat;
                }
                return self.CurrentCharacterIndex() > index() ? constants.ActingStatusAlreadyActed() : self.CurrentCharacterIndex() < index() ? constants.ActingStatusAboutToAct() : constants.ActingStatusCurrentlyActing();
            }
        }

        var viewModel = new FightModel()
        viewModel.addCharacterFromModel(0, new ParticipantModel({ OutOfCombat: false, Name: 'Jimmy', IsPC: true, RankInCombatOrder: 0, TrackableEffects: [] }));
        viewModel.addCharacterFromModel(1, new ParticipantModel({ OutOfCombat: false, Name: 'Johnny', IsPC: true, RankInCombatOrder: 1, TrackableEffects: [] }));
        viewModel.addCharacterFromModel(2, new ParticipantModel({ OutOfCombat: false, Name: 'Gerry', IsPC: true, RankInCombatOrder: 2, TrackableEffects: [] }));
        viewModel.addCharacterFromModel(3, new ParticipantModel({ OutOfCombat: false, Name: 'Goblins', IsPC: false, RankInCombatOrder: 3, TrackableEffects: [] }));
        viewModel.addCharacterFromModel(4, new ParticipantModel({ OutOfCombat: false, Name: 'Trolls', IsPC: false, RankInCombatOrder: 4, TrackableEffects: [] }));
        viewModel.addTrackableEffect(new TrackableEffectModel({ Title: "Barbarian's rage", Duration: 4, Description: '+2 on weapon damage rolls', RankInCombatOrder: 0, EffectType: 'Beneficial' }), viewModel.Characters)
        viewModel.addTrackableEffect(new TrackableEffectModel({ Title: "Alric's fear", Duration: 2, Description: '-2 on all rolls', RankInCombatOrder: 1, EffectType: 'harmful' }), viewModel.Characters)
        ko.applyBindings(viewModel);