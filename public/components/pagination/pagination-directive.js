const paginationComponent = ($rootScope, competitionService) => {
    return {
        templateUrl: 'components/pagination/pagination.html',
        restrict: 'E',
        scope: {
            competitions: '=',
            competitionId: '=',
            allGames: '=',
            filteredGames: '='
        },
        link: (scope) => {
            // Get the current competition
            scope.competition = scope.competitions.filter((obj) => {
                return obj._id === scope.competitionId;
            })[0];

            // Create array for listing the rounds in the header of the stadings table
            if(scope.competition)
            scope.competitionRounds = new Array(scope.competition.rounds);
       
            // Returns another result set of games
            scope.getNewGameSet = (round) => {
                scope.filteredGames = scope.allGames.filter((obj) => {
                    return obj.round === round;
                });

            }
            if(scope.competition)
            scope.getNewGameSet(scope.competition.current_round);

            $rootScope.$on('gameFinished', () => {
                competitionService.getCompetition().then((rsp) => {
                    scope.competitions = rsp.data;
                    // Get the current competition
                    scope.competition = scope.competitions.filter((obj) => {
                        return obj._id === scope.competitionId;
                    })[0];
                    if(scope.competition)
                    scope.getNewGameSet(scope.competition.current_round);
                });
            });
        }
    }
}

paginationComponent.$inject = ['$rootScope', 'competitionService'];

angular.module('berger').directive('pagination', paginationComponent);
