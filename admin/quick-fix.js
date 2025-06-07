// 快速修复管理面板问题
(function() {
    console.log("正在修复管理面板...");
    
    // 修复数据加载问题
    window.fixAdminPanel = async function() {
        // 1. 确保全局变量存在
        window.gameWebsite = window.gameWebsite || {};
        window.gameWebsite.games = window.gameWebsite.games || [];
        
        // 2. 加载游戏数据
        try {
            // 尝试从HTML获取
            const response = await fetch('../index.html');
            const html = await response.text();
            const dataMatch = html.match(/const\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/);
            
            if (dataMatch && dataMatch[1]) {
                try {
                    let jsonStr = dataMatch[1]
                        .replace(/'/g, '"')
                        .replace(/(\w+):/g, '"$1":');
                        
                    const games = JSON.parse(jsonStr);
                    console.log(`成功加载 ${games.length} 个游戏`);
                    
                    window.gameWebsite.games = games;
                    updateUI(games);
                    return;
                } catch (e) {
                    console.error("JSON解析错误:", e);
                }
            }
            
            // 尝试从script.js获取
            const jsResponse = await fetch('../script.js');
            const js = await jsResponse.text();
            const jsMatch = js.match(/const\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/);
            
            if (jsMatch && jsMatch[1]) {
                try {
                    let jsonStr = jsMatch[1]
                        .replace(/'/g, '"')
                        .replace(/(\w+):/g, '"$1":');
                        
                    const games = JSON.parse(jsonStr);
                    console.log(`从script.js加载了 ${games.length} 个游戏`);
                    
                    window.gameWebsite.games = games;
                    updateUI(games);
                    return;
                } catch (e) {
                    console.error("JS解析错误:", e);
                }
            }
            
            // 无法加载，使用示例数据
            const sampleGames = [
                {
                    title: "Mini Cars Racing",
                    category: "Racing",
                    url: "https://example.com/game1",
                    embed_url: "https://example.com/embed/game1"
                },
                {
                    title: "Pyramid Solitaire",
                    category: "Card",
                    url: "https://example.com/game2",
                    embed_url: "https://example.com/embed/game2"
                },
                {
                    title: "Solitaire",
                    category: "Card",
                    url: "https://example.com/game3",
                    embed_url: "https://example.com/embed/game3"
                }
            ];
            
            window.gameWebsite.games = sampleGames;
            updateUI(sampleGames);
            
        } catch (error) {
            console.error("加载失败:", error);
            alert("加载游戏数据失败，请刷新页面重试");
        }
    };
    
    // 更新UI
    function updateUI(games) {
        // 更新统计信息
        document.getElementById('totalGamesCount').textContent = games.length;
        
        // 提取分类
        const categories = [...new Set(games.map(g => g.category).filter(c => c))];
        document.getElementById('totalCategoriesCount').textContent = categories.length;
        
        // 计算精选游戏
        const featured = games.filter(g => g.featured || g.category === 'Featured').length;
        document.getElementById('featuredGamesCount').textContent = featured || 0;
        
        // 更新游戏表格
        updateGameTable(games);
    }
    
    // 更新游戏表格
    function updateGameTable(games) {
        const tableBody = document.getElementById('gamesTableBody');
        if (!tableBody) {
            console.error("找不到游戏表格");
            return;
        }
        
        if (!games || games.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="mb-3">
                        <i class="fas fa-gamepad fa-3x text-muted"></i>
                    </div>
                    <h5>暂无游戏数据</h5>
                    <p class="text-muted">点击"添加游戏"按钮添加您的第一个游戏</p>
                </div>
            </tr>`;
            return;
        }
        
        tableBody.innerHTML = games.map(game => `
        <tr>
            <td>
                <input type="checkbox" class="game-checkbox" value="${game.title}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="game-thumbnail me-2">
                        <img src="${game.thumbnail || 'https://via.placeholder.com/50'}" alt="${game.title}" width="50">
                    </div>
                    <div>
                        <div class="fw-bold">${game.title}</div>
                        <small class="text-muted">${game.category || 'Uncategorized'}</small>
                    </div>
                </div>
            </td>
            <td>${game.category || 'Uncategorized'}</td>
            <td>
                <a href="${game.url || '#'}" target="_blank" class="text-truncate d-inline-block" style="max-width:200px">
                    ${game.url || 'No URL'}
                </a>
            </td>
            <td>
                <span class="badge ${game.featured ? 'bg-warning' : 'bg-success'}">
                    ${game.featured ? '精选' : '上线'}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-game" data-title="${game.title}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-game" data-title="${game.title}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
    }
    
    // 立即执行修复
    window.fixAdminPanel();
    
    console.log("修复完成，如果页面仍然没有显示游戏数据，请刷新页面重试");
})(); 