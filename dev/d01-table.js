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
            '$filter',
            function($parse, $filter) {
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
                            if ($scope.tableconfig.pagination) {
                                return $scope.tablestatus.itemsPerPage * $scope.tablestatus.activePage;
                            } else {
                                return 0;
                            }
                        }

                        $scope.getEnditem = function getEnditem() {
                            if ($scope.tableconfig.pagination) {
                                return $scope.getStartItem() + $scope.tablestatus.itemsPerPage;
                            } else {
                                return 10000;
                            }
                        }

                        var initializePagination = function initializePagination () {
                            $scope.tablestatus.itemsPerPage = $scope.tableconfig.pagination.itemsPerPage;
                            $scope.tablestatus.pages = Math.ceil(($filter('filter')($scope.tablesource, $scope.tableconfig.filter)).length / $scope.tablestatus.itemsPerPage);
                        };

                        var initialize = function initialize() {
                            $scope.tablesource = $scope.$parent.$eval(attr.source);
                            $scope.tableconfig = $scope.$parent.$eval(attr.config);
                            $scope.tableconfig.filter = $scope.tableconfig.filter || {}
                            $scope.rowIdentifier = attr.rowIdentifier;
                            //set the default sorting
                            _.forEach($scope.tableconfig.columns, function(column) {
                                if (column.defaultsort) {
                                    $scope.tablestatus.sorting.column = column.key;
                                }
                            });

                            if ($scope.tableconfig.pagination) {
                                initializePagination();
                            }
                        }

                        $scope.$on('setTablePage', function (config, p) {
                            $scope.setPage(parseInt(p));
                        });

                        $scope.$watch('tablesource.length', function (nv, ov) {
                            if ($scope.tableconfig.pagination) {
                                initializePagination();
                            }
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
                            byString = function(baseObj, path){
                                baseObj = baseObj || window;
                                var opath = path,
                                    obj = path.split('.');
                                obj = baseObj[obj[0]];
                                for (var i=1, path=path.split('.'), len=path.length; i<len; i++){
                                    if (obj === null) {
                                        console.warn('%s could not be found in your source object', opath, baseObj);
                                        return;
                                    };
                                    obj = obj[path[i]];
                                };
                                return obj;
                            },
                            byStringV2 = function(baseObj, path, filter){
                                /*
                                    TODO: check of this path exists
                                */
                                if(baseObj && path) {
                                    var span = '<span ng-bind="i.' + path;
                                    if(filter) {
                                        span += ' | ' + filter;
                                    }
                                    span += '"></span>'
                                    return span;
                                } else {
                                    return byString(baseObj, path);
                            	}
                            }

                        if (col.template) {
                            $el.append(col.template);
                        } else if (col.mode) {
                            switch(col.mode) {
                                case 'date':
                                    /*
                                        TODO: fix this
                                    */
                                    if (moment) {
                                        $el.append(byStringV2(item, col.key, 'date:\'' + (col.dateFormat || 'dd/MM/yy') + '\''));
                                    } else {
                                        /*
                                            TODO: check for ng-moment iso just moment
                                        */
                                        console.warn('Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?');
                                        $el.append(byStringV2(item, col.key));
                                    }
                                    break;
                                case 'timeAgo':
                                    if (moment) {
                                        $el.append('<span am-time-ago="i.' + col.key + '"></span>');
                                    } else {
                                        console.warn('Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?');
                                        $el.append(byStringV2(item, col.key));
                                    }
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            $el.append(byStringV2(item, col.key, col.filter));
                        }
                        $compile($el.contents())($scope);
                    }
                };
            }
        ]);

}(angular));