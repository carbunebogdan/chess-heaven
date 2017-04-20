const loginDirective = (accService,$rootScope,$location,localStorageService,$mdDialog) => {
    return {
        templateUrl: 'components/login/login.html',
        restrict: 'E',
        link: (scope) => {
            scope.userSign={
                username:'',
                password:'',
                type:0
            }
            scope.userLogin={
                username:'',
                password:'',
                status:1
            }
            scope.accounts=[];
            scope.refreshAccs=()=>{
                accService.getLatestAccs().then((rsp) => {
                            scope.accounts=rsp.data;
                        }, (err) => {
                            return err;
                        });
            }
            
            scope.refreshAccs();
            scope.login=()=>{
                    scope.loginLoading=true;
                    accService.login(scope.userLogin).then((rsp) => {
                        scope.loginLoading=false;
                        if(rsp.data){
                            $rootScope.account=rsp.data;
                            scope.bad=false;
                            localStorageService.set('account',$rootScope.account);
                            localStorageService.set('loggedIn',true);
                            $location.path('/manager');
                        }else{
                            scope.bad=true;
                        }
                    });
            }

            scope.signup=()=>{
                scope.signLoading=true;
                    accService.createAcc(scope.userSign).then(() => {
                        scope.signLoading=false;
                        scope.refreshAccs();
                    });
                
            }

            scope.showForgot = function(ev) {
                $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Forgot your password?')
                    .textContent('Asta ete!')
                    .ok('Bine :(')
                    .targetEvent(ev)
            );
          };





        	
        }
    };
};

loginDirective.$inject = ['accService','$rootScope','$location','localStorageService','$mdDialog'];

angular.module('berger').directive('loginDirective', loginDirective);

