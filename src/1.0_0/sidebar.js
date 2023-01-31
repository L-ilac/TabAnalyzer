// ;(function () {
    
//     document.getElementById('bttn1').addEventListener('click',function(){        
//         chrome.tabs.query({ /*index : 0 ,*/currentWindow: true }, function () {
//             chrome.runtime.sendMessage({ action: 'sidebar', tab: tab, category: results["category"], tags: results["keyword"], language: results["language"]}, function (res) {
//                 if (res === 'ok') {
//                     alert(success);
//                 }
//             });
//         });
//     });


//     chrome.extension.onMessage.addListener(function(request, sender){
//     	if(request.action == "getSource"){
// 			var tabFolder = document.getElementById('folderName');
// 			results = getGoogleNLP(request.source,tabFolder);
//     	}
//     });

//     function onWindowLoad() {
//     	chrome.tabs.getSelected(null,function(tab){
        
//         /*
//         var tabTitle =document.getElementById('tabTitle');
//         tabTitle.value = tab.title;

//     	var link = document.getElementById('input');
//     	link.value = tab.url;*/
			
// 		chrome.tabs.executeScript(null, {
// 			file: "getSource.js"});
//     	});
//     }

//     window.onload = onWindowLoad;

// }());