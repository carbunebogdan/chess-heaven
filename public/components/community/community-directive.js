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
		    socketService.socketOn('msg',(from)=>{
		    	console.log(from.source.msg);
		    })

		    scope.sendMsgToSocket=(sockId)=>{
		    	socketService.socketEmit('msg',{msg:'pleosc!',sockId:sockId});
		    }
        }
    }
}

communityDirective.$inject=['$rootScope','socketService','accService','$timeout'];
angular.module('berger').directive('communityDirective', communityDirective);
