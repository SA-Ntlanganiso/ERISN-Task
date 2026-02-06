import React, { useState } from 'react';
import './DSFilters.css';

function DSFilters({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search params object based on search type
    const searchParams = {};
    
    if (!searchTerm.trim()) {
      // Empty search - trigger fetch all students
      onSearch({});
      return;
    }

    // Map search type to appropriate parameter
    switch (searchType) {
      case 'name':
        searchParams.name = searchTerm;
        break;
      case 'email':
        searchParams.email = searchTerm;
        break;
      case 'course':
        searchParams.course = searchTerm;
        break;
      case 'all':
      default:
        searchParams.keyword = searchTerm;
        break;
    }

    // Call parent's onSearch with the params object
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchType('all');
    // Trigger fetch all students
    onSearch({});
  };

  return (
    <div className="ds-filters-section">
      <h3 className="filters-title">Advanced Search</h3>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term..."
          />
          
          <div className="search-options">
            <div className="search-type-selector">
              <label>Search by:</label>
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="search-select"
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="course">Course</option>
              </select>
            </div>
            
            <div className="search-buttons">
              <button 
                type="submit" 
                className="btn-search"
              >
                Search
              </button>
              <button 
                type="button" 
                className="btn-clear" 
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </form>
   
    </div>
  );
}

export default DSFilters;