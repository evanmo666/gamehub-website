class GameAdmin {
    constructor() {
        this.games = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilter = {
            search: '',
            category: ''
        };
        this.selectedGames = new Set();
        
        this.init();
    }

    async init() {
        // 检查登录状态
        if (localStorage.getItem('adminLoggedIn') !== 'true' && 
            sessionStorage.getItem('adminLoggedIn') !== 'true') {
            // 未登录，重定向到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        await this.loadData();
        this.setupEventListeners();
        this.renderStats();
        this.renderGames();
        this.setupSidebarNavigation();
    }

    // 数据加载和保存
    async loadData() {
        try {
            console.log("开始加载游戏数据...");
            
            // 尝试直接从index.html加载游戏数据
            try {
                const htmlResponse = await fetch('../index.html');
                const htmlContent = await htmlResponse.text();
                
                // 正则表达式更精确地匹配GAME_DATA数组
                const htmlDataMatch = htmlContent.match(/GAME_DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/);
                
                if (htmlDataMatch && htmlDataMatch[1]) {
                    console.log("从index.html找到了游戏数据");
                    try {
                        // 修复JSON格式问题
                        let jsonStr = htmlDataMatch[1].replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":');  // 确保键名有引号
                        
                        this.games = JSON.parse(jsonStr);
                        console.log(`从HTML加载了 ${this.games.length} 个游戏`);
                    } catch (jsonError) {
                        console.error("HTML数据JSON解析错误:", jsonError);
                        console.log("原始数据:", htmlDataMatch[1].substring(0, 200));
                        this.loadSampleData();
                    }
                } else {
                    console.log("在index.html中未找到游戏数据，尝试从script.js加载");
                    
                    // 备用方法：从script.js加载
                    const response = await fetch('../script.js');
                    const scriptContent = await response.text();
                    
                    // 从script.js中查找游戏数据数组
                    const gameDataMatch = scriptContent.match(/GAME_DATA\s*=\s*(\[\s*\{[\s\S]*?\}\s*\])/);
                    
                    if (gameDataMatch && gameDataMatch[1]) {
                        console.log("从script.js找到游戏数据");
                        try {
                            // 修复JSON格式
                            let jsonStr = gameDataMatch[1].replace(/'/g, '"')
                                .replace(/(\w+):/g, '"$1":');
                                
                            this.games = JSON.parse(jsonStr);
                            console.log(`成功从script.js加载 ${this.games.length} 个游戏`);
                        } catch (jsonError) {
                            console.error("Script数据JSON解析错误:", jsonError);
                            this.loadSampleData();
                        }
                    } else {
                        console.log("所有方法都失败，加载示例数据");
                        this.loadSampleData();
                    }
                }
            } catch (fetchError) {
                console.error("获取HTML内容失败:", fetchError);
                this.loadSampleData();
            }
            
            // 加载本地保存的管理数据
            const savedData = localStorage.getItem('gameAdminData');
            if (savedData) {
                const adminData = JSON.parse(savedData);
                this.mergeAdminData(adminData);
                console.log("已合并本地保存的管理数据");
            }
            
            this.categories = [...new Set(this.games.map(game => game.category))].sort();
            this.populateCategoryOptions();
            console.log(`加载了 ${this.categories.length} 个分类`);
            
        } catch (error) {
            console.error('数据加载失败:', error);
            this.showToast('Failed to load game data', 'error');
            // 加载失败时使用示例数据
            this.loadSampleData();
        }
    }

    // 加载示例游戏数据（当无法从文件加载时）
    loadSampleData() {
        console.log("加载示例游戏数据");
        this.games = [
            {
                title: "Sample Game 1",
                category: "Action",
                url: "https://example.com/game1",
                embed_url: "https://example.com/embed/game1",
                description: "This is a sample game for demonstration"
            },
            {
                title: "Sample Game 2",
                category: "Puzzle",
                url: "https://example.com/game2",
                embed_url: "https://example.com/embed/game2",
                description: "Another sample game for the admin panel"
            },
            {
                title: "Sample Game 3",
                category: "Racing",
                url: "https://example.com/game3",
                embed_url: "https://example.com/embed/game3",
                description: "A racing game example"
            },
            {
                title: "Sample Game 4",
                category: "Strategy",
                url: "https://example.com/game4",
                embed_url: "https://example.com/embed/game4",
                description: "A strategy game example"
            },
            {
                title: "Sample Game 5",
                category: "Featured",
                url: "https://example.com/game5",
                embed_url: "https://example.com/embed/game5",
                description: "A featured game example"
            }
        ];
        this.showToast('Loaded sample data for demonstration', 'info');
    }

    mergeAdminData(adminData) {
        if (adminData && adminData.games) {
            // 先合并现有游戏
            const existingGames = new Set(this.games.map(g => g.title));
            this.games = this.games.map(game => {
                const savedGame = adminData.games.find(g => g.title === game.title);
                return savedGame ? { ...game, ...savedGame } : game;
            });
            
            // 然后添加管理界面中独有的游戏
            const uniqueAdminGames = adminData.games.filter(g => !existingGames.has(g.title));
            if (uniqueAdminGames.length > 0) {
                console.log(`添加 ${uniqueAdminGames.length} 个管理员创建的游戏`);
                this.games = [...this.games, ...uniqueAdminGames];
            }
            
            // 更新分类列表
            if (this.games.length > 0) {
                this.categories = [...new Set(this.games.map(game => game.category))].filter(c => c).sort();
                console.log(`更新后的分类: ${this.categories.join(', ')}`);
            }
        }
    }

    saveData() {
        try {
            const adminData = {
                games: this.games,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('gameAdminData', JSON.stringify(adminData));
            this.showToast('Data saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showToast('Failed to save data', 'error');
        }
    }

    // 事件监听器设置
    setupEventListeners() {
        // 搜索和筛选
        document.getElementById('search-games').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.currentPage = 1;
            this.renderGames();
        });

        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value;
            this.currentPage = 1;
            this.renderGames();
        });

        // 全选功能
        document.getElementById('select-all-games').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // 游戏表单提交
        document.getElementById('game-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGame();
        });

        // 缩略图上传
        document.getElementById('game-thumbnail').addEventListener('change', (e) => {
            this.handleThumbnailUpload(e.target.files[0]);
        });

        // 缩略图预览点击
        document.getElementById('thumbnail-preview').addEventListener('click', () => {
            document.getElementById('game-thumbnail').click();
        });

        // SEO字符计数
        this.setupSEOCharacterCounting();

        // 批量上传方法切换
        this.setupBatchUploadMethods();

        // CSV文件上传
        this.setupCSVUpload();
    }

    setupSidebarNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
                
                // 更新活动状态
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchSection(section) {
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        // 显示目标区域
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 根据不同区域加载相应数据
        switch(section) {
            case 'games':
                this.renderGames();
                break;
            case 'categories':
                this.renderCategoriesGrid();
                break;
            case 'seo':
                this.renderSEODashboard();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // 游戏管理功能
    renderStats() {
        const totalGames = this.games.length;
        const totalCategories = this.categories.length;
        const featuredGames = this.games.filter(game => 
            game.featured === 'true' || game.category === 'Featured'
        ).length;

        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('total-categories').textContent = totalCategories;
        document.getElementById('featured-games').textContent = featuredGames;
    }

    renderGames() {
        const tbody = document.getElementById('games-table-body') || document.getElementById('gamesTableBody');
        if (!tbody) {
            console.error("找不到游戏表格主体元素");
            return;
        }
        
        // 检查是否有游戏数据
        if (!this.games || this.games.length === 0) {
            console.log("没有游戏数据可显示");
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="py-4">
                            <div class="mb-3">
                                <i class="fas fa-gamepad fa-3x text-muted"></i>
                            </div>
                            <h5>暂无游戏数据</h5>
                            <p class="text-muted">点击"添加游戏"按钮添加您的第一个游戏</p>
                            <button class="btn btn-primary mt-2" id="noDataAddGameBtn">
                                <i class="fas fa-plus"></i> 添加游戏
                            </button>
                        </div>
                    </td>
                </tr>`;
                
            // 添加按钮点击事件
            setTimeout(() => {
                const addBtn = document.getElementById('noDataAddGameBtn');
                if (addBtn) {
                    addBtn.addEventListener('click', () => this.showModal('gameModal'));
                }
            }, 100);
            
            return;
        }
        
        const filteredGames = this.getFilteredGames();
        
        // 检查过滤后是否有游戏
        if (filteredGames.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="py-3">
                            <i class="fas fa-search fa-2x text-muted mb-3"></i>
                            <p>没有找到符合筛选条件的游戏</p>
                            <button id="clearFiltersBtn" class="btn btn-sm btn-outline-secondary">
                                清除筛选条件
                            </button>
                        </div>
                    </td>
                </tr>`;
                
            // 添加按钮点击事件    
            setTimeout(() => {
                const clearBtn = document.getElementById('clearFiltersBtn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => this.clearFilters());
                }
            }, 100);
            
            return;
        }
        
        // 有游戏数据，正常显示
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedGames = filteredGames.slice(startIndex, endIndex);

        try {
            tbody.innerHTML = paginatedGames.map(game => this.createGameRow(game)).join('');
            
            // 更新分页信息
            this.updatePagination(filteredGames.length);
            
            // 添加行点击事件
            this.setupGameRowEvents();
        } catch (error) {
            console.error("渲染游戏表格出错:", error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">渲染游戏数据时出错</td></tr>`;
        }
    }

    getFilteredGames() {
        return this.games.filter(game => {
            const matchesSearch = !this.currentFilter.search || 
                game.title.toLowerCase().includes(this.currentFilter.search.toLowerCase());
            const matchesCategory = !this.currentFilter.category || 
                game.category === this.currentFilter.category;
            
            return matchesSearch && matchesCategory;
        });
    }

    createGameRow(game) {
        const seoScore = this.calculateSEOScore(game);
        const status = game.featured === 'true' || game.category === 'Featured' ? 'featured' : 'active';
        
        return `
            <tr data-game-id="${game.title}">
                <td>
                    <input type="checkbox" class="game-checkbox" value="${game.title}">
                </td>
                <td>
                    <div class="game-cell">
                        <div class="game-thumbnail-small">
                            ${game.thumbnail ? 
                                `<img src="${game.thumbnail}" alt="${game.title}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : 
                                this.getGameEmoji(game.category)
                            }
                        </div>
                        <div class="game-info">
                            <h4>${game.title}</h4>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="game-category-badge">${game.category}</span>
                </td>
                <td>
                    <span class="status-badge status-${status}">${status}</span>
                </td>
                <td>
                    <span class="seo-score ${seoScore.class}">${seoScore.score}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-sm" onclick="gameAdmin.editGame('${game.title.replace(/'/g, "\\'")}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="gameAdmin.deleteGame('${game.title.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getGameEmoji(category) {
        // 为不同分类返回不同的表情符号
        const emojiMap = {
            'Action': '🎮',
            'Adventure': '🏕️',
            'Arcade': '👾',
            'Board Games': '🎲',
            'Card Games': '🃏',
            'Casino': '🎰',
            'Casual': '🎯',
            'Educational': '🧠',
            'Music': '🎵',
            'Puzzle': '🧩',
            'Racing': '🏎️',
            'Role Playing': '🧙‍♂️',
            'Simulation': '🏗️',
            'Sports': '⚽',
            'Strategy': '♟️',
            'Trivia': '❓',
            'Word': '📝',
            'Uncategorized': '📦',
        };
        
        return emojiMap[category] || '🎮'; // 默认使用游戏手柄表情符号
    }

    calculateSEOScore(game) {
        let score = 0;
        let maxScore = 100;
        
        // 标题 (20分)
        if (game.title && game.title.length > 5) score += 20;
        
        // 描述 (25分)
        if (game.description && game.description.length > 50) score += 25;
        else if (game.description && game.description.length > 20) score += 15;
        
        // SEO标题 (20分)
        if (game.seo_title && game.seo_title.length > 30) score += 20;
        
        // SEO描述 (25分)
        if (game.seo_description && game.seo_description.length > 100) score += 25;
        else if (game.seo_description && game.seo_description.length > 50) score += 15;
        
        // 标签 (10分)
        if (game.tags && game.tags.split(',').length >= 3) score += 10;
        
        const percentage = Math.round((score / maxScore) * 100);
        
        let scoreClass, scoreText;
        if (percentage >= 80) {
            scoreClass = 'excellent';
            scoreText = 'A+';
        } else if (percentage >= 60) {
            scoreClass = 'good';
            scoreText = 'B';
        } else {
            scoreClass = 'poor';
            scoreText = 'C';
        }
        
        return { score: scoreText, class: scoreClass, percentage };
    }

    setupGameRowEvents() {
        // 复选框事件
        document.querySelectorAll('.game-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedGames.add(e.target.value);
                } else {
                    this.selectedGames.delete(e.target.value);
                }
                this.updateBulkActions();
            });
        });
    }

    updateBulkActions() {
        const selectedGames = document.querySelectorAll('.game-checkbox:checked');
        const bulkActions = document.getElementById('bulk-actions');
        const bulkCount = document.getElementById('bulk-count');
        
        if (bulkActions && bulkCount) {
            if (selectedGames.length > 0) {
                bulkActions.classList.add('active');
                bulkCount.textContent = selectedGames.length;
                
                // 添加批量修改分类的元素
                if (!document.getElementById('bulk-category-select')) {
                    // 创建批量分类修改下拉框
                    const categorySelect = document.createElement('select');
                    categorySelect.id = 'bulk-category-select';
                    categorySelect.className = 'bulk-category-select';
                    
                    // 添加默认选项
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Change Category';
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    categorySelect.appendChild(defaultOption);
                    
                    // 添加所有分类选项
                    this.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        categorySelect.appendChild(option);
                    });
                    
                    // 添加按钮
                    const applyButton = document.createElement('button');
                    applyButton.className = 'btn btn-primary btn-sm';
                    applyButton.textContent = 'Apply';
                    applyButton.addEventListener('click', () => {
                        const newCategory = categorySelect.value;
                        if (newCategory) {
                            this.updateSelectedGamesCategory(newCategory);
                            categorySelect.value = ''; // 重置选择
                        }
                    });
                    
                    // 添加到批量操作区域
                    const bulkCategoryContainer = document.createElement('div');
                    bulkCategoryContainer.className = 'bulk-category-container';
                    bulkCategoryContainer.appendChild(categorySelect);
                    bulkCategoryContainer.appendChild(applyButton);
                    
                    bulkActions.appendChild(bulkCategoryContainer);
                }
            } else {
                bulkActions.classList.remove('active');
                // 移除批量分类修改元素
                const bulkCategoryContainer = bulkActions.querySelector('.bulk-category-container');
                if (bulkCategoryContainer) {
                    bulkCategoryContainer.remove();
                }
            }
        }
    }
    
    // 批量更新游戏分类
    updateSelectedGamesCategory(newCategory) {
        const selectedGames = document.querySelectorAll('.game-checkbox:checked');
        const selectedTitles = Array.from(selectedGames).map(checkbox => checkbox.value);
        
        if (selectedTitles.length === 0) return;
        
        // 确认对话框
        if (confirm(`确定要将选中的 ${selectedTitles.length} 个游戏分类修改为 "${newCategory}" 吗？`)) {
            // 更新游戏分类
            let updateCount = 0;
            this.games = this.games.map(game => {
                if (selectedTitles.includes(game.title)) {
                    updateCount++;
                    return { ...game, category: newCategory };
                }
                return game;
            });
            
            // 保存数据
            this.saveData();
            
            // 更新UI
            this.renderGames();
            
            // 显示提示
            this.showToast(`已成功更新 ${updateCount} 个游戏的分类为 "${newCategory}"`, 'success');
            
            // 重置选择
            this.toggleSelectAll(false);
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.game-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedGames.add(checkbox.value);
            } else {
                this.selectedGames.delete(checkbox.value);
            }
        });
        this.updateBulkActions();
    }

    // 添加/编辑游戏
    editGame(title) {
        const game = this.games.find(g => g.title === title);
        if (!game) return;

        // 填充表单
        document.getElementById('game-id').value = title;
        document.getElementById('game-title').value = game.title;
        document.getElementById('game-category').value = game.category;
        document.getElementById('game-url').value = game.url || '';
        document.getElementById('game-embed-url').value = game.embed_url;
        document.getElementById('game-description').value = game.description || '';
        document.getElementById('game-tags').value = game.tags || '';
        document.getElementById('game-featured').value = game.featured || 'false';
        
        // SEO 字段
        document.getElementById('seo-title').value = game.seo_title || '';
        document.getElementById('seo-description').value = game.seo_description || '';
        document.getElementById('seo-keywords').value = game.seo_keywords || '';
        
        // 显示现有缩略图
        const preview = document.getElementById('thumbnail-preview');
        if (game.thumbnail) {
            preview.innerHTML = `<img src="${game.thumbnail}" alt="Thumbnail">`;
            preview.classList.add('has-image');
            this.thumbnailData = game.thumbnail;
        } else {
            preview.innerHTML = `<i class="fas fa-image"></i><span>Click to upload thumbnail</span>`;
            preview.classList.remove('has-image');
            this.thumbnailData = null;
        }

        // 更新模态框标题
        document.getElementById('game-modal-title').textContent = 'Edit Game';
        
        this.showModal('game-modal');
    }

    saveGame() {
        const formData = new FormData(document.getElementById('game-form'));
        const gameId = formData.get('id');
        
        const gameData = {
            title: formData.get('title'),
            category: formData.get('category'),
            url: formData.get('url'),
            embed_url: formData.get('embed_url'),
            description: formData.get('description'),
            tags: formData.get('tags'),
            featured: formData.get('featured'),
            seo_title: formData.get('seo_title'),
            seo_description: formData.get('seo_description'),
            seo_keywords: formData.get('seo_keywords')
        };
        
        // 添加缩略图数据
        if (this.thumbnailData) {
            gameData.thumbnail = this.thumbnailData;
        }

        if (gameId) {
            // 编辑现有游戏
            const index = this.games.findIndex(g => g.title === gameId);
            if (index !== -1) {
                this.games[index] = { ...this.games[index], ...gameData };
            }
        } else {
            // 添加新游戏
            this.games.push(gameData);
        }

        this.saveData();
        this.renderGames();
        this.renderStats();
        this.closeModal('game-modal');
        this.showToast('Game saved successfully', 'success');
        
        // 重置缩略图数据
        this.thumbnailData = null;
    }

    deleteGame(title) {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            this.games = this.games.filter(g => g.title !== title);
            this.saveData();
            this.renderGames();
            this.renderStats();
            this.showToast('Game deleted successfully', 'success');
        }
    }

    // SEO功能
    setupSEOCharacterCounting() {
        const seoTitle = document.getElementById('seo-title');
        const seoDescription = document.getElementById('seo-description');
        
        seoTitle.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('seo-title-count').textContent = count;
        });
        
        seoDescription.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('seo-description-count').textContent = count;
        });
    }

    renderSEODashboard() {
        const gamesWithSEO = this.games.filter(game => 
            game.seo_title && game.seo_description
        ).length;
        
        const missingDescriptions = this.games.filter(game => 
            !game.description || game.description.length < 50
        ).length;
        
        const seoPercentage = Math.round((gamesWithSEO / this.games.length) * 100);
        
        document.getElementById('games-with-seo').textContent = `${seoPercentage}%`;
        document.getElementById('missing-descriptions').textContent = missingDescriptions;
        
        // 生成SEO问题列表
        this.renderSEOIssues();
    }

    renderSEOIssues() {
        const issuesList = document.getElementById('seo-issues-list');
        const issues = [];
        
        this.games.forEach(game => {
            const gameIssues = [];
            
            if (!game.seo_title) gameIssues.push('Missing SEO title');
            if (!game.seo_description) gameIssues.push('Missing meta description');
            if (!game.description || game.description.length < 50) gameIssues.push('Description too short');
            if (!game.tags || game.tags.split(',').length < 3) gameIssues.push('Not enough tags');
            
            if (gameIssues.length > 0) {
                issues.push({
                    game: game.title,
                    issues: gameIssues
                });
            }
        });
        
        issuesList.innerHTML = issues.slice(0, 10).map(item => `
            <div class="seo-issue">
                <div>
                    <strong>${item.game}</strong><br>
                    <small>${item.issues.join(', ')}</small>
                </div>
                <button class="btn btn-outline btn-sm" onclick="gameAdmin.editGame('${item.game.replace(/'/g, "\\'")}')">
                    Fix Issues
                </button>
            </div>
        `).join('');
    }

    // 批量上传功能
    setupBatchUploadMethods() {
        const methods = document.querySelectorAll('.upload-method');
        methods.forEach(method => {
            method.addEventListener('click', () => {
                const targetMethod = method.dataset.method;
                
                // 更新活动状态
                methods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                // 切换上传区域
                document.querySelectorAll('.upload-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(`${targetMethod}-upload`).classList.add('active');
            });
        });
    }

    setupCSVUpload() {
        const csvFile = document.getElementById('csv-file');
        const dropzone = document.getElementById('csv-dropzone');
        
        // 点击上传
        dropzone.addEventListener('click', () => {
            csvFile.click();
        });
        
        // 文件选择
        csvFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleCSVFile(e.target.files[0]);
            }
        });
        
        // 拖拽上传
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const files = e.dataTransfer.files;
            if (files[0] && files[0].name.endsWith('.csv')) {
                this.handleCSVFile(files[0]);
            }
        });
    }

    handleCSVFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const games = this.parseCSV(csv);
            this.previewCSVData(games);
        };
        reader.readAsText(file);
    }

    parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const games = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const game = {};
                
                headers.forEach((header, index) => {
                    game[header] = values[index] || '';
                });
                
                games.push(game);
            }
        }
        
        return games;
    }

    previewCSVData(games) {
        const preview = document.getElementById('csv-preview');
        const table = document.getElementById('csv-preview-table');
        const countSpan = document.getElementById('preview-count');
        
        if (games.length === 0) {
            this.showToast('No valid data found in CSV', 'error');
            return;
        }
        
        countSpan.textContent = games.length;
        
        // 生成表头
        const headers = Object.keys(games[0]);
        const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        
        // 生成数据行 (只显示前10行)
        const dataRows = games.slice(0, 10).map(game => 
            `<tr>${headers.map(h => `<td>${game[h] || ''}</td>`).join('')}</tr>`
        ).join('');
        
        table.innerHTML = `<thead>${headerRow}</thead><tbody>${dataRows}</tbody>`;
        preview.style.display = 'block';
        
        // 保存数据供后续处理
        this.pendingGames = games;
    }

    // 批量处理
    processBatchUpload() {
        const activeMethod = document.querySelector('.upload-method.active').dataset.method;
        
        if (activeMethod === 'csv' && this.pendingGames) {
            this.processBatchGames(this.pendingGames);
        } else if (activeMethod === 'json') {
            const jsonInput = document.getElementById('json-input').value;
            try {
                const games = JSON.parse(jsonInput);
                this.processBatchGames(games);
            } catch (error) {
                this.showToast('Invalid JSON format', 'error');
                return;
            }
        }
    }

    processBatchGames(newGames) {
        this.showLoading();
        
        let addedCount = 0;
        let updatedCount = 0;
        
        newGames.forEach(newGame => {
            const existingIndex = this.games.findIndex(g => g.title === newGame.title);
            
            if (existingIndex !== -1) {
                // 更新现有游戏
                this.games[existingIndex] = { ...this.games[existingIndex], ...newGame };
                updatedCount++;
            } else {
                // 添加新游戏
                this.games.push(newGame);
                addedCount++;
            }
        });
        
        this.saveData();
        this.renderGames();
        this.renderStats();
        this.hideLoading();
        this.closeModal('batch-upload-modal');
        
        this.showToast(`Batch upload completed: ${addedCount} added, ${updatedCount} updated`, 'success');
    }

    // 数据导出
    exportData() {
        const dataStr = JSON.stringify(this.games, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `games-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Data exported successfully', 'success');
    }

    // 实用工具函数
    populateCategoryOptions() {
        const selects = ['game-category', 'filter-category'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = selectId === 'filter-category' ? 
                    '<option value="">All Categories</option>' : 
                    '<option value="">Select Category</option>';
                
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
                
                select.value = currentValue;
            }
        });
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // 更新分页信息
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        
        document.getElementById('showing-start').textContent = startItem;
        document.getElementById('showing-end').textContent = endItem;
        document.getElementById('total-items').textContent = totalItems;
        
        // 更新分页按钮
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
        
        // 生成页码
        this.generatePageNumbers(totalPages);
    }

    generatePageNumbers(totalPages) {
        const container = document.getElementById('page-numbers');
        container.innerHTML = '';
        
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.onclick = () => this.changePage(i);
            container.appendChild(button);
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.renderGames();
    }

    // 模态框和UI控制
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // 重置表单
        if (modalId === 'game-modal') {
            document.getElementById('game-form').reset();
            document.getElementById('game-id').value = '';
            document.getElementById('game-modal-title').textContent = 'Add New Game';
            
            // 重置缩略图预览
            const preview = document.getElementById('thumbnail-preview');
            if (preview) {
                preview.innerHTML = `<i class="fas fa-image"></i><span>Click to upload thumbnail</span>`;
                preview.classList.remove('has-image');
            }
            // 重置缩略图数据
            this.thumbnailData = null;
        }
    }

    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} toast-icon"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // 缩略图处理
    handleThumbnailUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('thumbnail-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail">`;
            preview.classList.add('has-image');
            
            // 存储缩略图数据，以便稍后保存
            this.thumbnailData = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    generateThumbnail() {
        const title = document.getElementById('game-title').value;
        const category = document.getElementById('game-category').value;
        
        if (!title) {
            this.showToast('Please enter a game title first', 'error');
            return;
        }
        
        // 生成渐变色缩略图
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];
        
        const colorIndex = Math.abs(title.charCodeAt(0)) % colors.length;
        const emoji = this.getGameEmoji(category);
        
        const preview = document.getElementById('thumbnail-preview');
        preview.innerHTML = `
            <div style="width: 100%; height: 100%; background: ${colors[colorIndex]}; 
                        display: flex; align-items: center; justify-content: center; 
                        font-size: 3rem; border-radius: 8px;">
                ${emoji}
            </div>
        `;
        preview.classList.add('has-image');
        
        this.showToast('Thumbnail generated successfully', 'success');
    }

    // 模板下载
    downloadTemplate() {
        const csvContent = 'title,category,url,embed_url,description,tags,featured\n' +
                          'Example Game,Action,https://example.com,https://example.com/embed,Game description,action,false\n';
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'games-template.csv';
        link.click();
    }

    // 其他功能
    clearFilters() {
        document.getElementById('search-games').value = '';
        document.getElementById('filter-category').value = '';
        this.currentFilter = { search: '', category: '' };
        this.currentPage = 1;
        this.renderGames();
    }

    previewSite() {
        window.open('../index.html', '_blank');
    }

    renderCategoriesGrid() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;
        
        // 统计每个分类的游戏数量
        const categoryCounts = {};
        this.categories.forEach(category => {
            categoryCounts[category] = this.games.filter(game => game.category === category).length;
        });
        
        // 创建分类卡片
        categoriesGrid.innerHTML = this.categories.map(category => {
            const gameCount = categoryCounts[category] || 0;
            const emoji = this.getGameEmoji(category);
            
            return `
                <div class="category-card">
                    <div class="category-card-header">
                        <div class="category-emoji">${emoji}</div>
                        <div class="category-actions">
                            <button class="btn btn-outline btn-sm" onclick="gameAdmin.editCategory('${category.replace(/'/g, "\\'")}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="gameAdmin.deleteCategory('${category.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="category-name">${category}</h3>
                    <div class="category-stats">
                        <span class="category-count">${gameCount} games</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加"添加新分类"卡片
        categoriesGrid.innerHTML += `
            <div class="category-card add-category" onclick="showAddCategoryModal()">
                <div class="add-category-content">
                    <i class="fas fa-plus-circle"></i>
                    <span>Add New Category</span>
                </div>
            </div>
        `;
    }
    
    editCategory(categoryName) {
        document.getElementById('category-id').value = categoryName;
        document.getElementById('category-name').value = categoryName;
        document.getElementById('category-modal-title').textContent = 'Edit Category';
        
        this.showModal('category-modal');
    }
    
    saveCategory() {
        const categoryId = document.getElementById('category-id').value;
        const newCategoryName = document.getElementById('category-name').value.trim();
        
        if (!newCategoryName) {
            this.showToast('Category name cannot be empty', 'error');
            return;
        }
        
        if (categoryId) {
            // 编辑现有分类
            if (categoryId !== newCategoryName) {
                // 更新游戏中的分类名称
                this.games = this.games.map(game => {
                    if (game.category === categoryId) {
                        return { ...game, category: newCategoryName };
                    }
                    return game;
                });
                
                // 更新分类列表
                const index = this.categories.indexOf(categoryId);
                if (index !== -1) {
                    this.categories[index] = newCategoryName;
                }
                
                this.saveData();
                this.showToast('Category updated successfully', 'success');
            }
        } else {
            // 添加新分类
            if (this.categories.includes(newCategoryName)) {
                this.showToast('Category already exists', 'error');
                return;
            }
            
            this.categories.push(newCategoryName);
            this.saveData();
            this.showToast('Category added successfully', 'success');
        }
        
        // 更新UI
        this.renderCategoriesGrid();
        this.populateCategoryOptions();
        this.closeModal('category-modal');
    }
    
    deleteCategory(categoryName) {
        if (confirm(`Are you sure you want to delete "${categoryName}"?\nThis will NOT delete games in this category.`)) {
            // 从分类列表中删除
            this.categories = this.categories.filter(c => c !== categoryName);
            
            // 更新游戏分类（可选择默认分类或保留原有分类）
            if (confirm(`Would you like to reassign games in "${categoryName}" to another category?\nClick OK to reassign or Cancel to keep original category.`)) {
                const defaultCategory = 'Uncategorized';
                
                // 如果需要默认分类但不存在，添加它
                if (!this.categories.includes(defaultCategory)) {
                    this.categories.push(defaultCategory);
                }
                
                // 更新游戏分类
                this.games = this.games.map(game => {
                    if (game.category === categoryName) {
                        return { ...game, category: defaultCategory };
                    }
                    return game;
                });
            }
            
            this.saveData();
            this.renderCategoriesGrid();
            this.populateCategoryOptions();
            this.showToast('Category deleted successfully', 'success');
        }
    }

    // 批量更新游戏为特色或非特色
    bulkFeatureGames(titles, isFeatured) {
        if (titles.length === 0) return;
        
        let updateCount = 0;
        this.games = this.games.map(game => {
            if (titles.includes(game.title)) {
                updateCount++;
                return {
                    ...game,
                    featured: isFeatured ? 'true' : 'false',
                    category: isFeatured ? 'Featured' : (game.category === 'Featured' ? 'Uncategorized' : game.category)
                };
            }
            return game;
        });
        
        // 保存数据
        this.saveData();
        
        // 更新UI
        this.renderGames();
        this.renderStats();
        
        // 显示提示
        const message = isFeatured
            ? `已将 ${updateCount} 个游戏设为特色`
            : `已将 ${updateCount} 个游戏移出特色`;
        this.showToast(message, 'success');
        
        // 重置选择
        this.toggleSelectAll(false);
    }
    
    // 批量删除游戏
    bulkDeleteGames(titles) {
        if (titles.length === 0) return;
        
        const initialCount = this.games.length;
        this.games = this.games.filter(game => !titles.includes(game.title));
        const deleteCount = initialCount - this.games.length;
        
        // 保存数据
        this.saveData();
        
        // 更新UI
        this.renderGames();
        this.renderStats();
        
        // 显示提示
        this.showToast(`已删除 ${deleteCount} 个游戏`, 'success');
        
        // 重置选择
        this.toggleSelectAll(false);
    }
}

// 全局函数
function showAddGameModal() {
    gameAdmin.showModal('game-modal');
}

function showBatchUploadModal() {
    gameAdmin.showModal('batch-upload-modal');
}

function closeModal(modalId) {
    gameAdmin.closeModal(modalId);
}

function exportData() {
    gameAdmin.exportData();
}

function changePage(direction) {
    if (direction === 'prev' && gameAdmin.currentPage > 1) {
        gameAdmin.currentPage--;
    } else if (direction === 'next') {
        gameAdmin.currentPage++;
    }
    gameAdmin.renderGames();
}

function generateThumbnail() {
    gameAdmin.generateThumbnail();
}

function downloadTemplate() {
    gameAdmin.downloadTemplate();
}

function validateJSON() {
    const jsonInput = document.getElementById('json-input').value;
    try {
        JSON.parse(jsonInput);
        gameAdmin.showToast('JSON is valid', 'success');
    } catch (error) {
        gameAdmin.showToast('Invalid JSON format', 'error');
    }
}

function formatJSON() {
    const jsonInput = document.getElementById('json-input');
    try {
        const parsed = JSON.parse(jsonInput.value);
        jsonInput.value = JSON.stringify(parsed, null, 2);
        gameAdmin.showToast('JSON formatted', 'success');
    } catch (error) {
        gameAdmin.showToast('Invalid JSON format', 'error');
    }
}

function processBatchUpload() {
    gameAdmin.processBatchUpload();
}

function previewSite() {
    gameAdmin.previewSite();
}

function logoutAdmin() {
    // 清除登录状态
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoggedIn');
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

function showAddCategoryModal() {
    document.getElementById('category-id').value = '';
    document.getElementById('category-name').value = '';
    document.getElementById('category-modal-title').textContent = 'Add New Category';
    
    gameAdmin.showModal('category-modal');
}

function saveCategory() {
    gameAdmin.saveCategory();
}

function bulkAction(action) {
    const selectedGames = document.querySelectorAll('.game-checkbox:checked');
    const selectedTitles = Array.from(selectedGames).map(checkbox => checkbox.value);
    
    if (selectedTitles.length === 0) {
        gameAdmin.showToast('No games selected', 'error');
        return;
    }
    
    switch (action) {
        case 'feature':
            if (confirm(`Set ${selectedTitles.length} games as featured?`)) {
                gameAdmin.bulkFeatureGames(selectedTitles, true);
            }
            break;
        case 'unfeature':
            if (confirm(`Remove ${selectedTitles.length} games from featured?`)) {
                gameAdmin.bulkFeatureGames(selectedTitles, false);
            }
            break;
        case 'delete':
            if (confirm(`Are you sure you want to delete ${selectedTitles.length} games? This cannot be undone.`)) {
                gameAdmin.bulkDeleteGames(selectedTitles);
            }
            break;
    }
}

// 初始化
let gameAdmin;
document.addEventListener('DOMContentLoaded', () => {
    gameAdmin = new GameAdmin();
}); 