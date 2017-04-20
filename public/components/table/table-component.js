const tableComponent = () => {
    return {
        templateUrl: 'components/table/table-component.html',
        restrict: 'E',
        scope: {
            tableTitle: '@',
            tableHeaders: '=',
            tableKeys: '=',
            tableBody: '=',
        },
        link: (scope) => {}
    };
};

tableComponent.$inject = [];

angular.module('berger').directive('tableComponent', tableComponent);

