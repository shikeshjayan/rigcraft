import { Link } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { SEARCH_SECTIONS } from '../../hooks/useSearch';

const SearchResults = ({ search }) => {
  const {
    searchQuery,
    showSearchResults,
    isSearching,
    searchResults,
    recentSearches,
    activeIndex,
    setActiveIndex,
    handleClearRecents,
    executeSearch,
    recordSearchAndNavigate,
  } = search;

  if (!showSearchResults) return null;

  if (!searchQuery.trim()) {
    if (recentSearches.length === 0) return null;
    return (
      <div className="absolute top-full right-0 mt-2 w-full lg:w-[400px] bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-xl z-50 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">Recent searches</span>
          <button onClick={handleClearRecents} className="text-[11px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer">Clear</button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentSearches.map((term, idx) => (
            <button
              key={`recent-${term}`}
              onClick={() => executeSearch(term)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${idx === activeIndex ? 'bg-[var(--color-bg-secondary)]' : 'hover:bg-[var(--color-bg-secondary)]'}`}
            >
              <SearchOutlinedIcon sx={{ fontSize: 16, color: 'var(--color-muted)' }} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">{term}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const groups = SEARCH_SECTIONS
    .map((s) => ({ ...s, items: searchResults?.[s.key] || [] }))
    .filter((g) => g.items.length > 0);
  const hasResults = groups.length > 0;
  const viewAllIndex = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="absolute top-full right-0 mt-2 w-full lg:w-[400px] bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-xl z-50 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)' }}>
      {isSearching ? (
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)]">Searching...</div>
      ) : hasResults ? (
        <div className="max-h-[400px] overflow-y-auto">
          {(() => {
            let flatIndex = 0;
            return groups.map((group) => (
              <div key={group.key} className="border-b border-gray-100 last:border-0">
                <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-muted)]">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const idx = flatIndex++;
                  return (
                    <Link
                      to={group.link(item)}
                      key={`${group.key}-${item.id || item.slug}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => recordSearchAndNavigate(group.link(item))}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors ${idx === activeIndex ? 'bg-[var(--color-bg-secondary)]' : 'hover:bg-[var(--color-bg-secondary)]'}`}
                    >
                      {group.image && (
                        <div className="w-10 h-10 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded overflow-hidden">
                          {group.image(item) ? (
                            <img src={group.image(item)} alt={group.primary(item)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-[9px] font-bold">NO IMG</span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0 text-left">
                        <span className="text-sm font-bold text-[var(--color-text)] truncate">{group.primary(item)}</span>
                        {group.secondary && (
                          <span className="text-xs text-[var(--color-text-secondary)] truncate">{group.secondary(item)}</span>
                        )}
                        {group.price && (
                          <span className="text-xs text-[var(--color-primary)] font-bold mt-0.5">
                            ₹{(Number(group.price(item)) || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {group.badge && (
                        <div className="flex-shrink-0 hidden sm:block">
                          <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {group.badge(item)}
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ));
          })()}
          <button
            onClick={() => executeSearch(searchQuery)}
            onMouseEnter={() => setActiveIndex(viewAllIndex)}
            className={`block w-full text-center p-3 text-sm font-bold transition-colors cursor-pointer ${viewAllIndex === activeIndex ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-primary)] hover:text-white'}`}
          >
            View all results
          </button>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-[var(--color-text-secondary)]">No results found for "{searchQuery}"</div>
      )}
    </div>
  );
};

export default SearchResults;
