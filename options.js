document.addEventListener('DOMContentLoaded', function() {
    // 요소들
    const streamerInput = document.getElementById('streamerInput');
    const addStreamerBtn = document.getElementById('addStreamerBtn');
    const clearAllStreamers = document.getElementById('clearAllStreamers');
    const streamerList = document.getElementById('streamerList');
    
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const clearAllTags = document.getElementById('clearAllTags');
    const tagList = document.getElementById('tagList');
    
    const streamerStatCount = document.getElementById('streamerStatCount');
    const tagStatCount = document.getElementById('tagStatCount');

    // 초기 로드
    loadAllData();

    // 이벤트 리스너
    addStreamerBtn.addEventListener('click', addStreamers);
    streamerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addStreamers();
    });
    clearAllStreamers.addEventListener('click', clearAllStreamersList);

    addTagBtn.addEventListener('click', addTags);
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTags();
    });
    clearAllTags.addEventListener('click', clearAllTagsList);

    // 모든 데이터 로드
    async function loadAllData() {
        await loadStats();
        await loadStreamerList();
        await loadTagList();
    }

    // 통계 로드
    async function loadStats() {
        try {
            const result = await chrome.storage.sync.get(['blockedStreamers', 'blockedTags']);
            const streamers = result.blockedStreamers || [];
            const tags = result.blockedTags || [];

            streamerStatCount.textContent = streamers.length;
            tagStatCount.textContent = tags.length;
        } catch (error) {
            console.error('통계 로드 중 오류:', error);
        }
    }

    // 스트리머 추가
    async function addStreamers() {
        const input = streamerInput.value.trim();
        if (!input) {
            alert('스트리머 이름을 입력해주세요.');
            return;
        }

        try {
            const result = await chrome.storage.sync.get('blockedStreamers');
            const blockedStreamers = result.blockedStreamers || [];

            const streamerNames = input.split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (streamerNames.length === 0) {
                alert('유효한 스트리머 이름을 입력해주세요.');
                return;
            }

            const newStreamers = [];
            const duplicates = [];

            streamerNames.forEach(name => {
                if (blockedStreamers.includes(name)) {
                    duplicates.push(name);
                } else {
                    newStreamers.push(name);
                    blockedStreamers.push(name);
                }
            });

            if (newStreamers.length > 0) {
                await chrome.storage.sync.set({ blockedStreamers });
                notifyContentScript('blockedStreamers', blockedStreamers);
            }

            streamerInput.value = '';
            await loadAllData();

            showResultMessage(newStreamers, duplicates, '스트리머');
        } catch (error) {
            console.error('스트리머 추가 중 오류:', error);
            alert('스트리머 추가 중 오류가 발생했습니다.');
        }
    }

    // 태그 추가
    async function addTags() {
        const input = tagInput.value.trim();
        if (!input) {
            alert('태그를 입력해주세요.');
            return;
        }

        try {
            const result = await chrome.storage.sync.get('blockedTags');
            const blockedTags = result.blockedTags || [];

            const tagNames = input.split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (tagNames.length === 0) {
                alert('유효한 태그를 입력해주세요.');
                return;
            }

            const newTags = [];
            const duplicates = [];

            tagNames.forEach(name => {
                if (blockedTags.includes(name)) {
                    duplicates.push(name);
                } else {
                    newTags.push(name);
                    blockedTags.push(name);
                }
            });

            if (newTags.length > 0) {
                await chrome.storage.sync.set({ blockedTags });
                notifyContentScript('blockedTags', blockedTags);
            }

            tagInput.value = '';
            await loadAllData();

            showResultMessage(newTags, duplicates, '태그');
        } catch (error) {
            console.error('태그 추가 중 오류:', error);
            alert('태그 추가 중 오류가 발생했습니다.');
        }
    }

    // 스트리머 제거
    async function removeStreamer(streamerName) {
        try {
            const result = await chrome.storage.sync.get('blockedStreamers');
            const blockedStreamers = result.blockedStreamers || [];
            
            const index = blockedStreamers.indexOf(streamerName);
            if (index > -1) {
                blockedStreamers.splice(index, 1);
                await chrome.storage.sync.set({ blockedStreamers });
                notifyContentScript('blockedStreamers', blockedStreamers);
                await loadAllData();
            }
        } catch (error) {
            console.error('스트리머 제거 중 오류:', error);
        }
    }

    // 태그 제거
    async function removeTag(tagName) {
        try {
            const result = await chrome.storage.sync.get('blockedTags');
            const blockedTags = result.blockedTags || [];
            
            const index = blockedTags.indexOf(tagName);
            if (index > -1) {
                blockedTags.splice(index, 1);
                await chrome.storage.sync.set({ blockedTags });
                notifyContentScript('blockedTags', blockedTags);
                await loadAllData();
            }
        } catch (error) {
            console.error('태그 제거 중 오류:', error);
        }
    }

    // 모든 스트리머 삭제
    async function clearAllStreamersList() {
        if (!confirm('모든 차단된 스트리머를 삭제하시겠습니까?')) return;
        
        try {
            await chrome.storage.sync.set({ blockedStreamers: [] });
            notifyContentScript('blockedStreamers', []);
            await loadAllData();
        } catch (error) {
            console.error('스트리머 전체 삭제 중 오류:', error);
        }
    }

    // 모든 태그 삭제
    async function clearAllTagsList() {
        if (!confirm('모든 차단된 태그를 삭제하시겠습니까?')) return;
        
        try {
            await chrome.storage.sync.set({ blockedTags: [] });
            notifyContentScript('blockedTags', []);
            await loadAllData();
        } catch (error) {
            console.error('태그 전체 삭제 중 오류:', error);
        }
    }

    // 스트리머 목록 로드
    async function loadStreamerList() {
        try {
            const result = await chrome.storage.sync.get('blockedStreamers');
            const blockedStreamers = result.blockedStreamers || [];

            if (blockedStreamers.length === 0) {
                streamerList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👤</div>
                        <div>차단된 스트리머가 없습니다</div>
                    </div>
                `;
                return;
            }

            streamerList.innerHTML = '';
            blockedStreamers.forEach(streamer => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <span class="item-name">${escapeHtml(streamer)}</span>
                    <button class="remove-btn" data-streamer="${escapeHtml(streamer)}">삭제</button>
                `;

                const removeBtn = item.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => removeStreamer(streamer));

                streamerList.appendChild(item);
            });
        } catch (error) {
            console.error('스트리머 목록 로드 중 오류:', error);
        }
    }

    // 태그 목록 로드
    async function loadTagList() {
        try {
            const result = await chrome.storage.sync.get('blockedTags');
            const blockedTags = result.blockedTags || [];

            if (blockedTags.length === 0) {
                tagList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏷️</div>
                        <div>차단된 태그가 없습니다</div>
                    </div>
                `;
                return;
            }

            tagList.innerHTML = '';
            blockedTags.forEach(tag => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <span class="item-name item-tag"># ${escapeHtml(tag)}</span>
                    <button class="remove-btn" data-tag="${escapeHtml(tag)}">삭제</button>
                `;

                const removeBtn = item.querySelector('.remove-btn');
                removeBtn.addEventListener('click', () => removeTag(tag));

                tagList.appendChild(item);
            });
        } catch (error) {
            console.error('태그 목록 로드 중 오류:', error);
        }
    }

    // 콘텐츠 스크립트에 변경사항 알림
    async function notifyContentScript(type, data) {
        try {
            const tabs = await chrome.tabs.query({ url: 'https://www.sooplive.co.kr/*' });
            const message = { action: 'updateBlockList' };
            message[type] = data;

            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, message).catch(() => {
                    // 탭이 응답하지 않는 경우 무시 (페이지가 로드되지 않은 상태일 수 있음)
                });
            });
        } catch (error) {
            console.error('콘텐츠 스크립트 알림 중 오류:', error);
        }
    }

    // 결과 메시지 표시
    function showResultMessage(newItems, duplicates, type) {
        let message = '';
        if (newItems.length > 0) {
            message += `${newItems.length}개의 ${type}가 추가되었습니다.`;
        }
        if (duplicates.length > 0) {
            if (message) message += '\n';
            message += `이미 차단된 ${type}: ${duplicates.join(', ')}`;
        }
        if (message) {
            alert(message);
        }
    }

    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});