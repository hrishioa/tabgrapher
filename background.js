// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.onClicked.addListener(function(tab) {
  // chrome.tabs.create({url:chrome.extension.getURL("tabs_api.html")});
  start();
});

tabInfo = [];
recorded =0;
tabRecordInterval = 500;

// chrome.tabs.getSelected(console.log);

function start() {
	// console.log("Start is run.");
	var timeout = setTimeout( function() { start(); }, 2000);
	chrome.tabs.query({}, processTabs);
	// chrome.tabs.getSelected(console.log);
	// chrome.tabs.query({windowId:1044}, processTabs);
}

function processTabs(tabs) {
	recorded++;
	curTime = Date.now();
	// console.log(curTime);
	// tabs.map((tab) => {
	// 	console.log(tab.title);
	// 	console.log("Url - ",tab.url);
	// 	console.log("Tag ID - ",tab.id,", Index - ",tab.index,", Window - ",tab.windowId);
	// 	console.log("Opener ID - ",tab.openerTabId);
	// });

	// console.log("Dependents - ");
	// tabs.map((tab) => {
	// 	if(tab.openerTabId != undefined) {
	// 		chrome.tabs.get(tab.openerTabId, (openerTab) => {
	// 			console.log(tab.title);
	// 			console.log("Opened by ID - ",tab.openerTabId," - "+openerTab.title);
	// 		});
	// 	}
	// });

	// console.log("Testing - ");
	// console.log(JSON.stringify(tabs[0]));
	tabInfo.push({timestamp:curTime,tabs});
	console.log(makeTreeObject(tabs));
}

function getNode(tree, tabId) {
	tabFound = undefined;
	console.log("call of getNode with tabId ",tabId, "at root ",tree.title," with id ",tree.id);
	if(tree.id===tabId) return tree;
	console.log("Tree root did not match. Checking ",tree.contents.length, " children..");
	for(var i=0;i<tree.contents.length;i++) {
		console.log("At child ",i," which is ",tree.contents[i]);
		tabFound = getNode(tree.contents[i],tabId);
		if(tabFound!=undefined) break;
	}
	return tabFound;
}

function makeTreeObject(tabs) {
	treeObject = {
		name:"noRoot",
		contents: []
	}

	console.log(tabs.length," total tabs.");

	for(i=0;i<tabs.length;i++) {
		if(tabs[i].openerTabId!=undefined) continue;
		treeObject.contents.push({
			name:tabs[i].title.substring(0,10),
			id:tabs[i].id,
			openerTabId:tabs[i].openerTabId,
			contents:[]
		});
	}

	parented = 0;

	skipped = tabs;
	count=0;
	do {
		tabs = skipped;
		skipped = [];
		console.log("Got here.");
		for(i=0;i<tabs.length;i++) {
			console.log("Looking at ",i);
			if(tabs[i].openerTabId==undefined) continue;
			console.log(i,"Needs a parent.");
			parented++;
			parent = getNode(treeObject,tabs[i].openerTabId);
			if(parent == undefined) {
				console.log("Parent undefined on first run");
				skipped.push(tabs[i]);
			}
			else {
				console.log("Found parent ",parent.name," for tab ",tabs[i].title.substring(0,10));
				parent.contents.push({
					name:tabs[i].title.substring(0,10),
					openerTabId:tabs[i].openerTabId,
					id:tabs[i].id,
					contents:[]
				});
			}
		}
		console.log("Skipped ",skipped.length," items. ");
		if(count++ > 10) break;
	}
	while(skipped.length!=0);

	console.log("Parented ",parented," items.");

	return JSON.stringify(treeObject);

}