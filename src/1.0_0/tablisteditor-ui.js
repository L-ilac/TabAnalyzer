;(function (m) {
    'use strict';

    chrome.storage.local.get(function (storage) { // storage = 로컬에 저장된 모든 데이터

        var tabs = {}, // to-be module
            tabGroups = storage.tabGroups || [], // tab groups
            opts = storage.options || {
                closeTabsOpt: 'no',
				deleteTabOnOpen: 'no',
				displayUrls: 'no',
				orderUrls: 'no'
            };

        function saveTabGroups(json) { //탭그룹을 받아서 storage에 저장
            chrome.storage.local.set({ tabGroups: json });
        }

        // model entity
        // 'data' is meant to be a tab group object from localStorage
        tabs.TabGroup = function (data) {
            this.dateG = m.prop(data.dateG); // 각 탭그룹의 id
            this.id = m.prop(data.id); // 각 탭그룹의 id
            this.name = m.prop(data.name.slice(1)); //각 탭그룹 명
            this.outerName = m.prop(data.name[0]); //바깥 탭그룹 명(P,C,O)
			if (opts.orderUrls === 'yes') { //URL정렬 옵션이 켜져있을떄, url기준으로 정렬함
            this.tabs = m.prop(data.tabs.sort( function(row1, row2) {
					var k1 = row1["url"], k2 = row2["url"];
					//그룹 안에 있는 URL들을 정렬하는 규칙
					return (k1 > k2) ? 1 : ( (k2 > k1) ? -1 : 0 );
				} ));
			}
			else
				this.tabs = m.prop(data.tabs);
        };

        // alias for Array
        tabs.TabGroupsList = Array;

        // view-model
        function create_vm() { //vm = 메인 페이지에 보여지는 각각의 탭그룹
            var vm = {};
            vm.init = function (outer_name) {
                // list of tab groups
                vm.list = new tabs.TabGroupsList();

                vm.name = outer_name;

                vm.rmGroup = function (i) { //i번째 탭그룹을 삭제하는 함수
                    // vm.list 에서 i번째 데이터를 제거함
                    vm.list.splice(i, 1);
                    // tabGroups에서 i번쨰 데이터를 제거함
                    tabGroups.splice(i, 1)
                    // 제거 완료된 데이터 저장소에 덮어쓰기
                    saveTabGroups(tabGroups);
                };

                vm.rmTab = function (i, ii) { // i번쨰 탭그룹에 있는 ii번 탭을 삭제하는 함수
                    // remove from view array
					// 이게 왜 없어도 됨?
                    //vm.list[i].tabs().splice(ii, 1);
                    // i번째 탭그룹에서 ii번 탭 제거
                    tabGroups[i].tabs.splice(ii, 1);
                    // 제거 완료된 데이터 저장소에 덮어쓰기
                    saveTabGroups(tabGroups);
                };
            };
            return vm;
        };
		
		
		tabs.vm = new create_vm();
		
        tabs.controller = function () { //메인페이지 켜질때 실행되는 함수(아마도)
            var i;
            tabs.vm.init('test');

			/*var tabs_filtered = [];
			for (var i=0; i < tabsArr.length; i++) {
				//if( highlighted_tab_only && !tabsArr[i].highlighted ) continue;
				tabs_filtered.push(tabsArr[i]);
				alert(tabsArr[i].url)
			}
			tabsArr = tabs_filtered;

        tabsArr.sort( function(row1, row2) {
					var k1 = row1["url"], k2 = row2["url"];
					return (k1 > k2) ? 1 : ( (k2 > k1) ? -1 : 0 );
				} );*/

			//이거 주석처리하면 스토리지에서 데이터 불러와도 메인페이지에 보이지가 않음
            for (i = 0; i < tabGroups.length; i += 1) {
                tabs.vm.list.push(new tabs.TabGroup(tabGroups[i]));
				
        };

        tabs.view = function () {
			var style = { fontSize: '40px' }
            if (tabs.vm.list.length === 0) {
                return m('p', {style : style} ,'저장된 탭이 없습니다.');
            }

            // foreach tab group
			var something = [tabs.vm];
			return something.map(function(tabvm,i){
				return m('div.outergroup',[
							m('div.group-name',tabvm.name),
							tabvm.list.map(function(group, i){
					return m('div.group', [
							m('div.group-title', [
								m('span.delete-link', { onclick: function () {
									tabs.vm.rmGroup(i);
								} }),

								m('span.group-amount', group.tabs().length + ' Tabs'),
								' ',
								m('span.restore-all', { onclick: function () {              //모든 탭 open all
									var i;
									// reason this goes before opening the tabs and not
									// after is because it doesn't work otherwise
									// I imagine it's because you changed tab and so
									// that messes with the focus of the JS somehow...
									if (opts.deleteTabOnOpen === 'yes') {
										tabs.vm.rmGroup(i);
									}
									for (i = 0; i < group.tabs().length; i += 1) {
										chrome.tabs.create({
											url: group.tabs()[i].url,
											pinned: group.tabs()[i].pinned
										});
									}
								} }, 'Open All'),
								m('div.group-name',group.name()),//group.tabs().keyword 키워드는 한줄 띄워서 가운데에 배치
								' ',
							]),

							// foreach tab
							//var mapAsc = new Map([group.tabs().map(function (tab, ii)].sort()));

							m('ul', group.tabs().map(function (tab, ii) {
								if (opts.displayUrls === 'yes') {

					  //$("ul").append("<li>3</li>");

								return m('li', [
									m('span.delete-link', { onclick: function () {
										tabs.vm.rmTab(i, ii);
									} }),
									m('img', { src: tab.favIconUrl, height: '16', width: '16' }),
									' ',
									m('span.link', { onclick: function () {
										if (opts.deleteTabOnOpen === 'yes') {
											tabs.vm.rmTab(i, ii);
										}

										chrome.tabs.create({
											url: tab.url,
											pinned: tab.pinned
										});
									} }, tab.title ),

									m('p.link', { onclick: function () {

										if (opts.deleteTabOnOpen === 'yes') {
											tabs.vm.rmTab(i, ii);
										}

										chrome.tabs.create({
											url: tab.url,
											pinned: tab.pinned
										});
										}
									} , tab.url)

								]);
	//1
								// $(document).ready(function(){
								//        // menu 클래스 바로 하위에 있는 a 태그를 클릭했을때
								//        $(".menu>li").click(function(){
								//            var submenu = $(this).next("li");
								//
								//            // submenu 가 화면상에 보일때는 위로 보드랍게 접고 아니면 아래로 보드랍게 펼치기
								//            if( submenu.is(":visible") ){
								//                submenu.slideUp();
								//            }else{
								//                submenu.slideDown();
								//            }
								//        });
								//    });

	//2


								}
								else{
									return m('li', [
									m('span.delete-link', { onclick: function () {
										tabs.vm.rmTab(i, ii);
									} }),
									m('img', { src: tab.favIconUrl, height: '16', width: '16' }),
									' ',
									m('span.link', { onclick: function () {
										if (opts.deleteTabOnOpen === 'yes') {
											tabs.vm.rmTab(i, ii);
										}

										chrome.tabs.create({
											url: tab.url,
											pinned: tab.pinned
										});
									} }, tab.title ),



								]);
								}
							}))
						]);
				})
				//최상위그룹 테스트
				]);
				//테스트
            });
        };

        // init the app
        m.module(document.getElementById('groups'), { controller: tabs.controller, view: tabs.view });

    });

}(m));


// 검색하는 것
$(document).ready(function() {
    $("#keyword").keyup(function() {
        var k = $(this).val();
        $(".group").hide();
        var temp = $("#wrapper > #groups > .group > .group-title > .group-name:contains('" + k + "')");
        var test = $(".group-name");
        console.log(test[0]);
        $(temp).parent().parent().show();
    });
});
