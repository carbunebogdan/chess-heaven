const containerDirective = ($rootScope,accService,localStorageService,betService,socketService) => {
    return {
        templateUrl: 'components/container/container.html',
        restrict: 'E',
        link: (scope) => {
            scope.userMoney={
                user:'',
                ammount:0
            }

        	// Changes the view betweeen panels
            scope.changeSubView = (view) => {
                scope.contCtrl.subViewValue = view;
            }

            // Changes the view betweeen panels
        	scope.changeView = (view) => {
        		scope.contCtrl.viewValue = view;
        	}

            scope.updateMoney=()=>{
                scope.userMoney.user=$rootScope.account._id;
                accService.updateMoney(scope.userMoney).then((rsp)=>{
                    $rootScope.account.money=rsp.data.money;
                    localStorageService.set('account',$rootScope.account);
                    socketService.socketEmit('updateMoney', 1);

                })
                
            }

            scope.getMyBets=()=>{
                betService.getBetsForUser($rootScope.account._id).then((rsp)=>{
                    scope.myBets=rsp.data;
                })
            }

            scope.getMyBets();
            socketService.socketOn('newBet', (resp) => {
                scope.getMyBets();
            });
        }
    };
};

containerDirective.$inject = ['$rootScope','accService','localStorageService','betService','socketService'];

angular.module('berger').directive('containerDirective', containerDirective);

