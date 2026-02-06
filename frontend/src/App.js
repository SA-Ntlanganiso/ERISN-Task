import React, { useState, useEffect } from 'react';
import './App.css';

// DSFilters Component
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

// Student Register Component
function StudentRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: ''
  });

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to extract ID string from various ID formats
  const extractId = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid) return id.$oid;
    return String(id);
  };

  // Helper function to get student ID from student object
  const getStudentId = (student) => {
    return extractId(student._id || student.studentID || student.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Update existing student
        const response = await fetch(`http://localhost:8080/api/students/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(students.map(student => {
            const studentId = getStudentId(student);
            return studentId === editingId ? updatedStudent : student;
          }));
          setFilteredStudents(filteredStudents.map(student => {
            const studentId = getStudentId(student);
            return studentId === editingId ? updatedStudent : student;
          }));
          alert('Student updated successfully!');
        } else {
          const errorText = await response.text();
          console.error('Update failed:', errorText);
          throw new Error('Failed to update student');
        }
      } else {
        // Create new student
        const response = await fetch('http://localhost:8080/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newStudent = await response.json();
          setStudents([newStudent, ...students]);
          setFilteredStudents([newStudent, ...filteredStudents]);
          alert('Student registered successfully!');
        } else {
          const errorText = await response.text();
          console.error('Create failed:', errorText);
          throw new Error('Failed to register student');
        }
      }

      // Reset form
      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
      setIsFormVisible(false);
      fetchStudents();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      alert('Failed to save student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      fullName: student.fullName,
      email: student.email,
      course: student.course
    });
    const idString = getStudentId(student);
    setEditingId(idString);
    setIsFormVisible(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setIsLoading(true);
      try {
        const idString = getStudentId(student);
        
        const response = await fetch(`http://localhost:8080/api/students/${idString}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStudents(students.filter(s => {
            const studentId = getStudentId(s);
            return studentId !== idString;
          }));
          setFilteredStudents(filteredStudents.filter(s => {
            const studentId = getStudentId(s);
            return studentId !== idString;
          }));
          alert('Student deleted successfully!');
        } else {
          const errorText = await response.text();
          console.error('Delete failed:', errorText);
          throw new Error('Failed to delete student');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        alert('Failed to delete student. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students:', data);
        setStudents(data);
        setFilteredStudents(data);
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = 'http://localhost:8080/api/students';
      let params = new URLSearchParams();
      
      // Check if searchParams is empty (clear/fetch all)
      const hasSearchParams = Object.keys(searchParams).length > 0;
      
      if (hasSearchParams) {
        if (searchParams.keyword) {
          url = 'http://localhost:8080/api/students/search';
          params.append('keyword', searchParams.keyword);
        } else if (searchParams.name) {
          url = 'http://localhost:8080/api/students/search/name';
          params.append('name', searchParams.name);
        } else if (searchParams.email) {
          url = 'http://localhost:8080/api/students/search/email';
          params.append('email', searchParams.email);
        } else if (searchParams.course) {
          url = 'http://localhost:8080/api/students/search/course';
          params.append('course', searchParams.course);
        }
      }
      
      const finalUrl = hasSearchParams ? `${url}?${params.toString()}` : url;
      console.log('Searching with URL:', finalUrl);
      
      const response = await fetch(finalUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setFilteredStudents(data);
        // Also update students array if fetching all
        if (!hasSearchParams) {
          setStudents(data);
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setError(error.message);
      alert('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => 
      student.fullName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (isFormVisible) {
      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <section className="student-register-section">
      <div className="section-header">
        <h2 className="section-title">Student Management System</h2>
        <div className="header-actions">
          <div className="quick-search">
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={handleQuickSearch}
              className="quick-search-input"
            />
          </div>
          <button 
            className="btn-toggle-form" 
            onClick={toggleForm}
          >
            {isFormVisible ? 'Cancel' : '➕ Add Student'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {isFormVisible && (
        <div className="registration-form-container">
          <h3>{editingId ? 'Edit Student' : 'Register Student'}</h3>
          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">Course:</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Enter course name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : editingId ? 'Update Student' : 'Register Student'}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={toggleForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Advanced Search Component */}
      <DSFilters onSearch={handleSearch} />

      <div className="students-list">
        <div className="students-list-header">
          <h3>Registered Students</h3>
          <div className="stats">
            <span className="total-students">
              Total: {students.length}
            </span>
            <span className="showing-students">
              Showing: {filteredStudents.length}
            </span>
            {searchQuery && (
              <span className="search-indicator">
                Filter: "{searchQuery}"
              </span>
            )}
          </div>
        </div>

        {isLoading && !isFormVisible ? (
          <div className="loading">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <p className="no-students">
            {searchQuery || students.length > 0 ? 
              'No students found matching your search.' : 
              'No students registered yet.'}
          </p>
        ) : (
          <div className="students-grid">
            {filteredStudents.map((student) => {
              const studentId = getStudentId(student);
              return (
                <div key={studentId} className="student-card">
                  <div className="student-card-header">
                    <h4>{student.fullName}</h4>
                    <span className="student-id-badge">
                      ID: {studentId.substring(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="student-info">
                    <div className="info-row">
                      <span className="label">Email:</span>
                      <span className="value">{student.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Course:</span>
                      <span className="value">{student.course}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Full ID:</span>
                      <div className="id-with-copy">
                        <code className="student-id">{studentId}</code>
                        <button 
                          className="btn-copy"
                          onClick={() => copyToClipboard(studentId)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="student-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(student)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// Main App Component
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img src="/grad.png" className="App-logo" alt="ERISN Graduate Programme" />
          <h1 className="app-title">ERISN Graduate Programme</h1>
        </div>
      </header>
      <main className="main-content">

        <section className="developer-info">
          <div className="info-card">
            <h3>Applicant Information</h3>
            <div className="info-content">
              <p><strong>Name:</strong> Sinalo Alizwa Ntlangamiso</p>
              <p><strong>Role:</strong> Aspiring Software Backend Developer</p>
              <p><strong>Tech Stack:</strong></p>
              <ul className="tech-stack">
                <li>Spring Boot (Java)</li>
                <li>Node.js</li>
                <li>Express.js</li>
                <li>React.js</li>
                <li>MongoDB</li>
                <li>CSS</li>
              </ul>
              <p className="assignment-label">ERISN Graduate Programme Assignment</p>
            </div>
          </div>
        </section>

        <StudentRegister />
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 ERISN Graduate Programme.</p>
      </footer>
    </div>
  );
}

export default App;