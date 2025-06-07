// 游戏数据同步脚本
// 负责确保管理后台的游戏数据更新同步到前端网站

(function() {
    // 在页面加载时执行
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 启动游戏数据同步...');
        
        // 检查管理后台数据 (adminGames)
        const adminGames = localStorage.getItem('adminGames');
        if (!adminGames) {
            console.log('⚠️ 没有发现管理后台数据');
            return;
        }
        
        try {
            // 将管理后台数据转换为gameAdminData格式
            const games = JSON.parse(adminGames);
            if (!Array.isArray(games)) {
                console.log('❌ 管理后台数据格式错误');
                return;
            }
            
            // 检查前端存储键是否存在
            const gameAdminData = localStorage.getItem('gameAdminData');
            if (gameAdminData) {
                // 检查是否需要更新
                const adminData = JSON.parse(gameAdminData);
                if (adminData.games && adminData.games.length >= games.length) {
                    console.log('✅ 前端数据已是最新');
                    
                    // 检查缩略图数量
                    const gamesWithThumbnail = adminData.games.filter(g => g.thumbnail).length;
                    console.log(`📊 带有自定义缩略图的游戏数量: ${gamesWithThumbnail}`);
                    return;
                }
            }
            
            // 需要更新前端数据
            localStorage.setItem('gameAdminData', JSON.stringify({
                games: games,
                lastUpdated: new Date().toISOString()
            }));
            
            // 计算带有缩略图的游戏数量
            const gamesWithThumbnail = games.filter(g => g.thumbnail).length;
            
            console.log(`🔄 已同步 ${games.length} 个游戏到前端数据`);
            console.log(`📊 带有自定义缩略图的游戏数量: ${gamesWithThumbnail}`);
            
            // 显示通知
            if (window.gameWebsite && typeof window.gameWebsite.showToast === 'function') {
                window.gameWebsite.showToast(`已更新 ${games.length} 个游戏数据，包含 ${gamesWithThumbnail} 个自定义缩略图`, 'success');
            } else {
                // 页面加载完成后尝试显示提示
                setTimeout(() => {
                    if (window.gameWebsite && typeof window.gameWebsite.showToast === 'function') {
                        window.gameWebsite.showToast(`已更新 ${games.length} 个游戏数据，包含 ${gamesWithThumbnail} 个自定义缩略图`, 'success');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('同步游戏数据时出错:', error);
        }
    });
})(); 