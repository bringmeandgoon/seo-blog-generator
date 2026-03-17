// localStorage 数据管理工具

const STORAGE_KEYS = {
  ARTICLES: 'dev_blog_articles',
  API_CONFIG: 'dev_blog_api_config',
};

export const storage = {
  // 文章管理
  getArticles() {
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    return data ? JSON.parse(data) : [];
  },

  saveArticle(article) {
    const articles = this.getArticles();
    const existingIndex = articles.findIndex(a => a.id === article.id);

    if (existingIndex >= 0) {
      articles[existingIndex] = article;
    } else {
      articles.push(article);
    }

    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    return article;
  },

  deleteArticle(articleId) {
    const articles = this.getArticles().filter(a => a.id !== articleId);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  },

  clearAllArticles() {
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
  },

  // API 配置管理（段落编辑）
  getAPIConfig() {
    const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    return data ? JSON.parse(data) : {
      apiKey: '',
      model: '',
      endpoint: ''
    };
  },

  saveAPIConfig(config) {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  }
};
