class containerController {
    constructor($state, playerRsp, competitionRsp, gamesRsp, socketService, competitionService, $location, localStorageService, $rootScope, accService) {
        if (!$rootScope.account)
            $rootScope.account = localStorageService.get('account');


        if (!$rootScope.account)
            $location.path('/login');

        if($rootScope.account.type==2){
            accService.getAccData($rootScope.account.username).then((rsp)=>{
                if(rsp.data){
                    $rootScope.account.wins=rsp.data.wins;
                    $rootScope.account.loses=rsp.data.loses;
                }
            });
        }

        // Shared properties throughout the application
        this.players = playerRsp.data;
        this.userHeaders = ['Name', 'Email', 'Club', 'Date'];
        this.userKeys = ['name', 'email', 'club', 'date'];

        this.competitions = competitionRsp.data;
        for (var i = 0; i < this.competitions.length; i++) {
            var r = Math.random();
            if (this.competitions[i].status == 0) {
                this.competitions[i].color = '#64ef82';
            } else {
                this.competitions[i].color = '#ff706b';
            }
            if (r < 0.8) {
                this.competitions[i].colspan = 2;
            } else if (r < 0.9) {
                this.competitions[i].colspan = 3;
            } else {
                this.competitions[i].colspan = 4;
            }
            r = Math.random();
            if (r < 0.8) {
                this.competitions[i].rowspan = 2;
            } else if (r < 0.9) {
                this.competitions[i].rowspan = 3;
            } else {
                this.competitions[i].rowspan = 4;
            }
        }
        this.competitionHeaders = ['Name', 'Current Round', 'Total Rounds', 'Status', 'Date'];
        this.competitionKeys = ['name', 'current_round', 'rounds', 'status', 'date'];

        this.games = gamesRsp.data;
        this.gamesFilter = gamesRsp.data;

        // Set the current view based on what we loaded
        this.viewValue = $state.current.name;
        if ($rootScope.account.type == 0) {
            this.subViewValue = 'player';
        } else {
            this.subViewValue = 'myacc';
        }



        if ($state.params && $state.params.compId) {
            this.currentCompId = $state.params.compId;
            this.viewValue = 'competitions';
        }

        // Register socket
        socketService.registerSocket();

        // Send message to update players list if connected account is a player
        if ($rootScope.account.type == 2) {
            accService.getPlayerById({ id: $rootScope.account._id }).then((rsp) => {

                if (rsp.data[0].status == 2) {
                    $rootScope.account = rsp.data[0];
                    socketService.socketEmit('I was in a game', {
                        id: $rootScope.account._id
                    })
                    this.ingame = true;
                    this.viewValue = 'game';
                    socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 2, wins:$rootScope.account.wins, loses:$rootScope.account.loses });
                } else {
                    socketService.socketEmit('updateList', { user: $rootScope.account.username, status: 1, wins:$rootScope.account.wins, loses:$rootScope.account.loses });
                }
            })
        }




        // Watch for socket incoming data
        socketService.socketOn('newCompetition', (resp) => {
            competitionService.getCompetition().then((resp) => {
                this.competitions = resp.data;
                for (var i = 0; i < this.competitions.length; i++) {
                    var r = Math.random();
                    if (this.competitions[i].status == 0) {
                        this.competitions[i].color = '#64ef82';
                    } else {
                        this.competitions[i].color = '#ff706b';
                    }
                    if (r < 0.8) {
                        this.competitions[i].colspan = 2;
                    } else if (r < 0.9) {
                        this.competitions[i].colspan = 3;
                    } else {
                        this.competitions[i].colspan = 4;
                    }
                    r = Math.random();
                    if (r < 0.8) {
                        this.competitions[i].rowspan = 2;
                    } else if (r < 0.9) {
                        this.competitions[i].rowspan = 3;
                    } else {
                        this.competitions[i].rowspan = 4;
                    }
                }
            });
        });




    }



}

containerController.$inject = ['$state', 'playerRsp', 'competitionRsp', 'gamesRsp', 'socketService', 'competitionService', '$location', 'localStorageService', '$rootScope', 'accService'];

angular.module('berger').controller('containerController', containerController);