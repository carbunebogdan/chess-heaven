const communityDirective = ($rootScope, socketService, accService, $timeout) => {
    return {
        templateUrl: 'components/community/community.html',
        restrict: 'E',
        link: (scope) => {
        	var getPlayers=()=>{
        		scope.playerLoading=true;
				accService.getPlayers().then((rsp)=>{
						    	scope.players=rsp.data;
						    	sortByScore();
						    	scope.playerLoading=false;
						    	
						    });
				
        	}
        	var sortByScore=()=>{
		    	var aux=null;
		    	for(i=0;i<scope.players.length-1;i++)
		    		for(j=i;j<scope.players.length;j++){
		    		if((scope.players[i].wins-scope.players[i].loses)<(scope.players[j].wins-scope.players[j].loses)){
		    			aux=scope.players[i];
		    			scope.players[i]=scope.players[j];
		    			scope.players[j]=aux;
		    		}
		    	}
		    }
		    getPlayers();

		    

		    socketService.socketOn('updateList',(from)=>{
		    	var newPlayer=true;
		    	for(i=0;i<scope.players.length;i++){
		    		if(scope.players[i].username==from.source.user){
		    			newPlayer=false;
		    			scope.players[i].status=from.source.status;
		    			scope.players[i].wins=from.source.wins;
		    			scope.players[i].loses=from.source.loses;
		    			if(from.source.status==1 || from.source.status==2){
		    				 scope.players[i].sockId=from.source.sockId;
		    			}else{
		    				scope.players[i].sockId=null;
		    			}

		    		}
		    		if(scope.players[i].username==$rootScope.account.username){
		    			scope.players[i].wins=$rootScope.account.wins;
		    			scope.players[i].loses=$rootScope.account.loses;
		    		}
		    	}
		    	if(newPlayer){
		    		getPlayers();
		    	}else{
		    		scope.$apply();
		    	}
		    	sortByScore();
		    })


		    scope.challengePlayer=(sockId)=>{
		    	socketService.socketEmit('challenge',{
		    		p1:$rootScope.account.username,
		    		p1_id:$rootScope.account._id,
		    		sockId:sockId
		    	});
		    	$rootScope.challenged=true;
		    }

		    scope.$on('refreshPlayers',()=>{
		    	getPlayers();
		    	for(i=0;i<scope.players.length;i++){
		    		if(scope.players[i].username==$rootScope.account.username){
		    			scope.players[i].wins=$rootScope.account.wins;
		    			scope.players[i].loses=$rootScope.account.loses;
		    		}
		    	}
		    })
        }
    }
}

communityDirective.$inject=['$rootScope','socketService','accService','$timeout'];
angular.module('berger').directive('communityDirective', communityDirective);
