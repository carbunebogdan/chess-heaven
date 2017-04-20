// Setting up routes
angular.module('berger')
    .config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {

        // States for my app
        $stateProvider
            .state('login',{
                url: '/login',
                controller: 'loginController',
                controllerAs: 'loginCtrl',
                template: '<login-directive></login-directive>'
            })
            .state('manager', {
                url: '/manager',
                controller: 'containerController',
                controllerAs: 'contCtrl',
                template: '<container-directive></container-directive>',
                resolve: {
                    playerRsp: ['playerService', (playerService) => {
                        return playerService.getPlayers().then((rsp) => {
                            return rsp;
                        }, (err) => {
                            return err;
                        });
                    }],
                    competitionRsp: ['competitionService', (competitionService) => {
                        return competitionService.getCompetition().then((rsp) => {
                            return rsp;
                        });
                    }],
                    gamesRsp: [() => {
                        return false;
                    }]

                }
            })
            .state('competition', {
                url: '/competition/:compId',
                controller: 'containerController',
                controllerAs: 'contCtrl',
                template: '<container-directive></container-directive>',
                resolve: {
                    playerRsp: ['playerService', (playerService) => {
                        return playerService.getPlayers().then((rsp) => {
                            return rsp;
                        });
                    }],
                    competitionRsp: ['competitionService', (competitionService) => {
                        return competitionService.getCompetition().then((rsp) => {
                            return rsp;
                        });
                    }],
                    gamesRsp: ['$stateParams', 'gameService', ($stateParams, gameService) => {
                        if ($stateParams.compId) {
                            return gameService.getGames($stateParams.compId).then((rsp) => {
                                return rsp;
                            });
                        }
                        return false;
                    }]
                    
                }
            });

        // For unmatched routes:
        $urlRouterProvider.otherwise('/login');
    }]);

//Setting HTML5 Location Mode
angular.module('berger')
    .config(['$locationProvider',
        function($locationProvider){
            $locationProvider.hashPrefix('!');
        }
    ]);