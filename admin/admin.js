// GameHub 管理后台 JavaScript

class AdminDashboard {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.categories = new Set();
        this.currentSection = 'dashboard';
        
        // 添加缩略图处理变量
        this.currentThumbnail = null;
        this.currentEditThumbnail = null;
        
        this.init();
    }
    
    // 初始化管理后台
    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        
        // 监听游戏数据加载完成事件
        document.addEventListener('game-data-loaded', (event) => {
            console.log(`游戏数据加载完成事件触发，共 ${event.detail.gameCount} 个游戏`);
            this.loadGameData();
            this.updateStatistics();
            
            // 重新初始化当前页面
            this.initSection(this.currentSection);
        });
        
        // 初始加载游戏数据
        this.loadGameData();
        this.updateStatistics();
    }
    
    // 检查用户认证状态
    checkAuthentication() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') || sessionStorage.getItem('adminLoggedIn');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }
        
        // 设置用户信息
        const username = localStorage.getItem('adminUsername') || sessionStorage.getItem('adminUsername') || 'admin';
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.textContent = username.charAt(0).toUpperCase();
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
        
        // 退出登录按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // 移动端菜单按钮
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // 游戏搜索功能
        const searchInput = document.getElementById('gameSearchInput');
        const categoryFilter = document.getElementById('gameCategoryFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterGames();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterGames();
            });
        }
        
        // 添加游戏按钮
        const addGameBtn = document.getElementById('addGameBtn');
        if (addGameBtn) {
            addGameBtn.addEventListener('click', () => {
                this.showAddGameDialog();
            });
        }
        
        // 添加游戏模态框事件
        this.setupAddGameModal();
        
        // 编辑游戏模态框事件
        this.setupEditGameModal();
    }
    
    // 设置添加游戏模态框事件
    setupAddGameModal() {
        // 关闭按钮
        const closeBtn = document.getElementById('closeAddGameModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('addGameModal').style.display = 'none';
            });
        }
        
        // 取消按钮
        const cancelBtn = document.getElementById('cancelAddGame');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('addGameModal').style.display = 'none';
            });
        }
        
        // 缩略图上传
        const thumbnailUpload = document.getElementById('thumbnailUpload');
        if (thumbnailUpload) {
            thumbnailUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleThumbnailUpload(e.target.files[0], 'thumbnailPreview', 'thumbnailFilename');
                }
            });
        }
        
        // 表单提交
        const form = document.getElementById('addGameForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = {
                    title: document.getElementById('gameTitle').value,
                    category: document.getElementById('gameCategory').value,
                    url: document.getElementById('gameUrl').value,
                    embedUrl: document.getElementById('gameEmbedUrl').value,
                    featured: document.getElementById('gameFeatured').checked
                };
                
                this.addGame(formData);
            });
        }
        
        // 点击模态框外部关闭
        const modal = document.getElementById('addGameModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    // 设置编辑游戏模态框事件
    setupEditGameModal() {
        // 关闭按钮
        const closeBtn = document.getElementById('closeEditGameModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('editGameModal').style.display = 'none';
            });
        }
        
        // 取消按钮
        const cancelBtn = document.getElementById('cancelEditGame');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.getElementById('editGameModal').style.display = 'none';
            });
        }
        
        // 缩略图上传
        const thumbnailUpload = document.getElementById('editThumbnailUpload');
        if (thumbnailUpload) {
            thumbnailUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleThumbnailUpload(e.target.files[0], 'editThumbnailPreview', 'editThumbnailFilename', true);
                }
            });
        }
        
        // 表单提交
        const form = document.getElementById('editGameForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const index = document.getElementById('editGameIndex').value;
                
                const formData = {
                    title: document.getElementById('editGameTitle').value,
                    category: document.getElementById('editGameCategory').value,
                    url: document.getElementById('editGameUrl').value,
                    embedUrl: document.getElementById('editGameEmbedUrl').value,
                    featured: document.getElementById('editGameFeatured').checked
                };
                
                this.updateGame(formData, index);
            });
        }
        
        // 点击模态框外部关闭
        const modal = document.getElementById('editGameModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    // 显示指定的内容区域
    showSection(sectionName) {
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 移除所有导航链接的active状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 显示指定的内容区域
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 激活对应的导航链接
        const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
        
        // 更新页面标题
        this.updatePageTitle(sectionName);
        
        // 更新当前区域
        this.currentSection = sectionName;
        
        // 执行区域特定的初始化
        this.initSection(sectionName);
    }
    
    // 更新页面标题
    updatePageTitle(sectionName) {
        const titles = {
            dashboard: { title: '仪表盘', subtitle: '欢迎回到 GameHub 管理后台' },
            games: { title: '游戏管理', subtitle: '管理和维护游戏列表' },
            categories: { title: '分类管理', subtitle: '管理游戏分类和标签' },
            settings: { title: '系统设置', subtitle: '配置系统参数和选项' }
        };
        
        const pageInfo = titles[sectionName] || titles.dashboard;
        
        const titleElement = document.getElementById('pageTitle');
        const subtitleElement = document.getElementById('pageSubtitle');
        
        if (titleElement) titleElement.textContent = pageInfo.title;
        if (subtitleElement) subtitleElement.textContent = pageInfo.subtitle;
    }
    
    // 初始化特定区域
    initSection(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'games':
                this.loadGamesData();
                break;
            case 'categories':
                this.loadCategoriesData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }
    
    // 加载游戏数据
    loadGameData() {
        console.log('正在加载游戏数据...');
        
        try {
            // 尝试从game-data.js加载数据
            if (typeof window.GAME_DATA !== 'undefined' && window.GAME_DATA.length > 0) {
                this.games = window.GAME_DATA;
                console.log('从GAME_DATA加载了', this.games.length, '个游戏');
            } else {
                // 尝试从localStorage加载数据
                const savedGames = localStorage.getItem('adminGames');
                if (savedGames) {
                    this.games = JSON.parse(savedGames);
                    console.log('从localStorage加载了', this.games.length, '个游戏');
                } else {
                    this.games = this.getDefaultGames();
                    console.log('使用默认游戏数据，共', this.games.length, '个游戏');
                }
            }
            
            // 处理游戏数据
            this.processGameData();
            
        } catch (error) {
            console.error('加载游戏数据时出错:', error);
            this.games = this.getDefaultGames();
            this.processGameData();
        }
    }
    
    // 处理游戏数据
    processGameData() {
        // 提取所有分类
        this.categories.clear();
        this.games.forEach(game => {
            if (game.category) {
                this.categories.add(game.category);
            }
        });
        
        // 设置过滤后的游戏列表
        this.filteredGames = [...this.games];
        
        // 更新分类筛选器
        this.updateCategoryFilter();
        
        console.log('游戏数据处理完成:', {
            totalGames: this.games.length,
            categories: Array.from(this.categories)
        });
    }
    
    // 获取默认游戏数据
    getDefaultGames() {
        return [
            {
                title: "Mini Cars Racing",
                category: "Racing",
                url: "/games/mini-cars-racing",
                embed_url: "https://html5.gamedistribution.com/rvvASMiM/12d4de5c8d9947e8acf502073f9edf2a/index.html",
                featured: true
            },
            {
                title: "Pyramid Solitaire",
                category: "Card",
                url: "/games/pyramid-solitaire",
                embed_url: "https://html5.gamedistribution.com/rvvASMiM/e3e3e8f4d1f545e5a1234567890abcde/index.html",
                featured: true
            }
        ];
    }
    
    // 更新统计信息
    updateStatistics() {
        const totalGamesElement = document.getElementById('totalGames');
        const totalCategoriesElement = document.getElementById('totalCategories');
        const featuredGamesElement = document.getElementById('featuredGames');
        
        if (totalGamesElement) {
            totalGamesElement.textContent = this.games.length;
        }
        
        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = this.categories.size;
        }
        
        if (featuredGamesElement) {
            const featuredCount = this.games.filter(game => game.featured).length;
            featuredGamesElement.textContent = featuredCount;
        }
        
        // 更新游戏数量显示
        const gamesCountElement = document.getElementById('gamesCount');
        if (gamesCountElement) {
            gamesCountElement.textContent = this.filteredGames.length;
        }
    }
    
    // 更新分类筛选器
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('gameCategoryFilter');
        if (!categoryFilter) return;
        
        // 清空现有选项（保留"所有分类"）
        const allOption = categoryFilter.querySelector('option[value=""]');
        categoryFilter.innerHTML = '';
        if (allOption) {
            categoryFilter.appendChild(allOption);
        } else {
            categoryFilter.innerHTML = '<option value="">所有分类</option>';
        }
        
        // 添加分类选项
        Array.from(this.categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    // 加载仪表盘数据
    loadDashboardData() {
        this.loadRecentGames();
    }
    
    // 加载最近添加的游戏
    loadRecentGames() {
        const recentGamesTable = document.getElementById('recentGamesTable');
        if (!recentGamesTable) return;
        
        // 获取最近的5个游戏
        const recentGames = this.games.slice(0, 5);
        
        if (recentGames.length === 0) {
            recentGamesTable.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-secondary);">
                        暂无游戏数据
                    </td>
                </tr>
            `;
            return;
        }
        
        recentGamesTable.innerHTML = recentGames.map(game => `
            <tr>
                <td>
                    <div class="game-title">${game.title || '未命名游戏'}</div>
                </td>
                <td>
                    <span class="game-category">${game.category || '未分类'}</span>
                </td>
                <td>刚刚</td>
                <td>
                    <span class="btn btn-success" style="font-size: 0.75rem; padding: 4px 8px;">
                        <i class="fas fa-check"></i> 正常
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    // 加载游戏管理数据
    loadGamesData() {
        this.displayGames();
    }
    
    // 显示游戏列表
    displayGames() {
        const gamesTableBody = document.getElementById('gamesTableBody');
        const gamesEmpty = document.getElementById('gamesEmpty');
        const gamesTable = document.getElementById('gamesTable');
        
        if (!gamesTableBody) return;
        
        if (this.filteredGames.length === 0) {
            if (gamesTable) gamesTable.style.display = 'none';
            if (gamesEmpty) gamesEmpty.style.display = 'block';
            return;
        }
        
        if (gamesTable) gamesTable.style.display = 'table';
        if (gamesEmpty) gamesEmpty.style.display = 'none';
        
        gamesTableBody.innerHTML = this.filteredGames.map((game, index) => `
            <tr>
                <td>
                    <div class="game-item">
                        <div class="game-thumbnail">
                            ${game.thumbnail 
                                ? `<img src="${game.thumbnail}" alt="${game.title}">` 
                                : `<div class="game-thumbnail-placeholder">
                                    <i class="fas fa-gamepad"></i>
                                   </div>`
                            }
                        </div>
                        <div class="game-title">${game.title || '未命名游戏'}</div>
                    </div>
                </td>
                <td>
                    <span class="game-category">${game.category || '未分类'}</span>
                </td>
                <td>
                    <a href="${game.url || '#'}" target="_blank" class="btn btn-outline" style="font-size: 0.75rem; padding: 4px 8px;">
                        <i class="fas fa-external-link-alt"></i> 查看
                    </a>
                </td>
                <td>
                    <span class="btn ${game.featured ? 'btn-warning' : 'btn-success'}" style="font-size: 0.75rem; padding: 4px 8px;">
                        <i class="fas ${game.featured ? 'fa-star' : 'fa-check'}"></i> ${game.featured ? '精选' : '正常'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary" style="font-size: 0.75rem; padding: 4px 8px; margin-right: 4px;" onclick="adminDashboard.editGame(${index})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn" style="background: var(--danger-color); color: white; font-size: 0.75rem; padding: 4px 8px;" onclick="adminDashboard.deleteGame(${index})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
        
        // 更新游戏数量
        this.updateStatistics();
    }
    
    // 筛选游戏
    filterGames() {
        const searchInput = document.getElementById('gameSearchInput');
        const categoryFilter = document.getElementById('gameCategoryFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        this.filteredGames = this.games.filter(game => {
            const matchesSearch = !searchTerm || 
                (game.title && game.title.toLowerCase().includes(searchTerm));
            const matchesCategory = !selectedCategory || game.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.displayGames();
    }
    
    // 编辑游戏
    editGame(index) {
        const game = this.filteredGames[index];
        if (!game) return;
        
        // 显示编辑模态框
        const modal = document.getElementById('editGameModal');
        if (!modal) return;
        
        // 填充表单
        document.getElementById('editGameIndex').value = index;
        document.getElementById('editGameTitle').value = game.title || '';
        document.getElementById('editGameUrl').value = game.url || '';
        document.getElementById('editGameEmbedUrl').value = game.embed_url || '';
        document.getElementById('editGameFeatured').checked = game.featured || false;
        
        // 填充分类下拉列表
        this.populateCategoryDropdown('editGameCategory');
        
        // 选择当前分类
        const categorySelect = document.getElementById('editGameCategory');
        if (categorySelect) {
            // 检查是否有当前分类的选项
            let categoryExists = false;
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === game.category) {
                    categorySelect.selectedIndex = i;
                    categoryExists = true;
                    break;
                }
            }
            
            // 如果没有当前分类的选项，添加一个
            if (!categoryExists && game.category) {
                const option = document.createElement('option');
                option.value = game.category;
                option.textContent = game.category;
                categorySelect.appendChild(option);
                categorySelect.value = game.category;
            }
        }
        
        // 显示缩略图
        this.currentEditThumbnail = game.thumbnail || null;
        const thumbnailPreview = document.getElementById('editThumbnailPreview');
        const thumbnailFilename = document.getElementById('editThumbnailFilename');
        
        if (thumbnailPreview) {
            if (game.thumbnail) {
                thumbnailPreview.innerHTML = `<img src="${game.thumbnail}">`;
                if (thumbnailFilename) {
                    thumbnailFilename.textContent = '已有封面图片';
                }
            } else {
                thumbnailPreview.innerHTML = '<i class="fas fa-image" style="font-size: 3rem; color: var(--text-muted);"></i>';
                if (thumbnailFilename) {
                    thumbnailFilename.textContent = '未设置封面';
                }
            }
        }
        
        // 显示模态框
        modal.style.display = 'block';
    }
    
    // 更新游戏
    updateGame(formData, index) {
        const game = this.filteredGames[index];
        if (!game) return;
        
        // 更新游戏信息
        game.title = formData.title;
        game.category = formData.category;
        game.url = formData.url;
        game.embed_url = formData.embedUrl || formData.url;
        game.featured = formData.featured;
        
        // 如果上传了新缩略图，更新它
        if (this.currentEditThumbnail) {
            game.thumbnail = this.currentEditThumbnail;
        }
        
        // 保存到localStorage
        this.saveGames();
        
        // 重新处理数据并显示
        this.processGameData();
        this.displayGames();
        
        // 关闭模态框
        const modal = document.getElementById('editGameModal');
        if (modal) modal.style.display = 'none';
        
        // 重置编辑缩略图
        this.currentEditThumbnail = null;
        
        // 显示成功提示
        this.showToast('游戏信息已更新！');
    }
    
    // 删除游戏
    deleteGame(index) {
        const game = this.filteredGames[index];
        if (!game) return;
        
        if (!confirm(`确定要删除游戏 "${game.title}" 吗？`)) {
            return;
        }
        
        // 从原始游戏列表中找到并删除
        const originalIndex = this.games.findIndex(g => 
            g.title === game.title && g.category === game.category
        );
        
        if (originalIndex !== -1) {
            this.games.splice(originalIndex, 1);
            this.saveGames();
            this.processGameData();
            this.displayGames();
            alert('游戏已删除！');
        }
    }
    
    // 显示添加游戏对话框
    showAddGameDialog() {
        // 显示模态框
        const modal = document.getElementById('addGameModal');
        if (!modal) return;
        
        // 清空表单
        const form = document.getElementById('addGameForm');
        if (form) form.reset();
        
        // 清空缩略图预览
        this.currentThumbnail = null;
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        if (thumbnailPreview) {
            thumbnailPreview.innerHTML = '<i class="fas fa-image" style="font-size: 3rem; color: var(--text-muted);"></i>';
        }
        const thumbnailFilename = document.getElementById('thumbnailFilename');
        if (thumbnailFilename) thumbnailFilename.textContent = '未选择文件';
        
        // 填充分类下拉列表
        this.populateCategoryDropdown('gameCategory');
        
        // 显示模态框
        modal.style.display = 'block';
    }
    
    // 填充分类下拉列表
    populateCategoryDropdown(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // 保留第一个选项，清空其他选项
        const firstOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);
        
        // 添加分类选项
        Array.from(this.categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }
    
    // 处理缩略图上传
    handleThumbnailUpload(file, previewId, filenameId, isEdit = false) {
        if (!file) return;
        
        const reader = new FileReader();
        const preview = document.getElementById(previewId);
        const filename = document.getElementById(filenameId);
        
        reader.onload = (e) => {
            // 创建预览图像
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
            
            // 更新文件名显示
            if (filename) filename.textContent = file.name;
            
            // 保存缩略图数据
            if (isEdit) {
                this.currentEditThumbnail = e.target.result;
            } else {
                this.currentThumbnail = e.target.result;
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    // 添加游戏
    addGame(formData) {
        // 构建新游戏对象
        const newGame = {
            title: formData.title,
            category: formData.category,
            url: formData.url,
            embed_url: formData.embedUrl || formData.url,
            featured: formData.featured,
            thumbnail: this.currentThumbnail || null
        };
        
        // 添加到游戏列表并保存
        this.games.unshift(newGame);
        this.saveGames();
        this.processGameData();
        this.displayGames();
        
        // 关闭模态框
        const modal = document.getElementById('addGameModal');
        if (modal) modal.style.display = 'none';
        
        // 重置缩略图
        this.currentThumbnail = null;
        
        // 显示成功提示
        this.showToast('游戏已成功添加！');
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        // 添加到文档
        document.body.appendChild(toast);
        
        // 动画显示
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // 保存游戏数据到localStorage
    saveGames() {
        try {
            localStorage.setItem('adminGames', JSON.stringify(this.games));
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }
    
    // 加载分类数据
    loadCategoriesData() {
        const categoriesContent = document.getElementById('categoriesContent');
        if (!categoriesContent) return;
        
        const categoryList = Array.from(this.categories).map(category => {
            const gameCount = this.games.filter(game => game.category === category).length;
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px;">
                    <div>
                        <strong>${category}</strong>
                        <span style="color: var(--text-secondary); margin-left: 8px;">${gameCount} 个游戏</span>
                    </div>
                    <div>
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 6px 12px;">编辑</button>
                    </div>
                </div>
            `;
        }).join('');
        
        categoriesContent.innerHTML = categoryList || '<p>暂无分类数据</p>';
    }
    
    // 加载设置数据
    loadSettingsData() {
        const settingsContent = document.getElementById('settingsContent');
        if (!settingsContent) return;
        
        settingsContent.innerHTML = `
            <div style="max-width: 600px;">
                <h4 style="margin-bottom: 16px;">基本设置</h4>
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">网站标题</label>
                    <input type="text" value="GameHub" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px;">
                </div>
                <div style="margin-bottom: 24px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">网站描述</label>
                    <textarea rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px;">GameHub - 在线游戏平台</textarea>
                </div>
                <button class="btn btn-primary">保存设置</button>
            </div>
        `;
    }
    
    // 退出登录
    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            localStorage.removeItem('loginTime');
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            sessionStorage.removeItem('loginTime');
            
            window.location.href = 'login.html';
        }
    }
}

// 创建全局管理后台实例
let adminDashboard;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
}); 