const communityDirective = ($rootScope, socketService, accService, $timeout) => {
    return {
        templateUrl: 'components/community/community.html',
        restrict: 'E',
        link: (scope) => {
        	var getPlayers=()=>{
        		scope.playerLoading=true;
				accService.getPlayers({username:$rootScope.account.username}).then((rsp)=>{
						    	scope.players=rsp.data;
						    	scope.playerLoading=false;
						    	
						    });
        	}
		    getPlayers();

		    socketService.socketOn('updateList',(from)=>{
		    	
		    	for(i=0;i<scope.players.length;i++){
		    		if(scope.players[i].username==from.source.user){
		    			scope.players[i].status=from.source.status;
		    			if(from.source.status==1 || from.source.status==2){
		    				 scope.players[i].sockId=from.source.sockId;
		    			}else{
		    				scope.players[i].sockId=null;
		    			}
		    		}
		    	}
		    	scope.$apply();
		    })


		    scope.challengePlayer=(sockId)=>{
		    	socketService.socketEmit('challenge',{
		    		p1:$rootScope.account.username,
		    		p1_id:$rootScope.account._id,
		    		sockId:sockId
		    	});
		    }

		    scope.$on('refreshPlayers',()=>{
		    	getPlayers();
		    })
        }
    }
}

communityDirective.$inject=['$rootScope','socketService','accService','$timeout'];
angular.module('berger').directive('communityDirective', communityDirective);
