const myaccNavbar = ($window,$rootScope,accService,localStorageService,$location,socketService) => {
    return {
        templateUrl: 'components/myacc_navbar/myacc-navbar.html',
        restrict: 'E',
        link: (scope) => {
            
            scope.account=$rootScope.account;

            scope.logout=()=>{
                scope.logoutLoading=true;
                scope.account.status=0;
                    accService.login(scope.account).then((rsp) => {
                        scope.logoutLoading=false;
                        if(rsp.data){
                            if($rootScope.account.type==2)
                                socketService.socketEmit('updateList',{user:$rootScope.account.username,status:0});
                            $rootScope.account=null;
                            localStorageService.clearAll();
                            $location.path('/login');
                        }else{
                            //something..
                        }
                    });
            }



            socketService.socketOn('newBet', (resp) => {
                scope.userRefresh={
                    username:scope.account.username,
                    password:scope.account.password,
                    status:1
                }
                accService.login(scope.userRefresh).then((resp) => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account',$rootScope.account);
                    scope.account=$rootScope.account;
                    });
            });

            socketService.socketOn('updateMoney', (resp) => {
                scope.userRefresh={
                    username:scope.account.username,
                    password:scope.account.password,
                    status:1
                }
                accService.login(scope.userRefresh).then((resp) => {
                    $rootScope.account = resp.data;
                    localStorageService.set('account',$rootScope.account);
                    scope.account=$rootScope.account;
                    });
            });
            
        }
}
};

myaccNavbar.$inject = ['$window','$rootScope','accService','localStorageService','$location','socketService'];

angular.module('berger').directive('myaccNavbar', myaccNavbar);

