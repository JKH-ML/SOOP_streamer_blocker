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
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
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
  } else if (message.action === "handleContextMenu") {
    // 컨텍스트 메뉴에서 호출된 경우 처리
    await handleContextMenuAction();
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

// 컨텍스트 메뉴 액션 처리
let lastRightClickedCard = null;

// 토스트 메시지 표시
function showToast(message) {
  // 기존 토스트가 있으면 제거
  const existingToast = document.getElementById('soop-blocker-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'soop-blocker-toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // 애니메이션으로 표시
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

async function handleContextMenuAction() {
  if (!lastRightClickedCard) {
    showToast('스트리머 카드를 우클릭한 후 메뉴를 선택해주세요.');
    return;
  }

  // 스트리머 이름 찾기
  const nickElements = lastRightClickedCard.querySelectorAll(".nick span, .nick");
  let streamerName = "";

  for (let nickEl of nickElements) {
    const text = nickEl.textContent.trim();
    if (text) {
      streamerName = text;
      break;
    }
  }

  if (!streamerName) {
    showToast('스트리머 이름을 찾을 수 없습니다.');
    return;
  }

  try {
    const isBlocked = blockedStreamers.includes(streamerName);
    
    if (isBlocked) {
      // 스트리머 차단 해제
      const index = blockedStreamers.indexOf(streamerName);
      if (index > -1) {
        blockedStreamers.splice(index, 1);
      }
      showToast(`${streamerName} 숨김 해제`);
    } else {
      // 스트리머 차단 추가
      if (!blockedStreamers.includes(streamerName)) {
        blockedStreamers.push(streamerName);
      }
      showToast(`${streamerName} 숨김 처리`);
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
    showToast('오류가 발생했습니다.');
  }
  
  // 초기화
  lastRightClickedCard = null;
}

// 스트리머 카드에 우클릭 이벤트 추가
function setupContextMenu() {
  const streamerCards = document.querySelectorAll('li[data-type="cBox"]');
  
  streamerCards.forEach((card) => {
    // 이미 이벤트가 추가된 카드는 스킵
    if (card.dataset.contextMenuAdded === "true") return;

    card.addEventListener('contextmenu', (e) => {
      // 우클릭된 카드 저장 (네이티브 컨텍스트 메뉴에서 사용)
      lastRightClickedCard = card;
      
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
        // 현재 차단 상태에 따라 컨텍스트 메뉴 텍스트 업데이트
        const isBlocked = blockedStreamers.includes(streamerName);
        const menuTitle = isBlocked ? "스트리머 숨기기 해제" : "스트리머 숨기기";
        
        // 백그라운드 스크립트에 메뉴 업데이트 요청 (오류 무시)
        chrome.runtime.sendMessage({
          action: "updateContextMenu",
          title: menuTitle
        }).catch(error => {
          // 초기 로드 시 connection 오류 무시
          console.debug('Context menu update failed:', error);
        });
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
