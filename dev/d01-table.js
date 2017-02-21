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
                    scope: {
                        tablesource: '=source',
                        tableconfig: '=config',
                        onChange: '=',
                        currentPage: '='
                    },
                    link: function($scope, $el, attr) {

                        $scope.tablestatus = {
                            query: '',
                            select: [],
                            pages: 0,
                            activePage: 0,
                            itemsPerPage: 0,
                            sorting: {
                                direction: '-',
                                column: ''
                            },
                            filteredData: []
                        };

                        $scope.clickHeader = function clickHeader(col) {
                            if (col.sortable) {
                                var sort = angular.copy($scope.tablestatus.sorting);
                                if (sort.column === col.key) {
                                    sort.direction = (sort.direction === '-') ? '+' : '-';
                                } else {
                                    sort.column = col.key;
                                    sort.direction = '+';
                                }
                                $scope.tablestatus.sorting = sort;
                            }
                        };

                        $scope.pages = function pages(){
                            return new Array($scope.tablestatus.pages);
                        };

                        $scope.setPage = function setPage(page) {
                            $scope.tablestatus.activePage = page;

                            requestNewData(page);
                        };

                        $scope.prevPage = function prevPage() {
                            if($scope.tablestatus.activePage > 0){
                                $scope.tablestatus.activePage--;
                                requestNewData($scope.tablestatus.activePage);
                            }
                        };

                        $scope.nextPage = function nextPage(){
                            if($scope.tablestatus.activePage < $scope.tablestatus.pages - 1){
                                $scope.tablestatus.activePage++;
                                requestNewData($scope.tablestatus.activePage);
                            }
                        };

                        $scope.firstPage = function firstPage(){
                            if($scope.tablestatus.activePage > 0){
                                $scope.tablestatus.activePage = 0;
                                requestNewData($scope.tablestatus.activePage);
                            }
                        };

                        $scope.lastPage = function lastPage() {
                            if($scope.tablestatus.activePage < $scope.tablestatus.pages - 1){
                                $scope.tablestatus.activePage = $scope.tablestatus.pages - 1;
                                requestNewData($scope.tablestatus.activePage);
                            }
                        };

                        $scope.getStartItem = function getStartItem() {
                            if ($scope.tableconfig.pagination && !$scope.tableconfig.pagination.async) {
                                return $scope.tablestatus.itemsPerPage * $scope.tablestatus.activePage;
                            } else {
                                return 0;
                            }
                        };

                        $scope.getEnditem = function getEnditem() {
                            if ($scope.tableconfig.pagination) {
                                return $scope.getStartItem() + $scope.tablestatus.itemsPerPage;
                            } else {
                                return 10000;
                            }
                        };

                        $scope.selectFilter = function selectFilter(item) {
                            var isMatched = true;

                            _.forEach($scope.tableconfig.selects, function(slct, index) {
                                if(slct.filterKey) {
                                    if(
                                        $scope.tablestatus.select[index] &&
                                        fetchFromObject(item, slct.filterKey) !== $scope.tablestatus.select[index]
                                    ) {
                                        isMatched = false;
                                    }
                                }
                            });

                            return isMatched;
                        };

                        var fetchFromObject = function fetchFromObject(obj, prop) {
                            var result = obj;
                            var nestedProperties = prop.split('.');

                            _.forEach(nestedProperties, function(propName) {
                                result = result[propName];
                            });

                            return result;
                        };

                        var initializePagination = function initializePagination () {
                            var itemsAmount = $scope.tablestatus.filteredData.length;

                            $scope.tablestatus.itemsPerPage = $scope.tableconfig.pagination.itemsPerPage;

                            if($scope.tableconfig.pagination.async) {
                                itemsAmount = $scope.tableconfig.pagination.itemsLength;
                            }

                            $scope.tablestatus.pages = Math.ceil(itemsAmount / $scope.tablestatus.itemsPerPage);
                        };

                        var requestNewData = function requestNewData() {
                            if(!($scope.tableconfig.pagination && $scope.tableconfig.pagination.async && $scope.onChange)) {
                                return;
                            }

                            var requestObj = {
                                page: $scope.tablestatus.activePage,
                                start: null,
                                end: null,
                                sorting: $scope.tablestatus.sorting
                            };

                            requestObj.start = ($scope.tablestatus.itemsPerPage - 1) * $scope.tablestatus.activePage;
                            requestObj.end = requestObj.start + ($scope.tablestatus.itemsPerPage - 1);

                            $scope.onChange(requestObj);
                        };

                        var initialize = function initialize() {
                            $scope.parent = $scope.$parent;

                            $scope.tableconfig.filter = $scope.tableconfig.filter || {};
                            $scope.rowIdentifier = attr.rowIdentifier;

                            //set the default sorting
                            _.forEach($scope.tableconfig.columns, function(column) {
                                if (column.defaultSort) {
                                    $scope.tablestatus.sorting.column = column.key;
                                    $scope.tablestatus.sorting.direction = typeof column.defaultSort === 'string' ? column.defaultSort || '-' : $scope.tablestatus.sorting.direction;
                                }
                            });

                            if ($scope.tableconfig.pagination) {
                                initializePagination();
                            }
                        };

                        $scope.$on('setTablePage', function (config, p) {
                            $scope.setPage(parseInt(p));
                        });

                        $scope.$watch('currentPage', function(nv, ov) {
                            if (nv !== ov && nv < $scope.tablestatus.pages) {
                                $scope.tablestatus.activePage = nv;
                                requestNewData();
                            }
                        });

                        $scope.$watch('tablestatus.sorting', function(nv, ov) {
                            if (nv !== ov) {
                                requestNewData();
                            }
                        });

                        $scope.$watchGroup(['tablestatus.filteredData.length', 'tableconfig.pagination.itemsLength'], function (nv, ov) {
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
                                for (var i=1, path=path.split('.'), len=path.length; i<len; i++) {
                                    if (obj === null) {
                                        console.warn('%s could not be found in your source object', opath, baseObj);
                                        return;
                                    }
                                    obj = obj[path[i]];
                                }
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
