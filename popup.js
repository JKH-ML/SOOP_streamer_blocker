document.addEventListener("DOMContentLoaded", function () {
  const streamerCountEl = document.getElementById("streamerCount");
  const tagCountEl = document.getElementById("tagCount");
  const openSettingsBtn = document.getElementById("openSettings");
  const pageStatusEl = document.getElementById("pageStatus");

  // 토글 스위치 요소들
  const masterToggle = document.getElementById("masterToggle");
  const streamerToggle = document.getElementById("streamerToggle");
  const tagToggle = document.getElementById("tagToggle");

  // 초기 로드
  loadStats();
  loadToggleStates();
  checkCurrentPage();

  // 설정 페이지 열기
  openSettingsBtn.addEventListener("click", function () {
    chrome.runtime.openOptionsPage();
  });

  // 마스터 토글 이벤트
  masterToggle.addEventListener("change", async function () {
    const isEnabled = this.checked;

    // 마스터 토글이 꺼지면 모든 개별 토글도 끄기
    if (!isEnabled) {
      streamerToggle.checked = false;
      tagToggle.checked = false;
    } else {
      // 마스터 토글이 켜지면 이전 상태 복원
      const result = await chrome.storage.sync.get([
        "streamerBlockEnabled",
        "tagBlockEnabled",
      ]);
      streamerToggle.checked = result.streamerBlockEnabled !== false;
      tagToggle.checked = result.tagBlockEnabled !== false;
    }

    // 상태 저장
    await chrome.storage.sync.set({
      masterBlockEnabled: isEnabled,
      streamerBlockEnabled: streamerToggle.checked,
      tagBlockEnabled: tagToggle.checked,
    });

    // 개별 토글 활성화/비활성화
    streamerToggle.disabled = !isEnabled;
    tagToggle.disabled = !isEnabled;

    // 콘텐츠 스크립트에 알림
    notifyContentScript();
  });

  // 스트리머 토글 이벤트
  streamerToggle.addEventListener("change", async function () {
    await chrome.storage.sync.set({
      streamerBlockEnabled: this.checked,
    });
    notifyContentScript();
  });

  // 태그 토글 이벤트
  tagToggle.addEventListener("change", async function () {
    await chrome.storage.sync.set({
      tagBlockEnabled: this.checked,
    });
    notifyContentScript();
  });

  // 토글 상태 로드
  async function loadToggleStates() {
    try {
      const result = await chrome.storage.sync.get([
        "masterBlockEnabled",
        "streamerBlockEnabled",
        "tagBlockEnabled",
      ]);

      // 기본값: 모두 true (활성화)
      const masterEnabled = result.masterBlockEnabled !== false;
      const streamerEnabled = result.streamerBlockEnabled !== false;
      const tagEnabled = result.tagBlockEnabled !== false;

      masterToggle.checked = masterEnabled;
      streamerToggle.checked = streamerEnabled && masterEnabled;
      tagToggle.checked = tagEnabled && masterEnabled;

      // 마스터 토글이 꺼져있으면 개별 토글 비활성화
      streamerToggle.disabled = !masterEnabled;
      tagToggle.disabled = !masterEnabled;
    } catch (error) {
      console.error("토글 상태 로드 중 오류:", error);
    }
  }

  // 통계 로드
  async function loadStats() {
    try {
      const result = await chrome.storage.sync.get([
        "blockedStreamers",
        "blockedTags",
      ]);
      const streamers = result.blockedStreamers || [];
      const tags = result.blockedTags || [];

      streamerCountEl.textContent = streamers.length;
      tagCountEl.textContent = tags.length;
    } catch (error) {
      console.error("통계 로드 중 오류:", error);
    }
  }

  // 현재 페이지 확인
  async function checkCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("sooplive.co.kr")) {
        // 차단 기능 상태 확인
        const result = await chrome.storage.sync.get(["masterBlockEnabled"]);
        const isEnabled = result.masterBlockEnabled !== false;

        if (isEnabled) {
          pageStatusEl.innerHTML =
            '<span class="enabled-indicator"></span>현재 페이지에서 활성';
        } else {
          pageStatusEl.innerHTML =
            '<span class="disabled-indicator"></span>차단 기능 비활성화됨';
        }
      } else {
        pageStatusEl.innerHTML =
          '<span class="disabled-indicator"></span>SoopLive 페이지가 아님';
      }
    } catch (error) {
      console.error("페이지 상태 확인 중 오류:", error);
      pageStatusEl.innerHTML =
        '<span class="disabled-indicator"></span>상태 확인 실패';
    }
  }

  // 콘텐츠 스크립트에 변경사항 알림
  async function notifyContentScript() {
    try {
      const tabs = await chrome.tabs.query({
        url: "https://www.sooplive.co.kr/*",
      });
      const settings = await chrome.storage.sync.get([
        "masterBlockEnabled",
        "streamerBlockEnabled",
        "tagBlockEnabled",
        "blockedStreamers",
        "blockedTags",
      ]);

      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateBlockSettings",
            settings: {
              masterEnabled: settings.masterBlockEnabled !== false,
              streamerEnabled: settings.streamerBlockEnabled !== false,
              tagEnabled: settings.tagBlockEnabled !== false,
              blockedStreamers: settings.blockedStreamers || [],
              blockedTags: settings.blockedTags || [],
            },
          })
          .catch(() => {
            // 탭이 응답하지 않는 경우 무시
          });
      });

      // 페이지 상태 업데이트
      checkCurrentPage();
    } catch (error) {
      console.error("콘텐츠 스크립트 알림 중 오류:", error);
    }
  }
});
