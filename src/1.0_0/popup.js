;(function () {
    'use strict';
	var results;
    // all tabs
    
    document.getElementById('save-tab').addEventListener('click', function () {
        chrome.tabs.query({ active: true,currentWindow: true }, function (tab) {
            chrome.runtime.sendMessage({ action: 'saveone', tab: tab[0], category: results["category"], tags: results["keyword"], language: results["language"]}, function (res) {
                if (res === 'ok') {
                    window.close();

                }
            });
        });
    });

    // for(int i=0; i<10; i++){
    //     document.getElementById('bttn'+i).addEventListener('click', function () {
    //         chrome.tabs.query({ active: true,currentWindow: true }, function (tabsArr) {
    //             chrome.runtime.sendMessage({ action: 'saveone', tab: tab[0], category: results["category"], tags: results["keyword"], language: results["language"]}, function (res) {
    //                 if (res === 'ok') {
    //                     window.close();

    //                 }
    //             });
    //         });
    //     });
    // }


    chrome.extension.onMessage.addListener(function(request, sender){
    	if(request.action == "getSource"){
			var tabFolder = document.getElementById('folderName');
			results = getGoogleNLP(request.source,tabFolder);
    	}
    });

    function onWindowLoad() {
    	chrome.tabs.getSelected(null,function(tab){
    		// var title = document.getElementById('title');
    		// title.value = tab.title;

        var tabTitle =document.getElementById('tabTitle');
        tabTitle.value = tab.title;

    	var link = document.getElementById('input');
    	link.value = tab.url;
			
		chrome.tabs.executeScript(null, {
			file: "getSource.js"});
    	});
    }



    window.onload = onWindowLoad;


/*
    // open background page
    document.getElementById('open-background-page').addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'openbackgroundpage' }, function (res) {
            if (res === 'ok') {
                window.close();
            }
        });
    });*/

}());