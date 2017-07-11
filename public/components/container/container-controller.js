class containerController{
    constructor($state, playerRsp, competitionRsp, gamesRsp, socketService, competitionService,$location,localStorageService,$rootScope,accService) {
        if(!$rootScope.account)
            $rootScope.account=localStorageService.get('account');
       
        
        if(!$rootScope.account)
            $location.path('/login');                              
        


    	// Shared properties throughout the application
        this.players = playerRsp.data;
        this.userHeaders = ['Name', 'Email', 'Club', 'Date'];
        this.userKeys = ['name', 'email', 'club', 'date'];

        this.competitions = competitionRsp.data;
        this.competitionHeaders = ['Name', 'Current Round', 'Total Rounds', 'Status', 'Date'];
        this.competitionKeys = ['name', 'current_round', 'rounds', 'status', 'date'];

        this.games = gamesRsp.data;
        this.gamesFilter = gamesRsp.data;

        // Set the current view based on what we loaded
        this.viewValue = $state.current.name;
        if($rootScope.account.type==0){
            this.subViewValue = 'player';
        }else{
            this.subViewValue = 'myacc';
        }
        


        if ($state.params && $state.params.compId) {
            this.currentCompId = $state.params.compId;
        }

        // Register socket
        socketService.registerSocket();

        // Send message to update players list if connected account is a player
        if($rootScope.account.type==2){
            accService.getPlayerById({id:$rootScope.account._id}).then((rsp)=>{
                
                if(rsp.data[0].status==2){
                    $rootScope.account=rsp.data[0];
                    socketService.socketEmit('I was in a game',{
                        id:$rootScope.account._id
                    })
                    this.ingame=true;
                    this.viewValue = 'game';
                    socketService.socketEmit('updateList',{user:$rootScope.account.username, status:2});
                }else{
                    socketService.socketEmit('updateList',{user:$rootScope.account.username, status:1});
                }
            })
        }

        


        // Watch for socket incoming data
        socketService.socketOn('newCompetition', (resp) => {
            competitionService.getCompetition().then((resp) => {
                this.competitions = resp.data;
            });
        });




    }



}

containerController.$inject = ['$state', 'playerRsp', 'competitionRsp', 'gamesRsp', 'socketService', 'competitionService','$location','localStorageService','$rootScope','accService'];

angular.module('berger').controller('containerController', containerController);
