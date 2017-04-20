const addCompetition = (competitionService, socketService) => {
	return {
		templateUrl: 'components/add_competition/add-competition.html',
		restrict: 'E',
		link: (scope) => {

			// General properties
            scope.competition = {
                name: '',
                players: []
            };

        	// Adds a new player
        	scope.addCompetition = () => {
        		if( scope.competition.name && scope.competition.players){
                    competitionService.addCompetition(scope.competition).then(() => {
                        competitionService.getCompetition().then((resp) => {

                            // Update competitions data
                            scope.contCtrl.competitions = resp.data;

                            // General properties
				            scope.competition = {
				                name: '',
				                players: []
				            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();

                            // Send to server an impulse that we've added the competition
                            socketService.socketEmit('newCompetition', 1);
                        });
                    });
                }
        	}
		}
	}
}

addCompetition.$inject = ['competitionService', 'socketService'];

angular.module('berger').directive('addCompetition', addCompetition);