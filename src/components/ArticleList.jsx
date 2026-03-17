export default function ArticleList({ articles, onSelectArticle, onDeleteArticle }) {
  if (articles.length === 0) {
    return (
      <div className="card p-12 text-center animate-scale-in">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 rounded-full bg-dark-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-display font-black text-dark-900 mb-2">No Articles Yet</h3>
        <p className="text-dark-500 max-w-sm mx-auto">Start by entering keywords to generate your first technical blog post</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-5 border-b border-dark-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-black text-dark-900">Your Articles</h2>
            <p className="text-sm text-dark-500 mt-1">
              <span className="font-semibold text-primary-600">{articles.length}</span> article{articles.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <div className="badge badge-primary">
            <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Active
          </div>
        </div>
      </div>

      <div className="divide-y divide-dark-200/50">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className="px-6 py-5 hover:bg-dark-50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            onClick={() => onSelectArticle(article)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-primary-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-dark-900 group-hover:text-primary-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-dark-500 ml-11">
                  {article.outputMode === 'compare' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-200">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Compare
                    </span>
                  )}
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded bg-dark-100 flex items-center justify-center mr-1.5">
                      <svg className="w-3 h-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="font-medium">{article.keyword}</span>
                  </div>
                  <div className="w-px h-4 bg-dark-300"></div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this article?')) {
                    onDeleteArticle(article.id);
                  }
                }}
                className="flex-shrink-0 p-2.5 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                title="Delete article"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="ml-11 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="inline-flex items-center text-xs text-primary-600 font-medium">
                <span>Click to view and edit</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
