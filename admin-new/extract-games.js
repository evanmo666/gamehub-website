/**
 * 游戏数据提取工具
 * 直接从HTML源码提取游戏数据并保存
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const outputDiv = document.getElementById('extractOutput') || document.createElement('div');
    outputDiv.id = 'extractOutput';
    outputDiv.style.padding = '15px';
    outputDiv.style.margin = '20px 0';
    outputDiv.style.backgroundColor = '#f5f5f5';
    outputDiv.style.borderRadius = '5px';
    outputDiv.style.fontFamily = 'monospace';
    outputDiv.style.maxHeight = '300px';
    outputDiv.style.overflow = 'auto';
    
    if (!document.body.contains(outputDiv)) {
        document.body.insertBefore(outputDiv, document.body.firstChild);
    }
    
    // 添加按钮区域
    const btnContainer = document.createElement('div');
    btnContainer.className = 'd-flex gap-2 mb-3';
    
    // 提取按钮
    const extractBtn = document.createElement('button');
    extractBtn.textContent = '提取游戏数据';
    extractBtn.className = 'btn btn-primary';
    extractBtn.addEventListener('click', function() {
        // 显示加载指示器
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        
        extractBtn.disabled = true;
        extractBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>提取中...';
        
        // 清空输出区域
        outputDiv.innerHTML = '';
        
        // 开始提取
        extractGameData().finally(() => {
            extractBtn.disabled = false;
            extractBtn.textContent = '重新提取游戏数据';
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        });
    });
    
    // 清除按钮
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '清除缓存数据';
    clearBtn.className = 'btn btn-danger';
    clearBtn.addEventListener('click', function() {
        localStorage.removeItem('gameData');
        localStorage.removeItem('gameAdminData');
        log('已清除缓存数据，请重新提取');
    });
    
    // 返回按钮
    const backBtn = document.createElement('a');
    backBtn.textContent = '返回管理后台';
    backBtn.className = 'btn btn-outline-secondary ms-auto';
    backBtn.href = 'index.html';
    
    btnContainer.appendChild(extractBtn);
    btnContainer.appendChild(clearBtn);
    btnContainer.appendChild(backBtn);
    
    // 如果页面中已有输出div，则在其前添加按钮
    if (document.getElementById('extractOutput')) {
        outputDiv.parentNode.insertBefore(btnContainer, outputDiv);
    } else {
        // 否则添加到页面顶部
        document.body.insertBefore(btnContainer, document.body.firstChild);
    }
    
    // 自动开始提取
    log('游戏数据提取工具启动...');
    
    // 显示加载指示器
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    
    extractBtn.disabled = true;
    extractBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>提取中...';
    
    extractGameData().finally(() => {
        extractBtn.disabled = false;
        extractBtn.textContent = '重新提取游戏数据';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    });
    
    // 记录日志的函数
    function log(message) {
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        outputDiv.appendChild(line);
        outputDiv.scrollTop = outputDiv.scrollHeight;
        console.log(message);
    }
    
    // 提取游戏数据
    async function extractGameData() {
        log('开始提取游戏数据...');
        
        try {
            // 获取首页HTML内容
            const response = await fetch('../index.html');
            if (!response.ok) {
                throw new Error(`获取HTML失败: ${response.status}`);
            }
            
            const html = await response.text();
            log(`获取到HTML: ${(html.length / 1024).toFixed(2)}KB`);
            
            // 查找游戏数据起始位置
            const scriptStartIndex = html.indexOf('window.GAME_DATA = [');
            if (scriptStartIndex !== -1) {
                log('找到window.GAME_DATA数组');
                
                // 提取数据数组
                let bracketCount = 0;
                let inQuote = false;
                let quoteChar = '';
                let startIndex = html.indexOf('[', scriptStartIndex);
                let endIndex = -1;
                
                for (let i = startIndex; i < html.length; i++) {
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
                                endIndex = i + 1;
                                break;
                            }
                        }
                    }
                }
                
                if (endIndex > startIndex) {
                    const dataStr = html.substring(startIndex, endIndex);
                    log(`提取到数据: ${(dataStr.length / 1024).toFixed(2)}KB`);
                    
                    try {
                        // 清理并解析JSON
                        const cleanData = dataStr
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":')
                            .replace(/,\s*]/g, ']');
                            
                        const games = JSON.parse(cleanData);
                        log(`成功解析: ${games.length}个游戏`);
                        
                        // 保存到localStorage
                        localStorage.setItem('gameData', JSON.stringify(games));
                        
                        // 同时保存到管理面板数据
                        const adminData = {
                            games: games,
                            lastUpdated: new Date().toISOString()
                        };
                        localStorage.setItem('gameAdminData', JSON.stringify(adminData));
                        
                        log('数据已保存到localStorage');
                        log(`示例游戏: ${games[0].title} (${games[0].category})`);
                        
                        // 定义全局变量
                        window.GAME_DATA = games;
                        
                        // 显示成功消息
                        const successMessage = document.createElement('div');
                        successMessage.className = 'alert alert-success mt-3';
                        successMessage.innerHTML = `
                            <h5>✅ 提取成功!</h5>
                            <p>共获取到 ${games.length} 个游戏。您现在可以:</p>
                            <a href="index.html" class="btn btn-success btn-sm">返回管理后台查看游戏列表</a>
                        `;
                        outputDiv.parentNode.appendChild(successMessage);
                        
                        log('✅ 提取完成! 共获取到 '+games.length+' 个游戏');
                        log('请刷新管理面板页面查看游戏列表');
                        
                        return games;
                    } catch (e) {
                        log(`❌ 解析JSON失败: ${e.message}`);
                    }
                } else {
                    log('❌ 无法找到数据数组结束位置');
                }
            } else {
                log('❌ 未找到window.GAME_DATA');
                
                // 尝试直接查找游戏数组
                const arrayPattern = /\[\s*{\s*"title":|"category":|"url":/;
                const arrayMatch = html.match(arrayPattern);
                
                if (arrayMatch) {
                    log('找到可能的游戏数组');
                    const startPos = arrayMatch.index;
                    
                    // 查找数组结束位置
                    let bracketCount = 0;
                    let inQuote = false;
                    let endPos = -1;
                    
                    for (let i = startPos; i < html.length; i++) {
                        const char = html[i];
                        
                        if (char === '"') {
                            inQuote = !inQuote;
                        }
                        
                        if (!inQuote) {
                            if (char === '[') bracketCount++;
                            if (char === ']') {
                                bracketCount--;
                                if (bracketCount === 0) {
                                    endPos = i + 1;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (endPos > startPos) {
                        const jsonData = html.substring(startPos, endPos);
                        log(`找到疑似游戏数据: ${(jsonData.length / 1024).toFixed(2)}KB`);
                        
                        try {
                            const games = JSON.parse(jsonData);
                            log(`成功解析: ${games.length}个游戏`);
                            
                            // 保存到localStorage
                            localStorage.setItem('gameData', JSON.stringify(games));
                            
                            // 同时保存到管理面板数据
                            const adminData = {
                                games: games,
                                lastUpdated: new Date().toISOString()
                            };
                            localStorage.setItem('gameAdminData', JSON.stringify(adminData));
                            
                            log('数据已保存到localStorage');
                            
                            // 定义全局变量
                            window.GAME_DATA = games;
                            
                            // 显示成功消息
                            const successMessage = document.createElement('div');
                            successMessage.className = 'alert alert-success mt-3';
                            successMessage.innerHTML = `
                                <h5>✅ 提取成功!</h5>
                                <p>共获取到 ${games.length} 个游戏。您现在可以:</p>
                                <a href="index.html" class="btn btn-success btn-sm">返回管理后台查看游戏列表</a>
                            `;
                            outputDiv.parentNode.appendChild(successMessage);
                            
                            log('✅ 提取完成! 共获取到 '+games.length+' 个游戏');
                            log('请刷新管理面板页面查看游戏列表');
                            
                            return games;
                        } catch (e) {
                            log(`❌ 解析JSON失败: ${e.message}`);
                        }
                    }
                }
            }
        } catch (error) {
            log(`❌ 提取失败: ${error.message}`);
        }
        
        log('尝试从localStorage获取数据...');
        const cachedData = localStorage.getItem('gameData');
        if (cachedData) {
            try {
                const games = JSON.parse(cachedData);
                log(`从缓存中读取到 ${games.length} 个游戏`);
                window.GAME_DATA = games;
                return games;
            } catch (e) {
                log(`❌ 解析缓存数据失败: ${e.message}`);
            }
        }
        
        // 显示失败消息
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger mt-3';
        errorMessage.innerHTML = `
            <h5>❌ 提取失败</h5>
            <p>无法获取游戏数据。请尝试以下方法:</p>
            <ol>
                <li>确保您能够访问网站首页</li>
                <li>检查浏览器控制台是否有错误</li>
                <li>清除浏览器缓存后重试</li>
            </ol>
        `;
        outputDiv.parentNode.appendChild(errorMessage);
        
        log('❌ 无法获取游戏数据');
        return null;
    }
}); 