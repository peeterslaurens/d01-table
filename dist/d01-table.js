!function(e){var t=e.module("d01-table",[]);t.filter("slice",function(){return function(e,t,a){return(e||[]).slice(t,a)}}),t.directive("d01Table",["$parse","$filter","$window",function(e,t,a){return{templateUrl:"table.html",restrict:"AE",scope:!0,link:function(e,n,l){e.tablestatus={query:"",select:"",pages:0,activePage:0,itemsPerPage:0,sorting:{direction:"-",column:""}},e.clickHeader=function(t){if(t.sortable){var a=e.tablestatus.sorting;a.column===t.key?a.direction="-"===a.direction?"+":"-":(a.column=t.key,a.direction="+")}},Object.byString=function(e,t){t=t.replace(/\[(\w+)\]/g,".$1"),t=t.replace(/^\./,"");for(var a=t.split("."),n=0,l=a.length;l>n;++n){var i=a[n];if(!(i in e))return;e=e[i]}return e};var i=a.sessionStorage.getItem("filterSelect");i?e.storedValue=i:e.storedValue="All";var s=function(){e.data=e.$parent.$eval(l.source);var t=e.$parent.$eval(l.config);if(t.filterColumn){var n=t.columns,s=n.filter(function(e){return e.columnName==t.filterColumn}),o=s[0].key;if(e.searchKey=o,e.options=[],_.forEach(e.data,function(t){e.singleData=t,e.singleString=Object.byString(e.singleData,o),e.options.push(e.singleString)}),e.selectOptions=_.uniq(e.options),e.selectOptions.unshift("All"),i&&(e.tablesource=e.$parent.$eval(l.source),"All"!=i)){var r=[];_.forEach(e.tablesource,function(e){var t=Object.byString(e,o);i==t&&r.push(e)}),e.tablesource=r}e.$watch("tablestatus.select",function(t,n){if(e.tablesource=e.$parent.$eval(l.source),t)if(a.sessionStorage.setItem("filterSelect",t),"All"==t)e.tablesource=e.$parent.$eval(l.source);else{var i=[];_.forEach(e.tablesource,function(e){var a=Object.byString(e,o);t==a&&i.push(e)}),e.tablesource=i}})}};e.pages=function(){return new Array(e.tablestatus.pages)},e.setPage=function(t){e.tablestatus.activePage=t},e.getStartItem=function(){return e.tableconfig.pagination?e.tablestatus.itemsPerPage*e.tablestatus.activePage:0},e.getEnditem=function(){return e.tableconfig.pagination?e.getStartItem()+e.tablestatus.itemsPerPage:1e4};var o=function(){e.tablestatus.itemsPerPage=e.tableconfig.pagination.itemsPerPage,e.tablestatus.pages=Math.ceil(t("filter")(e.tablesource,e.tableconfig.filter).length/e.tablestatus.itemsPerPage)},r=function(){e.tablesource=e.$parent.$eval(l.source),s(),e.tableconfig=e.$parent.$eval(l.config),e.tableconfig.filter=e.tableconfig.filter||{},e.rowIdentifier=l.rowIdentifier,_.forEach(e.tableconfig.columns,function(t){t.defaultsort&&(e.tablestatus.sorting.column=t.key)}),e.tableconfig.pagination&&o()};e.$on("setTablePage",function(t,a){e.setPage(parseInt(a))}),e.$watch("tablesource.length",function(t,a){e.tableconfig.pagination&&o()}),r()}}}]).directive("d01Td",["$compile",function(e){return{templateUrl:"td.html",restrict:"A",scope:!1,transclude:!0,replace:!0,link:function(t,a,n){var l=t.$eval(n.config),i=t.$eval(n.source),s=function(e,t){e=e||window;var a=t,n=t.split(".");n=e[n[0]];for(var l=1,t=t.split("."),i=t.length;i>l;l++){if(null===n)return void console.warn("%s could not be found in your source object",a,e);n=n[t[l]]}return n},o=function(e,t,a){if(e&&t){var n='<span ng-bind="i.'+t;return a&&(n+=" | "+a),n+='"></span>'}return s(e,t)};if(l.template)a.append(l.template);else if(l.mode)switch(l.mode){case"date":moment?a.append(o(i,l.key,"date:'"+(l.dateFormat||"dd/MM/yy")+"'")):(console.warn("Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?"),a.append(o(i,l.key)));break;case"timeAgo":moment?a.append('<span am-time-ago="i.'+l.key+'"></span>'):(console.warn("Date-mode was set, but moment.js is not availabe. Did you forget to include it in your app?"),a.append(o(i,l.key)))}else a.append(o(i,l.key,l.filter));e(a.contents())(t)}}}])}(angular),angular.module("d01-table").run(["$templateCache",function(e){e.put("table.html",'<div class="clearfix">\n    <input type="text" ng-model="tablestatus.query" ng-if="tableconfig.searchField" placeholder="{{tableconfig.placeholder}}" ng-class="tableconfig.select.options ? \'col-9 first\':\'col-12\'">\n    <select ng-if="selectOptions" ng-init="tablestatus.select = storedValue" class="col-3 last" ng-model="tablestatus.select" ng-options="option as option for option in selectOptions">\n    </select>\n</div>\n<table class="{{tableconfig.className}}">\n    <thead>\n        <th ng-repeat="col in tableconfig.columns" ng-click="clickHeader(col)" ng-class="{ \'sortable\': col.sortable}" class="{{\'field_\'+col.key + \' \'+ col.className}}">{{col.columnName}} <i ng-if="col.sortable" class="fa" ng-class="{\n            \'fa-angle-up\': tablestatus.sorting.column==col.key,\n            \'fa-flip-vertical\': tablestatus.sorting.direction == \'-\' && tablestatus.sorting.column==col.key\n        }"></i></th>\n    </thead>\n    <tbody>\n        <tr ng-repeat="i in tablesource|filter:tablestatus.query|filter:tablestatus.select|orderBy:tablestatus.sorting.direction+tablestatus.sorting.column|filter:tableconfig.filter|slice:getStartItem():getEnditem()" ng-class-odd="\'odd\'" ng-class-even="\'even\'" class="{{(rowIdentifier) ? \'row_\'+i[rowIdentifier] : \'\'}}">\n            <td d01-td ng-repeat="col in tableconfig.columns" source="i" config="col"></td d01-td>\n        </tr>\n    </tbody>\n</table>\n<ul class="pagination" ng-if="tablestatus.pages > 1">\n    <li ng-repeat="page in pages() track by $index">\n        <a ng-class="{\'active\': $index == tablestatus.activePage}" ng-click="setPage($index)">{{$index + 1}}</a>\n    </li>\n</ul>\n'),e.put("td.html","<td class=\"{{'field_'+col.key+ ' ' + col.className}}\"></td>")}]);