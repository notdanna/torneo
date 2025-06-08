import { Search, X } from 'lucide-react';
import './SearchPage.css';
import { useState } from 'react';

interface SearchPageProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ 
  onSearch, 
  placeholder = "Buscar..." 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 className="search-title">Busqueda</h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="search-input"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="clear-button"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchPage;