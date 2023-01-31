;(function () {
    'use strict';
chrome.storage.local.get(function (storage) {

        var opts = storage.options || {
				closeTabsOpt: 'no'
            };
                                    

    // from the array of Tab objects it makes an object with date and the array
    function makeTabGroup(tabsArr,topic) {
        var tabGroup = {
                dateG: Date.now(),
                id: Date.now() // clever wy to quickly get a unique ID
            };
		tabGroup.name = topic;
        tabGroup.tabs = tabsArr;

        return tabGroup;
    }

    function makeTab(tab,topic){
        var tab;
        tab.name = topic;
        
    }


    // filters tabGroup for stuff like pinned tabs, chrome:// tabs, etc.
    /*function filterTabGroup(tabGroup) {
        return tabGroup;
    }*/

    // saves array (of Tab objects) to localStorage
    
    // Save All (모든 탭 저장)
    function saveTabGroup(tabGroup) {
        chrome.storage.local.get('tabGroups', function (storage) {
            var newArr;

            if (storage.tabGroups) {
                newArr = storage.tabGroups;
                newArr.push(tabGroup);

                chrome.storage.local.set({ tabGroups: newArr });
            } else {
                chrome.storage.local.set({ tabGroups: [ tabGroup ] });
            }
        });
    }

    // Save Tab (단일 탭 저장)
    function saveSingleTab(tab, topic) {
        chrome.storage.local.get('tabGroups', function (storage) {
            var flag = 0;
            if (storage.tabGroups) {
                for(var i=0;i<storage.tabGroups.length; i++){
                    var tabGroup;
                    tabGroup = storage.tabGroups[i];
                    if (topic == storage.tabGroups[i].name){
                        flag = 1;
                        storage.tabGroups[i].tabs.push(tab);
                        chrome.storage.local.set({ tabGroups: storage.tabGroups });
                        break;
					}
                }
                if(flag == 0){
                    var tabGroup = makeTabGroup([tab],topic);
                    saveTabGroup(tabGroup);
                    }
                }             
            /*
            if (storage.tabGroups) {
				var tabGroup = storage.tabGroups;
                for(var i=0;i<tabGroup.length; i++){
                    if (topic == tabGroup[i].name){
                        tabGroup[i].tabs.push(tab);
                        break;
					}
                }
                //var tabGroup = makeTabGroup(tab,topic);
                //saveTabGroup(tabGroup);

                chrome.storage.local.set({ tabGroups: tabGroup});
            }*/
            else {
                var tabGroup = makeTabGroup([tab], topic);
                saveTabGroup(tabGroup);
            }
        });
    }
    
    function makeID(input) {
        input.id = String(Date.now());
        return input;
    }
    
	function saveTabwithInfo(tabInfo) {
        chrome.storage.local.get('tablist', function (storage) {
            if (storage.tablist) {
                 var tabs = storage.tablist;
                 tabs[tabInfo.id] = tabInfo;
                chrome.storage.local.set({ tablist: tabs });
            }
            else {
                var tabs = {};
                tabs[tabInfo.id] = tabInfo;
                chrome.storage.local.set({ tablist: tabs });
            }
        });
	}

    // close all the tabs in the provided array of Tab objects
    function closeTabs(tabsArr) {
        var tabsToClose = [],
            i;

        for (i = 0; i < tabsArr.length; i += 1) {
            tabsToClose.push(tabsArr[i].id);
        }

        chrome.tabs.remove(tabsToClose, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
            }
        });
    }

    // makes a tab group, filters it and saves it to localStorage
    function saveTabs(tabsArr,topic) {
		//alert(tabsArr.length);

        var tabGroup = makeTabGroup(tabsArr,topic);
           // cleanTabGroup = filterTabGroup(tabGroup);

        saveTabGroup(tabGroup); //cleanTabGroup
    }


    // sidebar
    // start




    chrome.windows.getAll({populate:true}, getAllOpenWindows);

    function getAllOpenWindows(winData) {

      //a = document.createElement("div");
      var total=0;
      var tabs = [];
      for (var i in winData) {
        if (winData[i].focused === true) {
            var winTabs = winData[i].tabs;
            var totTabs = winTabs.length;
            total = totTabs;
            for (var j=0; j<totTabs;j++) {
              tabs[j]=winTabs[j].title;
            }
        }
      }


      for (var i=1;i<=total;i++)
      {
        var bttn = "bttn"+i;
        document.getElementById(bttn).innerHTML = tabs[i-1];
      }
    }
    //window.onload = onWindowLoad;

    //var b=document.getElementById(bttn1);
    //b.addEventListener(sidebarClick(1));

//sidebar end

/*
    function openBackgroundPage() {
        chrome.tabs.create({ url: chrome.extension.getURL('tabanalyzer.html') });
    }*/

    // listen for messages from popup
    chrome.runtime.onMessage.addListener(function (req, sender, sendRes) {
        switch (req.action) {
            case 'save':
                var CS_Not_Programming = ["Internet & Telecom", "Computers & Electronics", "Computer Science"];
                if (req.category == "Programming") {
                    req.category = "P" + req.category;
                }
                else if (CS_Not_Programming.includes(req.category)) {
                    req.category = "C" + req.category;
                }
                else {
                    req.category = "O" + req.category;
                }

            saveTabs(req.tabsArr,req.category);
            //openBackgroundPage(); // opening now so window doesn't close
			if (opts.closeTabsOpt === 'yes')
				closeTabs(req.tabsArr);
            sendRes('ok'); // acknowledge
            window.location.reload(true);
            break;
            case 'saveone':  
                req = makeID(req);
                saveTabwithInfo(req);
                var CS_Not_Programming = ["Internet & Telecom", "Computers & Electronics", "Computer Science"];
                if (req.category == "Programming") {
                    saveSingleTab(req.tab, "P" + req.tags[0]);
                }
                else if (CS_Not_Programming.includes(req.category)){
                    saveSingleTab(req.tab, "C" + req.tags[0]);
                }
                else {
                    saveSingleTab(req.tab,  "O" + req.category);
                }
                if (opts.closeTabsOpt === 'yes')
                    closeTabs(req.tab);
                window.location.reload(true);
                sendRes('ok');
                break;
            case 'sidebar':
                sendRes('ok');


            default:
                sendRes('nope'); // acknowledge
                break;
        }
    });
});
}());