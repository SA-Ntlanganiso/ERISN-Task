import React, { useState, useEffect } from 'react';
import DSFilters from './DSFilters';
import './StudentRegister.css';
import './DSFilters.css';

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

  const extractId = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid) return id.$oid;
    return String(id);
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
        const response = await fetch(`http://localhost:8080/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(students.map(student => 
            extractId(student._id) === editingId ? updatedStudent : student
          ));
          alert('Student updated successfully!');
        } else {
          throw new Error('Failed to update student');
        }
      } else {
        const response = await fetch('http://localhost:8080/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newStudent = await response.json();
          setStudents([newStudent, ...students]);
          alert('Student registered successfully!');
        } else {
          throw new Error('Failed to register student');
        }
      }

      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
      setIsFormVisible(false);
    } catch (error) {
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
    setEditingId(extractId(student._id));
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    setIsLoading(true);
    try {
      const idString = extractId(id);
      const response = await fetch(`http://localhost:8080/api/students/${idString}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStudents(students.filter(student => 
          extractId(student._id) !== idString
        ));
        alert('Student deleted successfully!');
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (error) {
      setError(error.message);
      alert('Failed to delete student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (error) {
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
      
      const response = await fetch(`${url}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredStudents(data);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
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

  const resetForm = () => {
    setFormData({ fullName: '', email: '', course: '' });
    setEditingId(null);
    setIsFormVisible(false);
    setError(null);
  };

  const toggleForm = () => {
    if (isFormVisible) {
      resetForm();
    } else {
      setIsFormVisible(true);
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
              placeholder="Quick search by name, email, or course..."
              value={searchQuery}
              onChange={handleQuickSearch}
              className="quick-search-input"
            />
          </div>
          <button 
            className={`btn-toggle-form ${editingId ? 'editing' : ''}`} 
            onClick={toggleForm}
          >
            {editingId ? 'Cancel Edit' : isFormVisible ? 'Cancel' : '➕ Add New Student'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {isFormVisible && (
        <div className="registration-form-container slide-in">
          <h3>
            {editingId ? 
              `Editing Student #${editingId.substring(0, 8)}...` : 
              'Register New Student'
            }
          </h3>
          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">Course *</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Computer Science"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : editingId ? 'Update Student' : 'Register Student'}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DSFilters onSearch={handleSearch} />

      <div className="students-list">
        <div className="students-list-header">
          <h3>Registered Students</h3>
          <div className="stats">
            <span className="total-students">
              Total: {students.length} student{students.length !== 1 ? 's' : ''}
            </span>
            <span className="showing-students">
              Showing: {filteredStudents.length}
            </span>
            {searchQuery && (
              <span className="search-indicator">
                Searching for: "{searchQuery}"
              </span>
            )}
          </div>
        </div>
        
        {isLoading && !isFormVisible ? (
          <div className="loading">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="no-results">
            {searchQuery ? 
              'No students found matching your search.' : 
              'No students registered yet. Add your first student!'
            }
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map((student) => {
              const studentId = extractId(student._id);
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
                      <span className="label">MongoDB ID:</span>
                      <div className="id-with-copy">
                        <code className="student-id">
                          {studentId}
                        </code>
                        <button 
                          className="btn-copy"
                          onClick={() => copyToClipboard(studentId)}
                          title="Copy full ID"
                        >
                        Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="student-actions">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(student)}
                      title="Edit student"
                    >
                    Edit
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(student._id)}
                      title="Delete student"
                    >
                    Delete
                    </button>
                    <button 
                      className="btn-action btn-view"
                      onClick={() => alert(`Viewing details for ${student.fullName}`)}
                      title="View details"
                    >
                      View
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

export default StudentRegister;