const loginDirective = (accService,$rootScope,$location,localStorageService,$mdDialog) => {
    return {
        templateUrl: 'components/login/login.html',
        restrict: 'E',
        link: (scope) => {

            // Initiate variables
            scope.userSign={
                username:'',
                password:'',
                type:0,
                status:1
            }
            scope.userLogin={
                username:'',
                password:'',
                status:1
            }
            scope.insertedCode=null;
            var code=0;
            scope.codeReceived=false;
            scope.accounts=[];

            // END variables

            // Refresh latest accounts list
            scope.refreshAccs=()=>{
                accService.getLatestAccs().then((rsp) => {
                            scope.accounts=rsp.data;
                        }, (err) => {
                            return err;
                        });
            }
            
            // Get latest accounts
            scope.refreshAccs();

            // Login while checking if account is activated
            scope.login=()=>{
                    scope.loginLoading=true;
                    accService.login(scope.userLogin).then((rsp) => {
                        scope.loginLoading=false;
                        if(rsp.data){
                            if(rsp.data.usable==0){
                                scope.notActivated=true;
                                scope.account=rsp.data;
                            }else{
                                $rootScope.account=rsp.data;
                                scope.bad=false;
                                localStorageService.set('account',$rootScope.account);
                                localStorageService.set('loggedIn',true);
                                $location.path('/manager');
                            }
                        }else{
                            scope.bad=true;
                            return 0;
                        }


                    });
            }

            //Send 4-digit code
            scope.sendCode=()=>{
                scope.sendLoading=true;
                accService.sendCode(scope.account).then((rsp)=>{
                    scope.sendLoading=false;
                    scope.resent=true;
                    if(rsp.data){
                        code=rsp.data;
                    }
                })
            }

            // Proceed to dashboard
            scope.proceed=()=>{
                scope.procLoading=true;
                if(scope.userSign.username){
                    accService.login(scope.userSign).then((rsp) => {
                        scope.procLoading=false;
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
                }else{
                    accService.login(scope.userLogin).then((rsp) => {
                        scope.procLoading=false;
                        if(rsp.data){
                                $rootScope.account=rsp.data;
                                scope.bad=false;
                                localStorageService.set('account',rsp.data);
                                localStorageService.set('loggedIn',true);
                                $location.path('/manager');
                        }else{
                            scope.bad=true;
                        }
                    });
                }
            }

            // Go back to login
            scope.revertLogin=()=>{
                scope.notActivated=false;
                scope.account=null;
                scope.resent=false;
            }

            // Check 4-digit code
            scope.checkCode=(insCode)=>{
                scope.checkLoading=true;
                if(insCode==code){
                    accService.activateAcc(scope.userSign).then((rsp)=>{
                        scope.activated=true;
                        scope.checkLoading=false;
                    })
                }else{
                    scope.wrongCode=true;
                    scope.checkLoading=false;
                }
            }

            // Sign up and check verification 4-digit code
            scope.signup=()=>{
                scope.signLoading=true;
                    accService.createAcc(scope.userSign).then((rsp) => {
                        scope.signLoading=false;
                        scope.refreshAccs();
                        if(rsp.data=="bad"){
                            scope.badUser=true;
                        }else{
                            code=rsp.data;
                            scope.codeReceived=true;
                        }          
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

