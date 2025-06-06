class GameWebsite {
    constructor() {
        this.games = [];
        this.allCategories = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.gamesPerPage = 12;
        this.isLoading = false;
        this.searchTimeout = null;
        this.currentSort = 'default';
        this.isExpanded = false;
        
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadGames();
        this.setupEventListeners();
        this.renderCategories();
        this.initCategoryFilter(); // 初始化分类筛选器
        this.renderGames();
        this.setupMobileMenu();
        this.hideLoading();
        
        // 添加窗口加载完成事件，确保在页面刷新时重新渲染游戏数据
        window.addEventListener('load', () => {
            console.log('窗口加载完成，重新渲染游戏数据');
            // 延迟执行以确保所有数据都已加载
            setTimeout(() => {
                this.renderGames();
            }, 500);
        });
    }

    async loadGames() {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            this.games = window.GAME_DATA || [];
            
            // 加载管理后台保存的数据
            const savedData = localStorage.getItem('gameAdminData');
            if (savedData) {
                try {
                    const adminData = JSON.parse(savedData);
                    if (adminData && adminData.games) {
                        console.log('从管理后台加载游戏数据:', adminData.games.length);
                        
                        // 将管理后台数据与原始数据合并
                        this.games = this.games.map(game => {
                            const savedGame = adminData.games.find(g => g.title === game.title);
                            return savedGame ? { ...game, ...savedGame } : game;
                        });
                        
                        // 添加管理后台中新增的游戏
                        const existingTitles = this.games.map(g => g.title);
                        const newGames = adminData.games.filter(g => !existingTitles.includes(g.title));
                        if (newGames.length > 0) {
                            console.log('添加管理后台中新增的游戏:', newGames.length);
                            this.games = [...this.games, ...newGames];
                        }
                    }
                } catch (e) {
                    console.error('解析管理后台数据出错:', e);
                }
            }
            
            this.allCategories = [...new Set(this.games.map(game => game.category))].sort();
            
            console.log(`加载了 ${this.games.length} 个游戏, ${this.allCategories.length} 个分类`);
            this.updateStats();
        } catch (error) {
            console.error('Failed to load games:', error);
            this.showError('Failed to load games. Please refresh the page to try again.');
        }
    }

    updateStats() {
        const allCountEl = document.getElementById('count-all');
        const homepageCountEl = document.getElementById('count-homepage');
        
        if (allCountEl) allCountEl.textContent = this.games.length;
        if (homepageCountEl) {
            const featuredGames = this.games.filter(game => game.category === 'Featured').length;
            homepageCountEl.textContent = featuredGames;
        }
    }

    setupEventListeners() {
        // Sidebar search
        const sidebarSearchInput = document.querySelector('.sidebar-search-input');
        if (sidebarSearchInput) {
            sidebarSearchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                const query = e.target.value;
                
                if (query.length > 0) {
                    this.showSearching();
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.searchGames(query);
                }, 300);
            });
        }
        
        // 分类筛选器
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectCategory(e.target.value);
            });
        }

        // Quick category buttons
        const quickCategories = document.querySelectorAll('.quick-categories .category-item');
        quickCategories.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.category, btn);
            });
        });

        // Expand/collapse category list
        const expandBtn = document.getElementById('expandBtn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.toggleCategoriesExpansion();
            });
        }

        // Sort selection
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortAndRenderGames();
            });
        }

        // View toggle
        const viewToggle = document.getElementById('viewToggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', () => {
                this.toggleView();
            });
        }

        // Game modal events
        this.setupGameModal();

        // 分类筛选器
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectCategory(e.target.value);
            });
        }
    }

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuToggle && sidebar && sidebarOverlay) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });

            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        // Show first 10 categories
        const displayCategories = this.allCategories.slice(0, 10);
        
        categoriesList.innerHTML = displayCategories.map(category => {
            const gameCount = this.games.filter(game => game.category === category).length;
            const emoji = this.getCategoryEmoji(category);
            
            return `
                <button class="category-item" data-category="${category}">
                    <span class="category-emoji">${emoji}</span>
                    <span class="category-name">${category}</span>
                    <span class="category-count">${gameCount}</span>
                </button>
            `;
        }).join('');

        // Add event listeners
        categoriesList.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.category, btn);
            });
        });
    }

    toggleCategoriesExpansion() {
        const categoriesList = document.getElementById('categoriesList');
        const expandBtn = document.getElementById('expandBtn');
        
        if (!categoriesList || !expandBtn) return;

        this.isExpanded = !this.isExpanded;
        expandBtn.classList.toggle('active', this.isExpanded);

        if (this.isExpanded) {
            // Show all categories
            categoriesList.innerHTML = this.allCategories.map(category => {
                const gameCount = this.games.filter(game => game.category === category).length;
                const emoji = this.getCategoryEmoji(category);
                
                return `
                    <button class="category-item" data-category="${category}">
                        <span class="category-emoji">${emoji}</span>
                        <span class="category-name">${category}</span>
                        <span class="category-count">${gameCount}</span>
                    </button>
                `;
            }).join('');
        } else {
            // Show only first 10 categories
            this.renderCategories();
        }

        // Re-add event listeners
        categoriesList.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.category, btn);
            });
        });
    }

    getCategoryEmoji(category) {
        const emojiMap = {
            'Featured': '🏠',
            'Action': '⚔️',
            'Adventure': '🗺️',
            'Racing': '🏎️',
            'Sports': '⚽',
            'Puzzle': '🧩',
            'Strategy': '🎯',
            'Simulation': '🎮',
            'RPG': '🗡️',
            'Fighting': '👊',
            'Shooting': '🔫',
            'Platform': '📦',
            'Arcade': '🕹️',
            'Card': '🃏',
            'Board': '♟️',
            'Music': '🎵',
            'Dancing': '💃',
            'Educational': '📚',
            'Kids': '👶',
            'Multiplayer': '👥'
        };
        
        // Check if category name contains keywords
        for (const [key, emoji] of Object.entries(emojiMap)) {
            if (category.toLowerCase().includes(key.toLowerCase())) {
                return emoji;
            }
        }
        
        return '🎮'; // Default emoji
    }

    selectCategory(category, buttonElement = null) {
        // 记录当前选中的分类
        this.currentCategory = category;
        
        // 重置到第一页
        this.currentPage = 1;
        
        // 更新分类选中状态
        const allCategoryButtons = document.querySelectorAll('.category-item');
        allCategoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 如果提供了按钮元素，设置它为活跃状态
        if (buttonElement) {
            buttonElement.classList.add('active');
        } else {
            // 否则找到对应的按钮并设置为活跃
            const matchingButton = document.querySelector(`.category-item[data-category="${category}"]`);
            if (matchingButton) {
                matchingButton.classList.add('active');
            }
        }
        
        // 同步顶部分类筛选器
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categoryFilter.value !== category) {
            categoryFilter.value = category;
        }
        
        // 更新面包屑
        this.updateBreadcrumb(category);
        
        // 更新页面标题和内容
        const displayName = category === 'all' ? 'All Games' : category;
        this.updateSectionTitle(displayName);
        
        // 渲染筛选后的游戏
        this.renderGames();
    }

    updateBreadcrumb(category) {
        const breadcrumbEl = document.getElementById('currentCategory');
        if (breadcrumbEl) {
            const displayName = category === 'all' ? 'All Games' : category;
            breadcrumbEl.textContent = displayName;
        }
    }

    searchGames(query) {
        if (!query.trim()) {
            this.selectCategory('all');
            return;
        }

        const filteredGames = this.games.filter(game => 
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            game.category.toLowerCase().includes(query.toLowerCase())
        );

        this.renderGames(filteredGames);
        this.updateSectionTitle(`Search Results: "${query}" (${filteredGames.length} games)`);
        this.updateGamesCount(filteredGames.length);
    }

    sortAndRenderGames() {
        let currentGames = this.getCurrentGames();
        
        switch (this.currentSort) {
            case 'name':
                currentGames.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'category':
                currentGames.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case 'popular':
                // Random sort to simulate popularity
                currentGames.sort(() => Math.random() - 0.5);
                break;
            default:
                // Keep original order
                break;
        }
        
        this.renderGames(currentGames);
    }

    getCurrentGames() {
        // 首先根据当前分类筛选游戏
        let filteredGames = this.games;
        
        // 如果选择了特定分类，则筛选对应分类的游戏
        if (this.currentCategory && this.currentCategory !== 'all') {
            filteredGames = this.games.filter(game => game.category === this.currentCategory);
        }
        
        // 根据排序选项对游戏排序
        if (this.currentSort === 'nameAsc') {
            filteredGames.sort((a, b) => a.title.localeCompare(b.title));
        } else if (this.currentSort === 'nameDesc') {
            filteredGames.sort((a, b) => b.title.localeCompare(a.title));
        } else if (this.currentSort === 'dateNew') {
            filteredGames.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        } else if (this.currentSort === 'dateOld') {
            filteredGames.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }
        
        return filteredGames;
    }

    renderGames(gamesToRender = null) {
        const gamesContainer = document.getElementById('gamesGrid');
        if (!gamesContainer) return;

        const games = gamesToRender || this.getCurrentGames();

        if (games.length === 0) {
            this.showNoGames();
            return;
        }

        // Update title and count
        if (!gamesToRender) {
            this.updateSectionTitle(this.currentCategory === 'all' ? 'Popular Games' : this.currentCategory);
            this.updateGamesCount(games.length);
        }

        // Pagination handling
        const startIndex = (this.currentPage - 1) * this.gamesPerPage;
        const endIndex = startIndex + this.gamesPerPage;
        const paginatedGames = games.slice(startIndex, endIndex);

        // Render game cards
        gamesContainer.innerHTML = paginatedGames.map((game, index) => {
            return `
                <div class="game-card" data-game='${JSON.stringify(game)}' style="animation-delay: ${index * 0.1}s">
                <div class="game-thumbnail">
                        ${this.generateGameThumbnail(game)}
                        <div class="game-overlay">
                            <div class="play-icon">▶</div>
                        </div>
                </div>
                <div class="game-info">
                        <h3 class="game-title" title="${game.title}">${game.title}</h3>
                    <span class="game-category">${game.category}</span>
                        <button class="play-btn">
                            <span class="btn-text">Play Now</span>
                            <span class="btn-icon">🚀</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click events
        gamesContainer.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameData = JSON.parse(card.dataset.game);
                this.openGameModal(gameData);
            });
        });

        // Add loading animation
        this.animateGameCards();

        // Render pagination
        this.renderPagination(games.length);
    }

    generateGameThumbnail(game) {
        let thumbnailHtml;
        
        if (game.thumbnail) {
            // 优先使用已上传的缩略图
            thumbnailHtml = `<img src="${game.thumbnail}" alt="${game.title}" class="game-img">`;
        } else if (game.thumbnail_url) {
            // 使用链接缩略图
            thumbnailHtml = `<img src="${game.thumbnail_url}" alt="${game.title}" class="game-img">`;
        } else {
            // 使用自动生成的渐变缩略图
            const placeholderUrl = this.getPlaceholderThumbnail(game);
            thumbnailHtml = `<div class="game-placeholder" style="background: ${placeholderUrl}">${this.getCategoryEmoji(game.category)}</div>`;
        }
        
        return thumbnailHtml;
    }

    generateThumbnailUrl(game) {
        // Infer thumbnail path from embed URL
        try {
            const url = new URL(game.embed_url);
            const pathParts = url.pathname.split('/');
            
            // Try different thumbnail path patterns
            const patterns = [
                // Game path based thumbnails
                `${url.origin}${url.pathname.replace('/index.html', '/thumb.jpg')}`,
                `${url.origin}${url.pathname.replace('/index.html', '/screenshot.jpg')}`,
                `${url.origin}${url.pathname.replace('/index.html', '/preview.jpg')}`,
                `${url.origin}${url.pathname.replace('/index-og.html', '/thumb.jpg')}`,
                
                // OnlineGames.io specific patterns
                `https://cloud.onlinegames.io/thumbs/${pathParts[pathParts.length - 2]}.jpg`,
                `https://www.onlinegames.io/thumbs/${pathParts[pathParts.length - 2]}.jpg`,
            ];
            
            // Return first possible URL (handle failures with onerror later)
            return patterns[0];
        } catch (error) {
            return null;
        }
    }

    getPlaceholderThumbnail(game) {
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
        
        const colorIndex = Math.abs(game.title.charCodeAt(0)) % colors.length;
        const emoji = this.getCategoryEmoji(game.category);
        
        return colors[colorIndex];
    }

    animateGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    updateSectionTitle(title) {
        const titleEl = document.getElementById('sectionTitle');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    updateGamesCount(count) {
        const countEl = document.getElementById('gamesCount');
        if (countEl) {
            countEl.textContent = `${count} games`;
        }
    }

    showLoading() {
        this.isLoading = true;
        const gamesContainer = document.getElementById('gamesGrid');
        if (gamesContainer) {
            gamesContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading amazing games...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        this.isLoading = false;
    }

    showSearching() {
        const gamesContainer = document.getElementById('gamesGrid');
        if (gamesContainer && !this.isLoading) {
            gamesContainer.innerHTML = `
                <div class="searching-container">
                    <div class="search-spinner"></div>
                    <p>Searching...</p>
                </div>
            `;
        }
    }

    showNoGames() {
        const gamesContainer = document.getElementById('gamesGrid');
        if (gamesContainer) {
            gamesContainer.innerHTML = `
                <div class="no-games-container">
                    <div class="no-games-icon">🎮</div>
                    <h3>No games found</h3>
                    <p>Try searching with different keywords or select a different category</p>
                    <button onclick="gameWebsite.selectCategory('all')" class="back-to-all-btn">View All Games</button>
                </div>
            `;
        }
        this.updateGamesCount(0);
    }

    showError(message) {
        const gamesContainer = document.getElementById('gamesGrid');
        if (gamesContainer) {
            gamesContainer.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">😕</div>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">Reload</button>
                </div>
            `;
        }
    }

    renderPagination(totalGames) {
        const totalPages = Math.ceil(totalGames / this.gamesPerPage);
        const paginationContainer = document.getElementById('paginationContainer');
        
        if (!paginationContainer) return;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        paginationContainer.innerHTML = `
            <div class="pagination">
                <button class="page-btn prev" ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="gameWebsite.changePage(${this.currentPage - 1})">
                    ← Previous
                </button>
                <div class="page-info">
                    Page ${this.currentPage} of ${totalPages}
                </div>
                <button class="page-btn next" ${this.currentPage === totalPages ? 'disabled' : ''} 
                        onclick="gameWebsite.changePage(${this.currentPage + 1})">
                    Next →
                </button>
            </div>
        `;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderGames();
        
        // Scroll to games area
        document.getElementById('gamesGrid').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    toggleView() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.classList.toggle('compact-view');
        }
    }

    setupGameModal() {
        const modal = document.getElementById('gameModal');
        const closeBtn = document.getElementById('closeBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeGameModal());
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeGameModal();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                this.closeGameModal();
            }
        });
    }

    openGameModal(game) {
        const modal = document.getElementById('gameModal');
        const titleEl = document.getElementById('modalTitle');
        const frameEl = document.getElementById('gameFrame');
        const loadingEl = document.getElementById('gameLoading');
        const gameInfoEl = document.getElementById('modalGameInfo');
        
        if (!modal || !titleEl || !frameEl || !loadingEl || !gameInfoEl) return;
        
        titleEl.textContent = game.title;
        loadingEl.style.display = 'flex';
        frameEl.style.display = 'none';
        frameEl.src = game.embed_url;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 显示游戏信息（包括缩略图）
        let thumbnailHtml = '';
        if (game.thumbnail) {
            thumbnailHtml = `<img src="${game.thumbnail}" alt="${game.title}" class="modal-game-thumbnail">`;
        } else {
            // 使用自动生成的渐变缩略图
            const placeholderUrl = this.getPlaceholderThumbnail(game);
            thumbnailHtml = `<div class="modal-game-placeholder" style="background: ${placeholderUrl}">${this.getCategoryEmoji(game.category)}</div>`;
        }
        
        gameInfoEl.innerHTML = `
            <div class="modal-game-detail">
                <div class="modal-thumbnail-container">
                    ${thumbnailHtml}
                </div>
                <div class="modal-game-meta">
                    <h3>${game.title}</h3>
                    <div class="modal-game-category">${game.category}</div>
                    ${game.description ? `<p class="modal-game-desc">${game.description}</p>` : ''}
                </div>
            </div>
        `;
        
        // Listen for iframe load completion
        frameEl.onload = () => {
            loadingEl.style.display = 'none';
            frameEl.style.display = 'block';
        };
        
        // Timeout handling
        setTimeout(() => {
            if (loadingEl.style.display !== 'none') {
                loadingEl.innerHTML = `
                    <div class="game-loading-error">
                        <p>Game loading timeout</p>
                        <button onclick="gameWebsite.retryGame('${game.embed_url}')" class="retry-game-btn">Retry</button>
                    </div>
                `;
            }
        }, 10000);
    }

    retryGame(url) {
        const frameEl = document.getElementById('gameFrame');
        const loadingEl = document.getElementById('gameLoading');
        
        if (frameEl && loadingEl) {
            loadingEl.style.display = 'flex';
            loadingEl.innerHTML = `
                <div class="game-loading-spinner"></div>
                <p>Reloading...</p>
            `;
            frameEl.style.display = 'none';
            frameEl.src = '';
            setTimeout(() => {
                frameEl.src = url;
            }, 100);
        }
    }

    toggleFullscreen() {
        const modal = document.getElementById('gameModal');
        if (modal) {
            if (modal.classList.contains('fullscreen')) {
                modal.classList.remove('fullscreen');
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            } else {
                modal.classList.add('fullscreen');
                if (modal.requestFullscreen) {
                    modal.requestFullscreen();
                }
            }
        }
    }

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        const frameEl = document.getElementById('gameFrame');
        
        if (modal && frameEl) {
            frameEl.src = '';
            modal.classList.remove('active', 'fullscreen');
            document.body.style.overflow = 'auto';
        }
    }

    // 初始化分类筛选器
    initCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;
        
        // 获取所有分类并排序
        const categories = ['all', ...this.allCategories].sort((a, b) => {
            if (a === 'all') return -1;
            if (b === 'all') return 1;
            return a.localeCompare(b);
        });
        
        // 更新分类筛选器选项
        categoryFilter.innerHTML = categories.map(category => {
            const displayName = category === 'all' ? 'All Categories' : category;
            return `<option value="${category}">${displayName}</option>`;
        }).join('');
    }
}

// Initialize website
let gameWebsite;
// 初始化分类筛选器
initCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // 获取所有分类并排序
    const categories = ['all', ...this.allCategories].sort((a, b) => {
        if (a === 'all') return -1;
        if (b === 'all') return 1;
        return a.localeCompare(b);
    });
    
    // 更新分类筛选器选项
    categoryFilter.innerHTML = categories.map(category => {
        const displayName = category === 'all' ? 'All Categories' : category;
        return `<option value="${category}">${displayName}</option>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    gameWebsite = new GameWebsite();
});

// Global functions (for HTML calls)
window.gameWebsite = gameWebsite;
