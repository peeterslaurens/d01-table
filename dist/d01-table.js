!function(e){var t=e.module("d01-table",[]);t.filter("slice",function(){return function(e,t,n){return(e||[]).slice(t,n)}}),t.directive("d01Table",["$parse","$filter",function(e,t){return{templateUrl:"table.html",restrict:"AE",scope:!0,link:function(e,t,n){e.tablestatus={query:"",select:"",pages:0,activePage:0,itemsPerPage:0,sorting:{direction:"-",column:""},filteredData:[]},e.clickHeader=function(t){if(t.sortable){var n=e.tablestatus.sorting;n.column===t.key?n.direction="-"===n.direction?"+":"-":(n.column=t.key,n.direction="+")}},e.pages=function(){return new Array(e.tablestatus.pages)},e.setPage=function(t){e.tablestatus.activePage=t},e.getStartItem=function(){return e.tableconfig.pagination?e.tablestatus.itemsPerPage*e.tablestatus.activePage:0},e.getEnditem=function(){return e.tableconfig.pagination?e.getStartItem()+e.tablestatus.itemsPerPage:1e4};var a=function(){e.tablestatus.itemsPerPage=e.tableconfig.pagination.itemsPerPage,e.tablestatus.pages=Math.ceil(e.tablestatus.filteredData.length/e.tablestatus.itemsPerPage)},l=function(){e.tablesource=e.$parent.$eval(n.source),e.tableconfig=e.$parent.$eval(n.config),e.tableconfig.filter=e.tableconfig.filter||{},e.rowIdentifier=n.rowIdentifier,_.forEach(e.tableconfig.columns,function(t){t.defaultSort&&(e.tablestatus.sorting.column=t.key)}),e.tableconfig.pagination&&a()};e.$on("setTablePage",function(t,n){e.setPage(parseInt(n))}),e.$watch("tablestatus.filteredData.length",function(t,n){e.tableconfig.pagination&&a()}),l()}}}]).directive("d01Td",["$compile",function(e){return{templateUrl:"td.html",restrict:"A",scope:!1,transclude:!0,replace:!0,link:function(t,n,a){var l=t.$eval(a.config),i=t.$eval(a.source),s=function(e,t){e=e||window;var n=t,a=t.split(".");a=e[a[0]];for(var l=1,t=t.split("."),i=t.length;l<i;l++){if(null===a)return void console.warn("%s could not be found in your source object",n,e);a=a[t[l]]}return a},o=function(e,t,n){if(e&&t){var a='<span ng-bind="i.'+t;return n&&(a+=" | "+n),a+='"></span>'}return s(e,t)};if(l.template)n.append(l.template);else if(l.mode)switch(l.mode){case"date":moment?n.append(o(i,l.key,"date:'"+(l.dateFormat||"dd/MM/yy")+"'")):(console.warn("Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?"),n.append(o(i,l.key)));break;case"timeAgo":moment?n.append('<span am-time-ago="i.'+l.key+'"></span>'):(console.warn("Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?"),n.append(o(i,l.key)))}else n.append(o(i,l.key,l.filter));e(n.contents())(t)}}}])}(angular),angular.module("d01-table").run(["$templateCache",function(e){e.put("table.html",'<div class="d01-table-filter clearfix">\n    <div class="d01-table-filter-field" ng-if="tableconfig.searchField.enabled">\n        <label ng-bind="tableconfig.searchField.label"></label>\n        <input\n            type="text"\n            class="{{tableconfig.searchField.style.className}}"\n            placeholder="{{tableconfig.searchField.placeholder}}"\n            ng-model="tablestatus.query"\n            ng-class="{\n                \'col-9 first\': tableconfig.select.options && !tableconfig.searchField.style.override,\n                \'col-12\': !tableconfig.select.options && !tableconfig.searchField.style.override\n            }">\n    </div>\n    <div class="d01-table-filter-field" ng-if="tableconfig.select.options">\n        <label ng-bind="tableconfig.select.label"></label>\n        <select\n            class="{{tableconfig.select.style.className}}"\n            ng-model="tablestatus.select"\n            ng-options="option.value as option.name for option in tableconfig.select.options"\n            ng-class="{ \'col-3 last\': !tableconfig.select.style.override }"\n            >\n            <option value="" disabled="disabled">{{tableconfig.select.placeholder}}</option>\n        </select>\n    </div>\n</div>\n<table class="{{tableconfig.className}}">\n    <thead>\n        <th\n            ng-repeat="col in tableconfig.columns"\n            ng-click="clickHeader(col)"\n            ng-class="{ \'sortable\': col.sortable}"\n            class="{{\'field_\'+col.key + \' \'+ col.className}}"\n            >\n                {{col.columnName}} <i\n                    ng-if="col.sortable"\n                    class="fa"\n                    ng-class="{\n                        \'fa-angle-up\': tablestatus.sorting.column==col.key,\n                        \'fa-flip-vertical\': tablestatus.sorting.direction == \'-\' && tablestatus.sorting.column==col.key\n                    }"></i>\n            </th>\n    </thead>\n    <tbody>\n        <tr\n            ng-repeat="i in tablestatus.filteredData = (tablesource | filter:tablestatus.query | filter:tablestatus.select | orderBy:tablestatus.sorting.direction+tablestatus.sorting.column | filter:tableconfig.filter) | slice:getStartItem():getEnditem()"\n            ng-class-odd="\'odd\'"\n            ng-class-even="\'even\'"\n            class="{{(rowIdentifier) ? \'row_\'+i[rowIdentifier] : \'\'}}"\n            >\n                <td d01-td ng-repeat="col in tableconfig.columns" source="i" config="col"></td d01-td>\n        </tr>\n    </tbody>\n</table>\n<ul class="pagination" ng-if="tablestatus.pages > 1">\n    <li ng-repeat="page in pages() track by $index">\n        <a ng-class="{\'active\': $index == tablestatus.activePage}" ng-click="setPage($index)">{{$index + 1}}</a>\n    </li>\n</ul>\n'),e.put("td.html","<td class=\"{{'field_'+col.key+ ' ' + col.className}}\"></td>")}]);