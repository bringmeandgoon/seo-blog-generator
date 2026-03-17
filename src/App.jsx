import { useState, useEffect } from 'react';
import KeywordInput from './components/KeywordInput';
import ArticleList from './components/ArticleList';
import ArticleViewer from './components/ArticleViewer';
import CompareView from './components/compare/CompareView';
import SeoStats from './components/SeoStats';
import { storage } from './utils/storage';

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [view, setView] = useState('blog'); // 'blog' | 'seo'
  useEffect(() => {
    setArticles(storage.getArticles());
  }, []);

  const refreshArticles = () => {
    setArticles(storage.getArticles());
  };

  const handleArticlesGenerated = (newArticles) => {
    refreshArticles();
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  const handleDeleteArticle = (articleId) => {
    storage.deleteArticle(articleId);
    refreshArticles();
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有文章吗？此操作不可恢复。')) {
      storage.clearAllArticles();
      refreshArticles();
      setSelectedArticle(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-dark-200/50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-display font-black text-dark-900">
                  AI Blog Studio
                </h1>
                <p className="text-xs text-dark-400 font-medium tracking-wide">
                  Professional Content Generation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => { setView('blog'); setSelectedArticle(null); }}
                className={`btn btn-ghost text-sm font-semibold ${view === 'blog' ? 'text-primary-600' : 'text-dark-400 hover:text-dark-600'}`}
              >
                Blog Studio
              </button>
              <button
                onClick={() => { setView('seo'); setSelectedArticle(null); }}
                className={`btn btn-ghost text-sm font-semibold ${view === 'seo' ? 'text-primary-600' : 'text-dark-400 hover:text-dark-600'}`}
              >
                SEO Stats
              </button>
              {view === 'blog' && articles.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="btn btn-ghost text-dark-500 hover:text-red-600"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'seo' ? (
          <div className="animate-fade-in">
            <SeoStats onBack={() => setView('blog')} />
          </div>
        ) : selectedArticle ? (
          <div className="animate-fade-in">
            {selectedArticle.outputMode === 'compare' ? (
              <CompareView
                article={selectedArticle}
                onBack={handleBackToList}
              />
            ) : (
              <ArticleViewer
                article={selectedArticle}
                onBack={handleBackToList}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 animate-slide-up">
              <KeywordInput
                onArticlesGenerated={handleArticlesGenerated}
              />
            </div>
            <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <ArticleList
                articles={articles}
                onSelectArticle={handleSelectArticle}
                onDeleteArticle={handleDeleteArticle}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center text-sm text-dark-400">
                <div className="w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse-slow"></div>
                <span className="font-medium">Powered by dev-blog-writer</span>
              </div>
              <div className="w-px h-4 bg-dark-300"></div>
              <div className="flex items-center text-sm text-dark-400">
                <span className="font-mono">Claude Code + Search</span>
              </div>
            </div>
            <p className="text-xs text-dark-400">
              Pure frontend application with local browser storage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
