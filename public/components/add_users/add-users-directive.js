const addUsers = (playerService) => {
    return {
        templateUrl: 'components/add_users/add-users.html',
        restrict: 'E',
        link: (scope) => {

        	// General properties
            scope.player = {
                name: '',
                email: '',
                club: '',
            };

        	// Adds a new player
        	scope.addPlayer = () => {
        		if( scope.player.name && scope.player.email ){

                    // What is a promise Pava? a a a?
                    playerService.addPlayer(scope.player).then(() => {
                        playerService.getPlayers().then((resp) => {
                        	
                            // Update players data
                            scope.contCtrl.players = resp.data;

                            // Reset player model
                            scope.player = {
                                name: '',
                                email: '',
                                club: ''
                            };

                            // Reset the form after success
                            scope.formModel.$setPristine();
                            scope.formModel.$setUntouched();
                        });
                    });
                }
        	}
        }
    };
};

addUsers.$inject = ['playerService'];

angular.module('berger').directive('addUsers', addUsers);

