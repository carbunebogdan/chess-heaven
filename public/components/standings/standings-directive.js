const standingsComponent = ($uibModal) => {
    return {
        templateUrl: 'components/standings/standings.html',
        restrict: 'E',
        scope: {
        	games: '=',
        	players: '=',
            competitions: '=',
            competitionId: '=',
        },
        link: (scope) => {
            // Returns the current competition based on the current tab
            scope.returnCompetition = () => {
                return scope.competitions.filter((obj) => {
                    return obj._id === scope.competitionId;
                })[0]; 
            }

        	// Make the calculation here
        	scope.calculateStandings = () => {
                let stdObj = {};
                for (let i = 0; i < scope.games.length; i++) {
                    const obj = scope.games[i];
                    if(typeof stdObj[obj.p1_id] === 'undefined'){
                        stdObj[obj.p1_id] = {};
                        stdObj[obj.p1_id].rounds = {};
                        stdObj[obj.p1_id].score = 0;
                    }
                    if(typeof stdObj[obj.p2_id] === 'undefined'){
                        stdObj[obj.p2_id] = {};
                        stdObj[obj.p2_id].rounds = {};
                        stdObj[obj.p2_id].score = 0;
                    }

                    if( obj.status !== 0 ){
                        let p1GameScore = 0;
                        let p2GameScore = 0;
                        if (obj.status === 2) {
                            stdObj[obj.p1_id].score += .5;
                            stdObj[obj.p2_id].score += .5;
                            p1GameScore = .5;
                            p2GameScore = .5;
                        } else if (obj.status === 1) {
                            stdObj[obj.p1_id].score += 1;
                            p1GameScore = 1;
                        } else {
                            stdObj[obj.p2_id].score += 1;
                            p2GameScore = 1;
                        }
                        stdObj[obj.p1_id].rounds[obj.round] = p1GameScore + '' + ( obj.p1_color == 0 ? 'w':'b' );    
                        stdObj[obj.p2_id].rounds[obj.round] = p2GameScore + '' + ( obj.p2_color == 0 ? 'w':'b' );
                    }else{
                        stdObj[obj.p1_id].rounds[obj.round] = '-';
                        stdObj[obj.p2_id].rounds[obj.round] = '-';
                    }
                }

                const sorted = Object.keys(stdObj).sort((a,b) => {
                    return stdObj[b].score - stdObj[a].score;
                });

                const finalStats = {};
                for (let i = 0; i < sorted.length; i++) {
                    finalStats[sorted[i]] = stdObj[sorted[i]];
                }

                return finalStats;
        	}

        	// Open the modal that contains the stading table here
            scope.open =  () => {
			   	const modalInstance = $uibModal.open({
					templateUrl: 'standingsModal.html',
					controller: ($scope, $uibModalInstance) => {
                        // Calculate standings when we open modal
                        $scope.standings = scope.calculateStandings();

                        // Get the current competition details
                        $scope.competition = scope.returnCompetition();

                        // Create array for listing the rounds in the header of the stadings table
                        $scope.competitionRounds = new Array($scope.competition.rounds);
                        
                        // Returns the player by a specific id
                        $scope.getPlayerById = (id) => {
                            return scope.players.filter((obj) => {
                                return obj._id === id;
                            })[0]; 
                        }

                        // When we hit the ok button
				      	$scope.ok = () => {
					    	$uibModalInstance.close();
					  	};

                        // When we hit the cancel button
						$scope.cancel = () => {
							$uibModalInstance.dismiss('cancel');
						};
			      	}
			    });

			    modalInstance.result.then(() => {
                    // Manage when we hit the ok button
		      		console.log('oki doki')
			    }, () => {
                    // Manage when we hit the cancel button
		      		console.log('oki doki cancel doki');
			    });
		  	};
        }
    }
}

standingsComponent.$inject = ['$uibModal'];

angular.module('berger').directive('standings', standingsComponent);
