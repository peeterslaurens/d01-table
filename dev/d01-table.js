(function (angular) {
    var d01Table = angular.module('d01-table', []);

    d01Table.filter('slice', function() {
        return function(arr, start, end) {
            return (arr || []).slice(start, end);
        };
    });

    d01Table
        .directive('d01Table', [
            '$parse',
            function($parse) {
                return {

                    templateUrl: 'table.html',
                    restrict: 'AE',
                    scope: true,
                    link: function($scope, $el, attr) {

                        $scope.tablestatus = {
                            query: '',
                            select: '',
                            pages: 0,
                            activePage: 0,
                            itemsPerPage: 0,
                            sorting: {
                                direction: '-',
                                column: ''
                            }
                        };

                        $scope.clickHeader = function clickHeader(col) {
                            if (col.sortable) {
                                var sort = $scope.tablestatus.sorting;
                                if (sort.column === col.key) {
                                    sort.direction = (sort.direction === '-') ? '+' : '-';
                                } else {
                                    sort.column = col.key;
                                    sort.direction = '+';
                                }
                            }
                        };


                        //PAGINATION
                        $scope.pages = function pages() {
                            return new Array($scope.tablestatus.pages);
                        };

                        $scope.setPage = function setPage(page) {
                            $scope.tablestatus.activePage = page;
                        }

                        $scope.getStartItem = function getStartItem() {
                            return $scope.tablestatus.itemsPerPage * $scope.tablestatus.activePage;
                        }

                        $scope.getEnditem = function getEnditem() {
                            return $scope.getStartItem() + $scope.tablestatus.itemsPerPage;
                        }

                        var initializePagination = function initializePagination () {
                            $scope.tablestatus.itemsPerPage = $scope.tableconfig.itemsPerPage;
                            $scope.tablestatus.pages = Math.ceil($scope.tablesource.length / $scope.tableconfig.itemsPerPage);
                        };

                        var initialize = function initialize() {
                            $scope.tablesource = $scope.$parent.$eval(attr.source);
                            $scope.tableconfig = $scope.$parent.$eval(attr.config);
                            $scope.rowIdentifier = attr.rowIdentifier;
                            //set the default sorting
                            _.forEach($scope.tableconfig.columns, function(column) {
                                if (column.defaultsort) {
                                    $scope.tablestatus.sorting.column = column.key;
                                }
                            });

                            initializePagination();
                        }

                        $scope.$on('setTablePage', function (config, p) {
                            $scope.setPage(parseInt(p));
                        });

                        $scope.$watch('tablesource.length', function (nv, ov) {
                            initializePagination();
                        });

                        initialize();
                    }
                };
            }
        ])

        .directive('d01Td', [
            '$compile',
            function($compile) {
                return {

                    templateUrl: 'td.html',
                    restrict: 'A',
                    scope: false,
                    transclude: true,
                    replace: true,
                    link: function($scope, $el, attr) {
                        var col = $scope.$eval(attr.config),
                            item = $scope.$eval(attr.source),
                            byString = function(o, s) {
                                s = s.replace(/\[(\w+)\]/g, '.$1');
                                s = s.replace(/^\./, '');
                                var a = s.split('.');
                                for (var i = 0, n = a.length; i < n; ++i) {
                                    var k = a[i];
                                    if (k in o) {
                                        o = o[k];
                                    } else {
                                        return;
                                    }
                                }
                                return o;
                            };

                        if (col.template) {
                            $el.append(col.template);
                        } else if (col.mode) {
                            switch(col.mode) {
                                case 'date':
                                    if (moment) {
                                        $el.append(moment(byString(item, col.key)).format(col.dateFormat || 'DD/MM/YY'));
                                    } else {
                                        console.warn('Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?');
                                        $el.append(byString(item, col.key));
                                    }
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            $el.append(byString(item, col.key));
                        }
                        $compile($el.contents())($scope);
                    }
                };
            }
        ]);

}(angular));