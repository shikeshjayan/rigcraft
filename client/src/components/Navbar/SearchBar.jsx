import SearchIcon from '@mui/icons-material/Search';
import SearchResults from './SearchResults';

const SearchBar = ({ search, variant = 'desktop' }) => {
  const { searchQuery, handleInputChange, handleFocus, handleSearchKeyDown, executeSearch, desktopRef, mobileRef } = search;
  const isMobile = variant === 'mobile';
  const containerRef = isMobile ? mobileRef : desktopRef;

  if (isMobile) {
    return (
      <div className="relative flex items-center" ref={containerRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search products..."
          className="w-full pl-4 pr-10 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none border border-[var(--color-border)] focus:border-[var(--color-primary)] bg-[var(--color-bg-secondary)]"
          style={{ color: 'var(--color-text)' }}
        />
        <button
          onClick={() => executeSearch(searchQuery)}
          className="absolute right-3 p-1 cursor-pointer flex items-center justify-center"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Search"
        >
          <SearchIcon sx={{ fontSize: 20 }} />
        </button>
        <SearchResults search={search} />
      </div>
    );
  }

  return (
    <div className="relative hidden lg:flex items-center group" ref={containerRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search products..."
        className="pl-5 pr-10 py-2 rounded-[var(--radius-sm)] text-[14px] font-medium outline-none transition-all w-[320px] focus:w-[320px] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20 placeholder:text-[var(--color-muted)]"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        }}
      />
      <button
        onClick={() => executeSearch(searchQuery)}
        className="absolute right-3 p-1 rounded-full transition-colors group-hover:text-[var(--color-primary)] flex items-center justify-center cursor-pointer"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Search"
      >
        <SearchIcon sx={{ fontSize: 20 }} />
      </button>
      <SearchResults search={search} />
    </div>
  );
};

export default SearchBar;
