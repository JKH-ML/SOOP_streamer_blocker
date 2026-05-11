document.addEventListener('DOMContentLoaded', async function() {
    // 요소들
    const streamerInput = document.getElementById('streamerInput');
    const addStreamerBtn = document.getElementById('addStreamerBtn');
    const clearAllStreamers = document.getElementById('clearAllStreamers');
    const streamerList = document.getElementById('streamerList');
    const streamerSearch = document.getElementById('streamerSearch');

    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const clearAllTags = document.getElementById('clearAllTags');
    const tagList = document.getElementById('tagList');
    const tagSearch = document.getElementById('tagSearch');

    const allowedStreamerInput = document.getElementById('allowedStreamerInput');
    const addAllowedStreamerBtn = document.getElementById('addAllowedStreamerBtn');
    const clearAllAllowedStreamers = document.getElementById('clearAllAllowedStreamers');
    const allowedStreamerList = document.getElementById('allowedStreamerList');
    const allowedStreamerSearch = document.getElementById('allowedStreamerSearch');

    const titleInput = document.getElementById('titleInput');
    const addTitleBtn = document.getElementById('addTitleBtn');
    const clearAllTitles = document.getElementById('clearAllTitles');
    const titleList = document.getElementById('titleList');
    const titleSearch = document.getElementById('titleSearch');

    const streamerStatCount = document.getElementById('streamerStatCount');
    const tagStatCount = document.getElementById('tagStatCount');
    const titleStatCount = document.getElementById('titleStatCount');
    const allowedStatCount = document.getElementById('allowedStatCount');
    
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const importResult = document.getElementById('importResult');

    // 전체 데이터 저장
    let allStreamers = [];
    let allTags = [];
    let allTitles = [];
    let allAllowedStreamers = [];

    // 초기 로드 (sync → local 마이그레이션 포함)
    await ensureStorageMigration();
    await loadAllData();

    // 이벤트 리스너
    addStreamerBtn.addEventListener('click', addStreamers);
    streamerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addStreamers();
    });
    clearAllStreamers.addEventListener('click', clearAllStreamersList);

    addTitleBtn.addEventListener('click', addTitles);
    titleInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTitles();
    });
    clearAllTitles.addEventListener('click', clearAllTitlesList);

    addTagBtn.addEventListener('click', addTags);
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTags();
    });
    clearAllTags.addEventListener('click', clearAllTagsList);

    addAllowedStreamerBtn.addEventListener('click', addAllowedStreamers);
    allowedStreamerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addAllowedStreamers();
    });
    clearAllAllowedStreamers.addEventListener('click', clearAllAllowedStreamersList);

    // 검색 이벤트 리스너
    streamerSearch.addEventListener('input', function() {
        searchStreamers(this.value);
    });

    tagSearch.addEventListener('input', function() {
        searchTags(this.value);
    });

    titleSearch.addEventListener('input', function() {
        searchTitles(this.value);
    });

    allowedStreamerSearch.addEventListener('input', function() {
        searchAllowedStreamers(this.value);
    });

    // 내보내기/가져오기 이벤트 리스너
    exportBtn.addEventListener('click', exportBlockList);
    importFile.addEventListener('change', importBlockList);

    // 모든 데이터 로드
    async function loadAllData() {
        await loadStats();
        await loadStreamerList();
        await loadTagList();
        await loadTitleList();
        await loadAllowedStreamerList();
    }

    // 통계 로드
    async function loadStats() {
        try {
            const result = await chrome.storage.local.get(['blockedStreamers', 'blockedTags', 'blockedTitles', 'allowedStreamers']);
            const streamers = result.blockedStreamers || [];
            const tags = result.blockedTags || [];
            const titles = result.blockedTitles || [];
            const allowed = result.allowedStreamers || [];

            streamerStatCount.textContent = streamers.length;
            tagStatCount.textContent = tags.length;
            titleStatCount.textContent = titles.length;
            allowedStatCount.textContent = allowed.length;
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
            const result = await chrome.storage.local.get('blockedStreamers');
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
                await chrome.storage.local.set({ blockedStreamers });
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
            const result = await chrome.storage.local.get('blockedTags');
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
                await chrome.storage.local.set({ blockedTags });
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
            const result = await chrome.storage.local.get('blockedStreamers');
            const blockedStreamers = result.blockedStreamers || [];
            
            const index = blockedStreamers.indexOf(streamerName);
            if (index > -1) {
                blockedStreamers.splice(index, 1);
                await chrome.storage.local.set({ blockedStreamers });
                notifyContentScript('blockedStreamers', blockedStreamers);
                await loadAllData();
                // 검색 상태 유지
                if (streamerSearch.value) {
                    searchStreamers(streamerSearch.value);
                }
            }
        } catch (error) {
            console.error('스트리머 제거 중 오류:', error);
        }
    }

    // 태그 제거
    async function removeTag(tagName) {
        try {
            const result = await chrome.storage.local.get('blockedTags');
            const blockedTags = result.blockedTags || [];
            
            const index = blockedTags.indexOf(tagName);
            if (index > -1) {
                blockedTags.splice(index, 1);
                await chrome.storage.local.set({ blockedTags });
                notifyContentScript('blockedTags', blockedTags);
                await loadAllData();
                // 검색 상태 유지
                if (tagSearch.value) {
                    searchTags(tagSearch.value);
                }
            }
        } catch (error) {
            console.error('태그 제거 중 오류:', error);
        }
    }

    // 모든 스트리머 삭제
    async function clearAllStreamersList() {
        if (!confirm('모든 차단된 스트리머를 삭제하시겠습니까?')) return;
        
        try {
            await chrome.storage.local.set({ blockedStreamers: [] });
            notifyContentScript('blockedStreamers', []);
            streamerSearch.value = ''; // 검색창 초기화
            await loadAllData();
        } catch (error) {
            console.error('스트리머 전체 삭제 중 오류:', error);
        }
    }

    // 모든 태그 삭제
    async function clearAllTagsList() {
        if (!confirm('모든 차단된 태그를 삭제하시겠습니까?')) return;

        try {
            await chrome.storage.local.set({ blockedTags: [] });
            notifyContentScript('blockedTags', []);
            tagSearch.value = ''; // 검색창 초기화
            await loadAllData();
        } catch (error) {
            console.error('태그 전체 삭제 중 오류:', error);
        }
    }

    // 제목 키워드 추가
    async function addTitles() {
        const input = titleInput.value.trim();
        if (!input) {
            alert('차단할 제목 키워드를 입력해주세요.');
            return;
        }

        try {
            const result = await chrome.storage.local.get('blockedTitles');
            const blockedTitles = result.blockedTitles || [];

            const keywords = input.split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0);

            if (keywords.length === 0) {
                alert('유효한 키워드를 입력해주세요.');
                return;
            }

            const newKeywords = [];
            const duplicates = [];

            keywords.forEach(k => {
                if (blockedTitles.includes(k)) {
                    duplicates.push(k);
                } else {
                    newKeywords.push(k);
                    blockedTitles.push(k);
                }
            });

            if (newKeywords.length > 0) {
                await chrome.storage.local.set({ blockedTitles });
                notifyContentScript('blockedTitles', blockedTitles);
            }

            titleInput.value = '';
            await loadAllData();

            showResultMessage(newKeywords, duplicates, '키워드');
        } catch (error) {
            console.error('제목 키워드 추가 중 오류:', error);
            alert('제목 키워드 추가 중 오류가 발생했습니다.');
        }
    }

    // 제목 키워드 제거
    async function removeTitle(keyword) {
        try {
            const result = await chrome.storage.local.get('blockedTitles');
            const blockedTitles = result.blockedTitles || [];

            const index = blockedTitles.indexOf(keyword);
            if (index > -1) {
                blockedTitles.splice(index, 1);
                await chrome.storage.local.set({ blockedTitles });
                notifyContentScript('blockedTitles', blockedTitles);
                await loadAllData();
                if (titleSearch.value) {
                    searchTitles(titleSearch.value);
                }
            }
        } catch (error) {
            console.error('제목 키워드 제거 중 오류:', error);
        }
    }

    // 모든 제목 키워드 삭제
    async function clearAllTitlesList() {
        if (!confirm('모든 차단된 제목 키워드를 삭제하시겠습니까?')) return;

        try {
            await chrome.storage.local.set({ blockedTitles: [] });
            notifyContentScript('blockedTitles', []);
            titleSearch.value = '';
            await loadAllData();
        } catch (error) {
            console.error('제목 키워드 전체 삭제 중 오류:', error);
        }
    }

    // 제목 키워드 목록 로드
    async function loadTitleList() {
        try {
            const result = await chrome.storage.local.get('blockedTitles');
            const blockedTitles = result.blockedTitles || [];
            allTitles = blockedTitles;

            if (blockedTitles.length === 0) {
                titleList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <div>차단된 제목 키워드가 없습니다</div>
                    </div>
                `;
                return;
            }

            renderTitleList(blockedTitles);
        } catch (error) {
            console.error('제목 키워드 목록 로드 중 오류:', error);
        }
    }

    // 제목 키워드 목록 렌더링
    function renderTitleList(keywords, searchTerm = '') {
        if (keywords.length === 0 && searchTerm) {
            titleList.innerHTML = `
                <div class="search-result-info">
                    검색 결과가 없습니다: "${escapeHtml(searchTerm)}"
                </div>
            `;
            return;
        }

        titleList.innerHTML = '';
        keywords.forEach(keyword => {
            const item = document.createElement('div');
            item.className = 'list-item';

            let displayName = escapeHtml(keyword);
            if (searchTerm) {
                const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
                displayName = displayName.replace(regex, '<span class="highlight">$1</span>');
            }

            item.innerHTML = `
                <span class="item-name">${displayName}</span>
                <button class="remove-btn" data-keyword="${escapeHtml(keyword)}">삭제</button>
            `;

            item.querySelector('.remove-btn').addEventListener('click', () => removeTitle(keyword));
            titleList.appendChild(item);
        });

        if (searchTerm && keywords.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'search-result-info';
            infoDiv.textContent = `검색 결과: ${keywords.length}개 / 전체: ${allTitles.length}개`;
            titleList.insertBefore(infoDiv, titleList.firstChild);
        }
    }

    // 제목 키워드 검색
    function searchTitles(searchTerm) {
        if (!searchTerm.trim()) {
            renderTitleList(allTitles);
            return;
        }

        const filtered = allTitles.filter(k =>
            k.toLowerCase().includes(searchTerm.toLowerCase())
        );

        renderTitleList(filtered, searchTerm);
    }

    // 허용 스트리머 추가
    async function addAllowedStreamers() {
        const input = allowedStreamerInput.value.trim();
        if (!input) {
            alert('스트리머 이름을 입력해주세요.');
            return;
        }

        try {
            const result = await chrome.storage.local.get('allowedStreamers');
            const allowedStreamers = result.allowedStreamers || [];

            const names = input.split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (names.length === 0) {
                alert('유효한 스트리머 이름을 입력해주세요.');
                return;
            }

            const newNames = [];
            const duplicates = [];

            names.forEach(name => {
                if (allowedStreamers.includes(name)) {
                    duplicates.push(name);
                } else {
                    newNames.push(name);
                    allowedStreamers.push(name);
                }
            });

            if (newNames.length > 0) {
                await chrome.storage.local.set({ allowedStreamers });
                notifyContentScript('allowedStreamers', allowedStreamers);
            }

            allowedStreamerInput.value = '';
            await loadAllData();

            showResultMessage(newNames, duplicates, '스트리머');
        } catch (error) {
            console.error('허용 스트리머 추가 중 오류:', error);
            alert('허용 스트리머 추가 중 오류가 발생했습니다.');
        }
    }

    // 허용 스트리머 제거
    async function removeAllowedStreamer(name) {
        try {
            const result = await chrome.storage.local.get('allowedStreamers');
            const allowedStreamers = result.allowedStreamers || [];

            const index = allowedStreamers.indexOf(name);
            if (index > -1) {
                allowedStreamers.splice(index, 1);
                await chrome.storage.local.set({ allowedStreamers });
                notifyContentScript('allowedStreamers', allowedStreamers);
                await loadAllData();
                if (allowedStreamerSearch.value) {
                    searchAllowedStreamers(allowedStreamerSearch.value);
                }
            }
        } catch (error) {
            console.error('허용 스트리머 제거 중 오류:', error);
        }
    }

    // 모든 허용 스트리머 삭제
    async function clearAllAllowedStreamersList() {
        if (!confirm('모든 태그 차단 예외 스트리머를 삭제하시겠습니까?')) return;

        try {
            await chrome.storage.local.set({ allowedStreamers: [] });
            notifyContentScript('allowedStreamers', []);
            allowedStreamerSearch.value = '';
            await loadAllData();
        } catch (error) {
            console.error('허용 스트리머 전체 삭제 중 오류:', error);
        }
    }

    // 허용 스트리머 목록 로드
    async function loadAllowedStreamerList() {
        try {
            const result = await chrome.storage.local.get('allowedStreamers');
            const allowedStreamers = result.allowedStreamers || [];
            allAllowedStreamers = allowedStreamers;

            if (allowedStreamers.length === 0) {
                allowedStreamerList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">✅</div>
                        <div>태그 차단 예외 스트리머가 없습니다</div>
                    </div>
                `;
                return;
            }

            renderAllowedStreamerList(allowedStreamers);
        } catch (error) {
            console.error('허용 스트리머 목록 로드 중 오류:', error);
        }
    }

    // 허용 스트리머 목록 렌더링
    function renderAllowedStreamerList(streamers, searchTerm = '') {
        if (streamers.length === 0 && searchTerm) {
            allowedStreamerList.innerHTML = `
                <div class="search-result-info">
                    검색 결과가 없습니다: "${escapeHtml(searchTerm)}"
                </div>
            `;
            return;
        }

        allowedStreamerList.innerHTML = '';
        streamers.forEach(name => {
            const item = document.createElement('div');
            item.className = 'list-item';

            let displayName = escapeHtml(name);
            if (searchTerm) {
                const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
                displayName = displayName.replace(regex, '<span class="highlight">$1</span>');
            }

            item.innerHTML = `
                <span class="item-name">${displayName}</span>
                <button class="remove-btn" data-name="${escapeHtml(name)}">삭제</button>
            `;

            item.querySelector('.remove-btn').addEventListener('click', () => removeAllowedStreamer(name));
            allowedStreamerList.appendChild(item);
        });

        if (searchTerm && streamers.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'search-result-info';
            infoDiv.textContent = `검색 결과: ${streamers.length}명 / 전체: ${allAllowedStreamers.length}명`;
            allowedStreamerList.insertBefore(infoDiv, allowedStreamerList.firstChild);
        }
    }

    // 허용 스트리머 검색
    function searchAllowedStreamers(searchTerm) {
        if (!searchTerm.trim()) {
            renderAllowedStreamerList(allAllowedStreamers);
            return;
        }

        const filtered = allAllowedStreamers.filter(name =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        renderAllowedStreamerList(filtered, searchTerm);
    }

    // 스트리머 목록 로드
    async function loadStreamerList() {
        try {
            const result = await chrome.storage.local.get('blockedStreamers');
            const blockedStreamers = result.blockedStreamers || [];
            allStreamers = blockedStreamers; // 전체 데이터 저장

            if (blockedStreamers.length === 0) {
                streamerList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👤</div>
                        <div>차단된 스트리머가 없습니다</div>
                    </div>
                `;
                return;
            }

            renderStreamerList(blockedStreamers);
        } catch (error) {
            console.error('스트리머 목록 로드 중 오류:', error);
        }
    }

    // 스트리머 목록 렌더링
    function renderStreamerList(streamers, searchTerm = '') {
        if (streamers.length === 0 && searchTerm) {
            streamerList.innerHTML = `
                <div class="search-result-info">
                    검색 결과가 없습니다: "${escapeHtml(searchTerm)}"
                </div>
            `;
            return;
        }

        streamerList.innerHTML = '';
        streamers.forEach(streamer => {
            const item = document.createElement('div');
            item.className = 'list-item';
            
            // 검색어가 있으면 하이라이트
            let displayName = escapeHtml(streamer);
            if (searchTerm) {
                const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
                displayName = displayName.replace(regex, '<span class="highlight">$1</span>');
            }
            
            item.innerHTML = `
                <span class="item-name">${displayName}</span>
                <button class="remove-btn" data-streamer="${escapeHtml(streamer)}">삭제</button>
            `;

            const removeBtn = item.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => removeStreamer(streamer));

            streamerList.appendChild(item);
        });

        // 검색 결과 정보 표시
        if (searchTerm && streamers.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'search-result-info';
            infoDiv.textContent = `검색 결과: ${streamers.length}명 / 전체: ${allStreamers.length}명`;
            streamerList.insertBefore(infoDiv, streamerList.firstChild);
        }
    }

    // 스트리머 검색
    function searchStreamers(searchTerm) {
        if (!searchTerm.trim()) {
            renderStreamerList(allStreamers);
            return;
        }

        const filtered = allStreamers.filter(streamer => 
            streamer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        renderStreamerList(filtered, searchTerm);
    }

    // 태그 목록 로드
    async function loadTagList() {
        try {
            const result = await chrome.storage.local.get('blockedTags');
            const blockedTags = result.blockedTags || [];
            allTags = blockedTags; // 전체 데이터 저장

            if (blockedTags.length === 0) {
                tagList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏷️</div>
                        <div>차단된 태그가 없습니다</div>
                    </div>
                `;
                return;
            }

            renderTagList(blockedTags);
        } catch (error) {
            console.error('태그 목록 로드 중 오류:', error);
        }
    }

    // 태그 목록 렌더링
    function renderTagList(tags, searchTerm = '') {
        if (tags.length === 0 && searchTerm) {
            tagList.innerHTML = `
                <div class="search-result-info">
                    검색 결과가 없습니다: "${escapeHtml(searchTerm)}"
                </div>
            `;
            return;
        }

        tagList.innerHTML = '';
        tags.forEach(tag => {
            const item = document.createElement('div');
            item.className = 'list-item';
            
            // 검색어가 있으면 하이라이트
            let displayName = escapeHtml(tag);
            if (searchTerm) {
                const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
                displayName = displayName.replace(regex, '<span class="highlight">$1</span>');
            }
            
            item.innerHTML = `
                <span class="item-name item-tag"># ${displayName}</span>
                <button class="remove-btn" data-tag="${escapeHtml(tag)}">삭제</button>
            `;

            const removeBtn = item.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => removeTag(tag));

            tagList.appendChild(item);
        });

        // 검색 결과 정보 표시
        if (searchTerm && tags.length > 0) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'search-result-info';
            infoDiv.textContent = `검색 결과: ${tags.length}개 / 전체: ${allTags.length}개`;
            tagList.insertBefore(infoDiv, tagList.firstChild);
        }
    }

    // 태그 검색
    function searchTags(searchTerm) {
        if (!searchTerm.trim()) {
            renderTagList(allTags);
            return;
        }

        const filtered = allTags.filter(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        renderTagList(filtered, searchTerm);
    }

    // 차단 목록 내보내기
    async function exportBlockList() {
        try {
            const result = await chrome.storage.local.get(['blockedStreamers', 'blockedTags', 'blockedTitles', 'allowedStreamers']);
            const blockedStreamers = result.blockedStreamers || [];
            const blockedTags = result.blockedTags || [];
            const blockedTitles = result.blockedTitles || [];
            const allowedStreamers = result.allowedStreamers || [];

            let content = '=== 숲 스트리머 숨기기 차단 목록 ===\n';
            content += '생성 일시: ' + new Date().toLocaleString('ko-KR') + '\n\n';

            content += '[차단된 스트리머]\n';
            if (blockedStreamers.length > 0) {
                blockedStreamers.forEach(streamer => {
                    content += streamer + '\n';
                });
            } else {
                content += '(없음)\n';
            }

            content += '\n[차단된 태그]\n';
            if (blockedTags.length > 0) {
                blockedTags.forEach(tag => {
                    content += '#' + tag + '\n';
                });
            } else {
                content += '(없음)\n';
            }

            content += '\n[차단된 제목 키워드]\n';
            if (blockedTitles.length > 0) {
                blockedTitles.forEach(keyword => {
                    content += keyword + '\n';
                });
            } else {
                content += '(없음)\n';
            }

            content += '\n[태그 차단 예외 스트리머]\n';
            if (allowedStreamers.length > 0) {
                allowedStreamers.forEach(name => {
                    content += name + '\n';
                });
            } else {
                content += '(없음)\n';
            }

            content += '\n=== 총 ' + (blockedStreamers.length + blockedTags.length + blockedTitles.length + allowedStreamers.length) + '개 항목 ===';

            // 파일 다운로드
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sooplive_blocklist_' + new Date().getTime() + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('차단 목록이 성공적으로 내보내졌습니다.');
        } catch (error) {
            console.error('내보내기 중 오류:', error);
            alert('내보내기 중 오류가 발생했습니다.');
        }
    }

    // 차단 목록 가져오기
    async function importBlockList(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.split('\n');
            
            let isStreamerSection = false;
            let isTagSection = false;
            let isTitleSection = false;
            let isAllowedSection = false;
            const newStreamers = [];
            const newTags = [];
            const newTitles = [];
            const newAllowed = [];

            lines.forEach(line => {
                line = line.trim();

                if (line === '[차단된 스트리머]') {
                    isStreamerSection = true;
                    isTagSection = false;
                    isTitleSection = false;
                    isAllowedSection = false;
                } else if (line === '[차단된 태그]') {
                    isStreamerSection = false;
                    isTagSection = true;
                    isTitleSection = false;
                    isAllowedSection = false;
                } else if (line === '[차단된 제목 키워드]') {
                    isStreamerSection = false;
                    isTagSection = false;
                    isTitleSection = true;
                    isAllowedSection = false;
                } else if (line === '[태그 차단 예외 스트리머]') {
                    isStreamerSection = false;
                    isTagSection = false;
                    isTitleSection = false;
                    isAllowedSection = true;
                } else if (line.startsWith('===') || line.startsWith('생성 일시:') || line === '(없음)' || !line) {
                    // 헤더나 빈 줄 무시
                } else if (isStreamerSection) {
                    newStreamers.push(line);
                } else if (isTagSection) {
                    const tag = line.startsWith('#') ? line.substring(1) : line;
                    newTags.push(tag);
                } else if (isTitleSection) {
                    newTitles.push(line);
                } else if (isAllowedSection) {
                    newAllowed.push(line);
                }
            });

            // 기존 목록과 병합
            const result = await chrome.storage.local.get(['blockedStreamers', 'blockedTags', 'blockedTitles', 'allowedStreamers']);
            const existingStreamers = result.blockedStreamers || [];
            const existingTags = result.blockedTags || [];
            const existingTitles = result.blockedTitles || [];
            const existingAllowed = result.allowedStreamers || [];

            let addedStreamers = 0;
            let duplicateStreamers = 0;
            let addedTags = 0;
            let duplicateTags = 0;
            let addedTitles = 0;
            let duplicateTitles = 0;
            let addedAllowed = 0;
            let duplicateAllowed = 0;

            // 스트리머 병합
            newStreamers.forEach(streamer => {
                if (!existingStreamers.includes(streamer)) {
                    existingStreamers.push(streamer);
                    addedStreamers++;
                } else {
                    duplicateStreamers++;
                }
            });

            // 태그 병합
            newTags.forEach(tag => {
                if (!existingTags.includes(tag)) {
                    existingTags.push(tag);
                    addedTags++;
                } else {
                    duplicateTags++;
                }
            });

            // 제목 키워드 병합
            newTitles.forEach(keyword => {
                if (!existingTitles.includes(keyword)) {
                    existingTitles.push(keyword);
                    addedTitles++;
                } else {
                    duplicateTitles++;
                }
            });

            // 허용 스트리머 병합
            newAllowed.forEach(name => {
                if (!existingAllowed.includes(name)) {
                    existingAllowed.push(name);
                    addedAllowed++;
                } else {
                    duplicateAllowed++;
                }
            });

            // 저장
            await chrome.storage.local.set({
                blockedStreamers: existingStreamers,
                blockedTags: existingTags,
                blockedTitles: existingTitles,
                allowedStreamers: existingAllowed,
            });

            // 콘텐츠 스크립트에 알림
            notifyContentScript('blockedStreamers', existingStreamers);
            notifyContentScript('blockedTags', existingTags);
            notifyContentScript('blockedTitles', existingTitles);
            notifyContentScript('allowedStreamers', existingAllowed);

            // UI 업데이트
            await loadAllData();

            // 결과 표시
            let resultMessage = '가져오기 완료!\n';
            if (addedStreamers > 0) resultMessage += `새로운 스트리머: ${addedStreamers}명\n`;
            if (duplicateStreamers > 0) resultMessage += `중복된 스트리머: ${duplicateStreamers}명\n`;
            if (addedTags > 0) resultMessage += `새로운 태그: ${addedTags}개\n`;
            if (duplicateTags > 0) resultMessage += `중복된 태그: ${duplicateTags}개\n`;
            if (addedTitles > 0) resultMessage += `새로운 제목 키워드: ${addedTitles}개\n`;
            if (duplicateTitles > 0) resultMessage += `중복된 제목 키워드: ${duplicateTitles}개\n`;
            if (addedAllowed > 0) resultMessage += `새로운 예외 스트리머: ${addedAllowed}명\n`;
            if (duplicateAllowed > 0) resultMessage += `중복된 예외 스트리머: ${duplicateAllowed}명`;

            showImportResult(resultMessage, 'success');
            
            // 파일 입력 초기화
            event.target.value = '';
        } catch (error) {
            console.error('가져오기 중 오류:', error);
            showImportResult('파일을 읽는 중 오류가 발생했습니다.', 'error');
            event.target.value = '';
        }
    }

    // 가져오기 결과 표시
    function showImportResult(message, type) {
        importResult.innerHTML = '';
        const div = document.createElement('div');
        div.className = type === 'success' ? 'import-result import-success' : 'import-result import-error';
        div.textContent = message;
        importResult.appendChild(div);

        // 3초 후 메시지 제거
        setTimeout(() => {
            importResult.innerHTML = '';
        }, 3000);
    }

    // 콘텐츠 스크립트에 변경사항 알림
    async function notifyContentScript(type, data) {
        try {
            const tabs = await chrome.tabs.query({
                url: [
                    'https://www.sooplive.co.kr/*',
                    'https://www.sooplive.com/*'
                ]
            });
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

    // storage.sync → storage.local 마이그레이션
    async function ensureStorageMigration() {
        try {
            const localData = await chrome.storage.local.get([
                'storageMigrated',
                'blockedStreamers',
                'blockedTags',
                'blockedTitles',
                'allowedStreamers',
                'masterBlockEnabled',
                'streamerBlockEnabled',
                'tagBlockEnabled',
                'titleBlockEnabled',
            ]);

            if (localData.storageMigrated) return;

            const hasLocalData =
                (localData.blockedStreamers && localData.blockedStreamers.length > 0) ||
                (localData.blockedTags && localData.blockedTags.length > 0) ||
                (localData.blockedTitles && localData.blockedTitles.length > 0) ||
                typeof localData.masterBlockEnabled !== 'undefined' ||
                typeof localData.streamerBlockEnabled !== 'undefined' ||
                typeof localData.tagBlockEnabled !== 'undefined' ||
                typeof localData.titleBlockEnabled !== 'undefined';

            if (hasLocalData) {
                await chrome.storage.local.set({ storageMigrated: true });
                return;
            }

            const syncData = await chrome.storage.sync.get([
                'blockedStreamers',
                'blockedTags',
                'blockedTitles',
                'allowedStreamers',
                'masterBlockEnabled',
                'streamerBlockEnabled',
                'tagBlockEnabled',
                'titleBlockEnabled',
            ]);

            const payload = {
                blockedStreamers: syncData.blockedStreamers || [],
                blockedTags: syncData.blockedTags || [],
                blockedTitles: syncData.blockedTitles || [],
                allowedStreamers: syncData.allowedStreamers || [],
                masterBlockEnabled: syncData.masterBlockEnabled,
                streamerBlockEnabled: syncData.streamerBlockEnabled,
                tagBlockEnabled: syncData.tagBlockEnabled,
                titleBlockEnabled: syncData.titleBlockEnabled,
            };

            const hasSyncData =
                payload.blockedStreamers.length > 0 ||
                payload.blockedTags.length > 0 ||
                payload.blockedTitles.length > 0 ||
                typeof payload.masterBlockEnabled !== 'undefined' ||
                typeof payload.streamerBlockEnabled !== 'undefined' ||
                typeof payload.tagBlockEnabled !== 'undefined' ||
                typeof payload.titleBlockEnabled !== 'undefined';

            if (hasSyncData) {
                await chrome.storage.local.set({ ...payload, storageMigrated: true });
            } else {
                await chrome.storage.local.set({ storageMigrated: true });
            }
        } catch (error) {
            console.error('스토리지 마이그레이션 중 오류:', error);
        }
    }

    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
