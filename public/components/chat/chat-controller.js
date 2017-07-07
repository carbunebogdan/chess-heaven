class chatController{
	constructor($location,$rootScope,localStorageService,socketService,accService){
		// Register socket
        socketService.registerSocket();

        if(!$rootScope.account){
            $rootScope.account=localStorageService.get('account');
        }


        if(!$rootScope.account){
            $location.path('/login'); 
        }

        $rootScope.actives=[];
        accService.getActive().then((rsp)=>{
                	$rootScope.actives=rsp.data;

                });
        
        // Watch for socket incoming data
            socketService.socketOn('account', () => {
                accService.getActive().then((rsp)=>{
                	$rootScope.actives=rsp.data;

                });

            });

        $rootScope.messages=[{
        	sender:'robo',
        	message:'Salut! Bine ai venit!'
        }]

        
        

	}
}

chatController.$inject=['$location','$rootScope','localStorageService','socketService','accService'];
angular.module('berger').controller('chatController', chatController);