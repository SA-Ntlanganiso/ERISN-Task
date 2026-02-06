import React, { useState } from 'react';
import './DSFilters.css';

function DSFilters({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      try {
        const response = await fetch('http://localhost:8080/api/students');
        if (response.ok) {
          const data = await response.json();
          onSearch(data);
        }
      } catch (error) {
        console.error('Error fetching all students:', error);
      }
      return;
    }

    try {
      let url;
      switch (searchType) {
        case 'name':
          url = `http://localhost:8080/api/students/search/name?name=${encodeURIComponent(searchTerm)}`;
          break;
        case 'email':
          url = `http://localhost:8080/api/students/search/email?email=${encodeURIComponent(searchTerm)}`;
          break;
        case 'course':
          url = `http://localhost:8080/api/students/search/course?course=${encodeURIComponent(searchTerm)}`;
          break;
        case 'all':
        default:
          url = `http://localhost:8080/api/students/search?keyword=${encodeURIComponent(searchTerm)}`;
          break;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        onSearch(data);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      alert('Failed to search students. Please try again.');
    }
  };

  const handleClear = async () => {
    setSearchTerm('');
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        onSearch(data);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
    }
  };

  return (
    <div className="ds-filters-section">
      <h3 className="filters-title">Search Students</h3>
      
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
              <button type="submit" className="btn-search">
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
      
      <div className="search-tips">
        <p className="tips-title">Search Tips:</p>
        <ul className="tips-list">
          <li>Search by name: "John" or "John Doe"</li>
          <li>Search by email: "example@domain.com"</li>
          <li>Search by course: "Computer Science" or "Engineering"</li>
          <li>Use "All Fields" for broader search across all student information</li>
        </ul>
      </div>
    </div>
  );
}

export default DSFilters;