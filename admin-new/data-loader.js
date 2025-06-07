/**
 * GameHub数据加载器
 * 用于从HTML文件中提取游戏数据
 */

// 立即执行函数，避免变量污染全局作用域
(function() {
    // 在全局范围内创建游戏数据变量
    if (!window.GAME_DATA) {
        window.GAME_DATA = [];
    }
    
    // 主加载函数
    async function loadGameData() {
        console.log('数据加载器: 开始加载游戏数据');
        
        try {
            // 尝试从localStorage获取缓存数据
            const cachedData = localStorage.getItem('gameData');
            if (cachedData) {
                try {
                    const data = JSON.parse(cachedData);
                    if (data && data.length > 0) {
                        window.GAME_DATA = data;
                        console.log(`数据加载器: 从缓存加载了 ${data.length} 个游戏`);
                        return;
                    }
                } catch (e) {
                    console.error('数据加载器: 解析缓存数据失败', e);
                }
            }
            
            // 从HTML文件加载
            const response = await fetch('../index.html');
            const html = await response.text();
            
            // 尝试多种模式匹配游戏数据
            const patterns = [
                /window\.GAME_DATA\s*=\s*(\[[\s\S]*?\]);/,
                /GAME_DATA\s*=\s*(\[[\s\S]*?\]);/,
                /const\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/,
                /var\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/
            ];
            
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    try {
                        let jsonStr = match[1]
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":')
                            .replace(/,\s*]/g, ']');
                            
                        const games = JSON.parse(jsonStr);
                        window.GAME_DATA = games;
                        
                        // 缓存到localStorage
                        localStorage.setItem('gameData', JSON.stringify(games));
                        
                        console.log(`数据加载器: 从HTML加载了 ${games.length} 个游戏`);
                        return;
                    } catch (e) {
                        console.error(`数据加载器: 解析数据失败 (${pattern})`, e);
                    }
                }
            }
            
            // 如果上述方法都失败，尝试直接查找游戏数组
            const arrayStart = html.match(/\[\s*{\s*["']title["']:/);
            if (arrayStart) {
                const startIdx = arrayStart.index;
                let bracketCount = 0;
                let inQuote = false;
                let quoteChar = null;
                let endIdx = -1;
                
                for (let i = startIdx; i < html.length; i++) {
                    const char = html[i];
                    
                    if (char === '"' || char === "'") {
                        if (!inQuote) {
                            inQuote = true;
                            quoteChar = char;
                        } else if (char === quoteChar) {
                            inQuote = false;
                        }
                    }
                    
                    if (!inQuote) {
                        if (char === '[') bracketCount++;
                        if (char === ']') {
                            bracketCount--;
                            if (bracketCount === 0) {
                                endIdx = i + 1;
                                break;
                            }
                        }
                    }
                }
                
                if (endIdx > startIdx) {
                    try {
                        const jsonData = html.substring(startIdx, endIdx);
                        let cleanedJson = jsonData
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":')
                            .replace(/,\s*]/g, ']');
                            
                        const games = JSON.parse(cleanedJson);
                        window.GAME_DATA = games;
                        
                        // 缓存到localStorage
                        localStorage.setItem('gameData', JSON.stringify(games));
                        
                        console.log(`数据加载器: 从HTML原始数据中提取了 ${games.length} 个游戏`);
                        return;
                    } catch (e) {
                        console.error('数据加载器: 解析原始数据失败', e);
                    }
                }
            }
            
            console.error('数据加载器: 未能从HTML中找到游戏数据');
            
        } catch (error) {
            console.error('数据加载器: 加载失败', error);
        }
    }
    
    // 创建脚本加载完成事件
    const scriptLoaded = new CustomEvent('gameDataScriptLoaded');
    
    // 加载数据并通知
    loadGameData().then(() => {
        console.log('数据加载器: 完成加载');
        document.dispatchEvent(scriptLoaded);
    });
    
})(); 