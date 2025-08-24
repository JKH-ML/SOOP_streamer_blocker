// 차단된 스트리머 목록과 태그 목록
let blockedStreamers = [];
let blockedTags = [];

// 차단 기능 활성화 상태
let masterEnabled = true;
let streamerEnabled = true;
let tagEnabled = true;

// 초기화
(async function init() {
  try {
    const result = await chrome.storage.sync.get([
      "blockedStreamers",
      "blockedTags",
      "masterBlockEnabled",
      "streamerBlockEnabled",
      "tagBlockEnabled",
    ]);

    blockedStreamers = result.blockedStreamers || [];
    blockedTags = result.blockedTags || [];

    // 토글 상태 로드 (기본값: true)
    masterEnabled = result.masterBlockEnabled !== false;
    streamerEnabled = result.streamerBlockEnabled !== false;
    tagEnabled = result.tagBlockEnabled !== false;

    hideBlockedContent();

    // 페이지 변경 감지를 위한 옵저버 설정
    setupObserver();
  } catch (error) {
    console.error("숲 스트리머 숨기기 초기화 오류:", error);
  }
})();

// 팝업에서 오는 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBlockList") {
    if (message.blockedStreamers) {
      blockedStreamers = message.blockedStreamers;
    }
    if (message.blockedTags) {
      blockedTags = message.blockedTags;
    }
    hideBlockedContent();
  } else if (message.action === "updateBlockSettings") {
    // 토글 설정 업데이트
    const settings = message.settings;
    masterEnabled = settings.masterEnabled;
    streamerEnabled = settings.streamerEnabled;
    tagEnabled = settings.tagEnabled;
    blockedStreamers = settings.blockedStreamers;
    blockedTags = settings.blockedTags;

    // 모든 카드의 처리 상태 리셋
    const allCards = document.querySelectorAll('li[data-type="cBox"]');
    allCards.forEach((card) => {
      card.dataset.processed = "false";
      // 차단 해제 시 모든 카드 표시
      if (!masterEnabled) {
        card.style.display = "";
        card.dataset.blocked = "false";
      }
    });

    // 설정에 따라 차단 적용
    if (masterEnabled) {
      hideBlockedContent();
    }
  }
});

// 차단된 스트리머와 태그 숨기기
function hideBlockedContent() {
  // 마스터 토글이 꺼져있으면 아무것도 하지 않음
  if (!masterEnabled) {
    console.log("숲 스트리머 숨기기: 차단 기능이 비활성화되어 있습니다.");
    return;
  }

  // 둘 다 비활성화면 리턴
  if (!streamerEnabled && !tagEnabled) {
    console.log(
      "숲 스트리머 숨기기: 모든 개별 차단 기능이 비활성화되어 있습니다."
    );
    return;
  }

  if (blockedStreamers.length === 0 && blockedTags.length === 0) return;

  // 스트리머 카드 찾기 (li 요소 중 data-type="cBox"인 것들)
  const streamerCards = document.querySelectorAll('li[data-type="cBox"]');

  streamerCards.forEach((card) => {
    // 이미 처리된 카드는 스킵
    if (card.dataset.processed === "true") return;

    let shouldHide = false;
    let reason = "";

    // 스트리머 이름으로 차단 확인 (스트리머 차단이 활성화된 경우만)
    if (streamerEnabled && blockedStreamers.length > 0) {
      const nickElements = card.querySelectorAll(".nick span, .nick");
      let streamerName = "";

      for (let nickEl of nickElements) {
        const text = nickEl.textContent.trim();
        if (text) {
          streamerName = text;
          break;
        }
      }

      if (streamerName && blockedStreamers.includes(streamerName)) {
        shouldHide = true;
        reason = `스트리머 "${streamerName}" 차단`;
      }
    }

    // 태그로 차단 확인 (태그 차단이 활성화된 경우만)
    if (!shouldHide && tagEnabled && blockedTags.length > 0) {
      const tagElements = card.querySelectorAll(".tag_wrap a");
      for (let tagEl of tagElements) {
        const tagText = tagEl.textContent.trim();
        if (tagText && blockedTags.includes(tagText)) {
          shouldHide = true;
          reason = `태그 "${tagText}" 차단`;
          break;
        }
      }
    }

    // 차단 처리
    if (shouldHide) {
      card.style.display = "none";
      card.dataset.blocked = "true";
      console.log(`${reason}으로 숨김 처리됨`);
    } else {
      // 차단 해제된 경우 다시 표시
      if (card.dataset.blocked === "true") {
        card.style.display = "";
        card.dataset.blocked = "false";
      }
    }

    // 처리 완료 표시
    card.dataset.processed = "true";
  });
}

// 페이지 변경 감지 옵저버 설정
function setupObserver() {
  // DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;

    mutations.forEach((mutation) => {
      // 새로운 노드가 추가되었거나 기존 노드가 변경된 경우
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        shouldCheck = true;
      }
      // 속성이 변경된 경우
      else if (mutation.type === "attributes") {
        shouldCheck = true;
      }
    });

    if (shouldCheck) {
      // 처리 플래그 리셋 (새로 로드된 컨텐츠 처리를 위해)
      const processedCards = document.querySelectorAll(
        'li[data-type="cBox"][data-processed="true"]'
      );
      processedCards.forEach((card) => {
        card.dataset.processed = "false";
        card.dataset.contextMenuAdded = "false";
      });

      // 약간의 지연 후 숨기기 실행 및 컨텍스트 메뉴 설정 (DOM 로딩 완료 대기)
      setTimeout(() => {
        hideBlockedContent();
        setupContextMenu();
      }, 100);
    }
  });

  // 페이지 전체 감시 시작
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  // URL 변경 감지 (SPA 페이지 변경)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      setTimeout(() => {
        // 모든 처리 플래그 리셋
        const allCards = document.querySelectorAll('li[data-type="cBox"]');
        allCards.forEach((card) => {
          card.dataset.processed = "false";
          card.dataset.contextMenuAdded = "false";
        });
        hideBlockedContent();
        setupContextMenu();
      }, 500);
    }
  }, 500);
}

// 컨텍스트 메뉴 생성 및 관리
let contextMenu = null;

function createContextMenu(streamerName, x, y) {
  // 기존 메뉴가 있으면 제거
  removeContextMenu();

  const menu = document.createElement('div');
  menu.id = 'streamer-context-menu';
  menu.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    min-width: 150px;
    left: ${x}px;
    top: ${y}px;
  `;

  const isBlocked = blockedStreamers.includes(streamerName);
  const menuText = isBlocked ? `숨긴 스트리머에서 '${streamerName}' 제거` : `숨긴 스트리머에 '${streamerName}' 추가`;

  const menuItem = document.createElement('div');
  menuItem.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    background: white;
    border-radius: 4px;
  `;
  menuItem.textContent = menuText;

  menuItem.addEventListener('mouseenter', () => {
    menuItem.style.backgroundColor = '#f0f0f0';
  });

  menuItem.addEventListener('mouseleave', () => {
    menuItem.style.backgroundColor = 'white';
  });

  menuItem.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isBlocked) {
        // 스트리머 차단 해제
        const index = blockedStreamers.indexOf(streamerName);
        if (index > -1) {
          blockedStreamers.splice(index, 1);
        }
      } else {
        // 스트리머 차단 추가
        if (!blockedStreamers.includes(streamerName)) {
          blockedStreamers.push(streamerName);
        }
      }

      // 스토리지에 저장
      await chrome.storage.sync.set({ blockedStreamers });

      // 차단 리스트 업데이트 및 재처리
      const allCards = document.querySelectorAll('li[data-type="cBox"]');
      allCards.forEach((card) => {
        card.dataset.processed = "false";
      });
      hideBlockedContent();

    } catch (error) {
      console.error('스트리머 차단 설정 오류:', error);
    }

    removeContextMenu();
  });

  menu.appendChild(menuItem);
  document.body.appendChild(menu);
  contextMenu = menu;

  // 메뉴 외부 클릭 시 메뉴 제거
  setTimeout(() => {
    document.addEventListener('click', removeContextMenu, { once: true });
  }, 0);
}

function removeContextMenu() {
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
}

// 스트리머 카드에 우클릭 이벤트 추가
function setupContextMenu() {
  const streamerCards = document.querySelectorAll('li[data-type="cBox"]');
  
  streamerCards.forEach((card) => {
    // 이미 이벤트가 추가된 카드는 스킵
    if (card.dataset.contextMenuAdded === "true") return;

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // 스트리머 이름 찾기
      const nickElements = card.querySelectorAll(".nick span, .nick");
      let streamerName = "";

      for (let nickEl of nickElements) {
        const text = nickEl.textContent.trim();
        if (text) {
          streamerName = text;
          break;
        }
      }

      if (streamerName) {
        createContextMenu(streamerName, e.pageX, e.pageY);
      }
    });

    // 이벤트 추가 표시
    card.dataset.contextMenuAdded = "true";
  });
}

// 페이지 로드 완료 후 실행
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    hideBlockedContent();
    setupContextMenu();
  });
} else {
  hideBlockedContent();
  setupContextMenu();
}

// 추가적인 지연 실행 (동적 로딩 대비)
setTimeout(() => {
  hideBlockedContent();
  setupContextMenu();
}, 1000);
setTimeout(() => {
  hideBlockedContent();
  setupContextMenu();
}, 3000);
