// 컨텍스트 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "hideStreamer",
    title: "스트리머 숨기기",
    contexts: ["all"],
    documentUrlPatterns: ["https://www.sooplive.co.kr/*"]
  });
});

// 컨텍스트 메뉴 업데이트
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateContextMenu") {
    chrome.contextMenus.update("hideStreamer", {
      title: message.title
    });
  }
});

// 컨텍스트 메뉴 클릭 처리
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "hideStreamer") {
    // content script에 메시지 전송하여 해당 위치의 스트리머 처리
    chrome.tabs.sendMessage(tab.id, {
      action: "handleContextMenu"
    });
  }
});