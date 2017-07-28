const clubDirective = (accService,$rootScope,localStorageService) => {
    return {
        templateUrl: 'components/club/club.html',
        restrict: 'E',
        link: (scope) => {
        	scope.club=null;
        	scope.getMembersLoading=true;
        	
            scope.updateClub=(club)=>{
            	scope.getClubLoading=true;
            	accService.updateClub({
            		username:$rootScope.account.username,
            		club:club
            	}).then((rsp)=>{
            		$rootScope.account=rsp.data;
            		localStorageService.set('account',$rootScope.account);
            		scope.getClubLoading=false;
            	})
            }
            var clubPlayers=()=>{
            	scope.getMembersLoading=true;
            	accService.getPlayersByClub($rootScope.account.club).then((rsp)=>{
            		scope.clubPpl=rsp.data;
            		for(i=0;i<scope.clubPpl.length;i++){
            			if(scope.clubPpl[i].username==$rootScope.account.username)
            				scope.clubPpl.splice(i,1);
            		}
					scope.getMembersLoading=false;
            	});
            	
            }
            if($rootScope.account.club){
            	clubPlayers();
            }
        }
    };
};

clubDirective.$inject = ['accService','$rootScope','localStorageService'];

angular.module('berger').directive('clubDirective', clubDirective);

