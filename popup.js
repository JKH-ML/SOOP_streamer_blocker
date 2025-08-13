document.addEventListener('DOMContentLoaded', function() {
    const streamerCountEl = document.getElementById('streamerCount');
    const tagCountEl = document.getElementById('tagCount');
    const openSettingsBtn = document.getElementById('openSettings');
    const pageStatusEl = document.getElementById('pageStatus');

    // 초기 로드
    loadStats();
    checkCurrentPage();

    // 설정 페이지 열기
    openSettingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    async function loadStats() {
        try {
            const result = await chrome.storage.sync.get(['blockedStreamers', 'blockedTags']);
            const streamers = result.blockedStreamers || [];
            const tags = result.blockedTags || [];

            streamerCountEl.textContent = streamers.length;
            tagCountEl.textContent = tags.length;
        } catch (error) {
            console.error('통계 로드 중 오류:', error);
        }
    }

    async function checkCurrentPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url && tab.url.includes('sooplive.co.kr')) {
                pageStatusEl.innerHTML = '<span class="enabled-indicator"></span>현재 페이지에서 활성';
            } else {
                pageStatusEl.innerHTML = '<span class="disabled-indicator"></span>현재 페이지에서 비활성';
            }
        } catch (error) {
            console.error('페이지 상태 확인 중 오류:', error);
            pageStatusEl.innerHTML = '<span class="disabled-indicator"></span>상태 확인 실패';
        }
    }
});