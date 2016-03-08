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
            '$window',
            function($parse, $filter, $window) {
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

                        Object.byString = function(o, s) {
                            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
                            s = s.replace(/^\./, '');           // strip a leading dot
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
                        }

                        //get stored session value and check if exists
                        var _storedValue = $window.sessionStorage.getItem("filterSelect")
                        if(_storedValue){
                            //Show filtered data based on stored session value
                            $scope.storedValue = _storedValue;
                        }
                        else{
                            //Show all data
                            $scope.storedValue = "All";
                        }

                        var filterTable = function filterTable() {
                            //get data + config
                            $scope.data = $scope.$parent.$eval(attr.source);
                            var _config = $scope.$parent.$eval(attr.config);

                            if (_config.filterColumn){

                                //get the column name to filter on
                                var _allColumns = _config.columns;
                                var _selectedColumn = _allColumns.filter(function( obj ) {
                                    return obj.columnName == _config.filterColumn;
                                });
                                var _selectedColumnKey = _selectedColumn[0].key;
                                $scope.searchKey = _selectedColumnKey;

                                //populate all the column options in the select
                                $scope.options = [];
                                _.forEach($scope.data, function(obj){
                                    $scope.singleData = obj;
                                    $scope.singleString = Object.byString($scope.singleData, _selectedColumnKey);
                                    $scope.options.push($scope.singleString);
                                });
                                $scope.selectOptions = _.uniq($scope.options);
                                $scope.selectOptions.unshift("All");

                                //populate data with filtered results
                                if(_storedValue){
                                    $scope.tablesource = $scope.$parent.$eval(attr.source);
                                    if(_storedValue != 'All'){
                                        var _newData = [];
                                        _.forEach($scope.tablesource, function(rowObj){
                                            var _value = Object.byString(rowObj, _selectedColumnKey);
                                            if(_storedValue == _value){
                                                _newData.push(rowObj);
                                            }
                                        });
                                        $scope.tablesource = _newData;
                                    }
                                }

                                //on select change
                                $scope.$watch('tablestatus.select', function(nv, ov){
                                    //reset data
                                    $scope.tablesource = $scope.$parent.$eval(attr.source);
                                    if(nv){
                                        //store selection in sessionstorage
                                        $window.sessionStorage.setItem("filterSelect", nv);
                                        if(nv == "All"){
                                            $scope.tablesource = $scope.$parent.$eval(attr.source);
                                        }
                                        else{
                                            //populate data with filtered results
                                            var _newData = [];
                                            _.forEach($scope.tablesource, function(rowObj){
                                                var _value = Object.byString(rowObj, _selectedColumnKey);
                                                if(nv == _value){
                                                    _newData.push(rowObj);
                                                }
                                            });
                                            $scope.tablesource = _newData;
                                        }
                                    }
                                });
                            }
                        }

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
                            filterTable();
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
