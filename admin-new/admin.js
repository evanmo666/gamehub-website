/**
 * GameHub 简易管理后台
 * 独立式JavaScript文件，减少外部依赖
 */

// 初始化管理面板
document.addEventListener('DOMContentLoaded', function() {
    const adminPanel = new AdminPanel();
    adminPanel.init();
});

class AdminPanel {
    constructor() {
        this.games = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSection = 'dashboard';
        this.selectedGames = new Set();
        this.settings = {
            siteTitle: 'GameHub - 在线游戏平台',
            siteDescription: '免费在线游戏平台，提供多种类型的网页游戏',
            siteKeywords: '游戏,在线游戏,免费游戏,网页游戏',
            gamesPerPage: 12
        };
    }

    // 初始化
    init() {
        console.log('初始化管理面板...');
        this.loadData();
        this.setupEventListeners();
        this.setupSidebar();
    }

    // 加载数据
    async loadData() {
        try {
            console.log('加载游戏数据...');
            this.showLoading();
            
            // 1. 尝试从window.gameWebsite获取数据
            if (window.gameWebsite && window.gameWebsite.games && window.gameWebsite.games.length > 0) {
                this.games = [...window.gameWebsite.games];
                console.log(`从全局变量加载了 ${this.games.length} 个游戏`);
            } 
            // 2. 尝试从HTML获取数据
            else {
                try {
                    const htmlResponse = await fetch('../index.html');
                    const html = await htmlResponse.text();
                    const match = html.match(/const\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/);
                    
                    if (match && match[1]) {
                        let jsonStr = match[1]
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":');
                            
                        this.games = JSON.parse(jsonStr);
                        console.log(`从HTML加载了 ${this.games.length} 个游戏`);
                    } else {
                        // 尝试从script.js加载
                        const jsResponse = await fetch('../script.js');
                        const js = await jsResponse.text();
                        const jsMatch = js.match(/const\s+GAME_DATA\s*=\s*(\[[\s\S]*?\]);/);
                        
                        if (jsMatch && jsMatch[1]) {
                            let jsonStr = jsMatch[1]
                                .replace(/'/g, '"')
                                .replace(/(\w+):/g, '"$1":');
                                
                            this.games = JSON.parse(jsonStr);
                            console.log(`从script.js加载了 ${this.games.length} 个游戏`);
                        } else {
                            // 加载示例数据
                            this.loadSampleData();
                        }
                    }
                } catch (error) {
                    console.error('加载游戏数据失败:', error);
                    this.loadSampleData();
                }
            }
            
            // 3. 尝试从localStorage获取管理员数据
            const savedData = localStorage.getItem('gameAdminData');
            if (savedData) {
                try {
                    const adminData = JSON.parse(savedData);
                    this.mergeAdminData(adminData);
                    console.log('合并了本地保存的管理数据');
                } catch (e) {
                    console.error('解析本地数据失败:', e);
                }
            }
            
            // 4. 提取分类
            this.extractCategories();
            
            // 5. 加载设置
            this.loadSettings();
            
            // 6. 更新UI
            this.updateUI();
            this.hideLoading();
            
        } catch (error) {
            console.error('初始化数据失败:', error);
            this.showErrorMessage('加载数据失败，请刷新页面重试');
            this.hideLoading();
        }
    }
    
    // 加载示例数据
    loadSampleData() {
        console.log('加载示例数据');
        this.games = [
            {
                title: "Mini Cars Racing",
                category: "Racing",
                url: "https://example.com/game1",
                embed_url: "https://example.com/embed/game1",
                description: "Race with mini cars on exciting tracks!",
                added: new Date().toISOString(),
                featured: true
            },
            {
                title: "Pyramid Solitaire",
                category: "Card",
                url: "https://example.com/game2",
                embed_url: "https://example.com/embed/game2",
                description: "Classic pyramid solitaire card game",
                added: new Date(Date.now() - 86400000).toISOString()
            },
            {
                title: "Solitaire",
                category: "Card",
                url: "https://example.com/game3",
                embed_url: "https://example.com/embed/game3",
                description: "The classic solitaire card game",
                added: new Date(Date.now() - 172800000).toISOString()
            },
            {
                title: "Zombie Shooter",
                category: "Action",
                url: "https://example.com/game4",
                embed_url: "https://example.com/embed/game4",
                description: "Shoot zombies in this action game",
                added: new Date(Date.now() - 259200000).toISOString()
            },
            {
                title: "Puzzle Master",
                category: "Puzzle",
                url: "https://example.com/game5",
                embed_url: "https://example.com/embed/game5",
                description: "Test your brain with challenging puzzles",
                added: new Date(Date.now() - 345600000).toISOString()
            }
        ];
        
        this.showInfoMessage('加载了示例数据进行演示');
    }
    
    // 合并管理员数据
    mergeAdminData(adminData) {
        if (adminData && adminData.games) {
            // 合并现有游戏
            const existingTitles = new Set(this.games.map(g => g.title));
            this.games = this.games.map(game => {
                const savedGame = adminData.games.find(g => g.title === game.title);
                return savedGame ? { ...game, ...savedGame } : game;
            });
            
            // 添加管理员新增的游戏
            const newGames = adminData.games.filter(g => !existingTitles.has(g.title));
            this.games = [...this.games, ...newGames];
        }
        
        // 合并设置
        if (adminData && adminData.settings) {
            this.settings = { ...this.settings, ...adminData.settings };
        }
    }
    
    // 提取分类
    extractCategories() {
        const categorySet = new Set();
        this.games.forEach(game => {
            if (game.category) {
                categorySet.add(game.category);
            }
        });
        this.categories = Array.from(categorySet).sort();
        console.log(`提取了 ${this.categories.length} 个分类`);
    }
    
    // 加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsedSettings };
                console.log('加载了保存的设置');
            } catch (e) {
                console.error('解析设置失败:', e);
            }
        }
    }
    
    // 保存数据
    saveData() {
        try {
            const adminData = {
                games: this.games,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('gameAdminData', JSON.stringify(adminData));
            this.showSuccessMessage('数据保存成功');
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showErrorMessage('保存数据失败');
        }
    }
    
    // 保存设置
    saveSettings() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
            this.showSuccessMessage('设置保存成功');
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showErrorMessage('保存设置失败');
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 侧边栏切换
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.querySelector('.content-wrapper').classList.toggle('expanded');
        });
        
        // 添加游戏按钮
        document.getElementById('addGameBtn').addEventListener('click', () => this.showAddGameModal());
        document.getElementById('addGameBtnAlt').addEventListener('click', () => this.showAddGameModal());
        
        // 保存游戏按钮
        document.getElementById('saveGameBtn').addEventListener('click', () => this.saveGame());
        
        // 游戏表单提交
        document.getElementById('gameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGame();
        });
        
        // 缩略图上传
        document.getElementById('gameThumbnail').addEventListener('change', (e) => {
            this.handleThumbnailUpload(e.target.files[0]);
        });
        
        // 缩略图预览点击
        document.getElementById('thumbnailPreview').addEventListener('click', () => {
            document.getElementById('gameThumbnail').click();
        });
        
        // 全选游戏
        document.getElementById('selectAllGames').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // 搜索游戏
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.currentPage = 1;
            this.renderGames();
        });
        
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.currentPage = 1;
                this.renderGames();
            }
        });
        
        // 分类筛选
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.renderGames();
        });
        
        // 刷新游戏按钮
        document.getElementById('refreshGamesBtn').addEventListener('click', () => {
            this.renderGames();
        });
        
        // 批量删除按钮
        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.confirmBulkDelete();
        });
        
        // 添加分类按钮
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.resetCategoryForm();
        });
        
        // 取消分类编辑
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
            this.resetCategoryForm();
        });
        
        // 分类表单提交
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
        
        // 设置表单提交
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettingsFromForm();
        });
        
        // 重置设置按钮
        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            this.resetSettingsForm();
        });
        
        // 刷新数据按钮
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.loadData();
        });
        
        // 退出登录按钮
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('logoutBtnAlt').addEventListener('click', () => this.logout());
        
        // 确认按钮
        document.getElementById('confirmBtn').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
            }
        });
    }
    
    // 设置侧边栏
    setupSidebar() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (!item.dataset.section) return;
            
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }
    
    // 切换内容区域
    switchSection(section) {
        if (section === this.currentSection) return;
        
        document.querySelectorAll('.content-section').forEach(el => {
            el.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            document.getElementById('pageTitle').textContent = this.getSectionTitle(section);
            this.currentSection = section;
            
            // 根据不同区域加载对应内容
            switch (section) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'games':
                    this.renderGames();
                    break;
                case 'categories':
                    this.renderCategories();
                    break;
                case 'settings':
                    this.renderSettings();
                    break;
            }
        }
    }
    
    // 获取区域标题
    getSectionTitle(section) {
        const titles = {
            dashboard: '仪表盘',
            games: '游戏管理',
            categories: '分类管理',
            settings: '网站设置'
        };
        return titles[section] || '管理面板';
    }
    
    // 更新UI
    updateUI() {
        this.renderDashboard();
        this.populateCategoryOptions();
    }
    
    // 渲染仪表盘
    renderDashboard() {
        // 更新统计数据
        document.getElementById('gamesCount').textContent = this.games.length;
        document.getElementById('categoriesCount').textContent = this.categories.length;
        
        const featuredGames = this.games.filter(game => 
            game.featured || game.category === 'Featured'
        ).length;
        document.getElementById('featuredCount').textContent = featuredGames;
        
        // 渲染最近游戏
        const recentGames = [...this.games]
            .sort((a, b) => {
                const dateA = a.added ? new Date(a.added) : new Date(0);
                const dateB = b.added ? new Date(b.added) : new Date(0);
                return dateB - dateA;
            })
            .slice(0, 5);
        
        const recentGamesTable = document.getElementById('recentGamesTable');
        if (recentGames.length === 0) {
            recentGamesTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3">
                        <p class="mb-0">暂无游戏数据</p>
                    </td>
                </tr>`;
        } else {
            recentGamesTable.innerHTML = recentGames.map(game => `
                <tr>
                    <td>${game.title}</td>
                    <td>${game.category || '未分类'}</td>
                    <td>${this.formatDate(game.added)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-game" data-game="${game.title}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // 添加编辑按钮事件
            recentGamesTable.querySelectorAll('.edit-game').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.editGame(btn.dataset.game);
                });
            });
        }
        
        // 渲染分类统计
        this.renderCategoryStats();
    }
    
    // 渲染分类统计
    renderCategoryStats() {
        const categoriesList = document.getElementById('categoriesStatsList');
        
        if (this.categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span>暂无分类数据</span>
                </div>`;
            return;
        }
        
        const categoryStats = this.categories.map(category => {
            const count = this.games.filter(game => game.category === category).length;
            return { category, count };
        }).sort((a, b) => b.count - a.count);
        
        categoriesList.innerHTML = categoryStats.map(stat => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${stat.category}</span>
                <span class="badge bg-primary rounded-pill">${stat.count}</span>
            </div>
        `).join('');
    }
} 