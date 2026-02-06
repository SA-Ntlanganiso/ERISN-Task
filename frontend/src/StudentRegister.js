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
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const extractId = (id) => {
    if (!id) {
      console.log('extractId: id is null/undefined');
      return '';
    }
    
    if (typeof id === 'string') {
      console.log('extractId: id is string:', id);
      return id;
    }
    
    if (typeof id === 'object' && id.$oid) {
      console.log('extractId: id has $oid:', id.$oid);
      return id.$oid;
    }
    
    const stringId = String(id);
    console.log('extractId: converting to string:', stringId);
    return stringId;
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

    try {
      if (editingId) {
        console.log('Updating student with ID:', editingId);
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
            const studentId = extractId(student._id);
            return studentId === editingId ? updatedStudent : student;
          }));
          alert('Student updated successfully!');
        } else {
          const errorText = await response.text();
          console.error('Update failed:', errorText);
          alert('Failed to update student. Please try again.');
        }
      } else {
        const response = await fetch('http://localhost:8080/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newStudent = await response.json();
          setStudents([...students, newStudent]);
          alert('Student registered successfully!');
        } else {
          const errorText = await response.text();
          console.error('Create failed:', errorText);
          alert('Failed to register student. Please try again.');
        }
      }

      // Reset form
      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
      setIsFormVisible(false);
      fetchStudents(); 
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    console.log('Editing student:', student);
    console.log('Student _id object:', student._id);
    
    setFormData({
      fullName: student.fullName,
      email: student.email,
      course: student.course
    });
    
    // Extract the ID string properly
    const idString = extractId(student._id);
    console.log('Setting editingId to:', idString);
    setEditingId(idString);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    console.log('handleDelete called with id:', id);
    console.log('id type:', typeof id);
    console.log('id object:', JSON.stringify(id));
    
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        // Extract ID string properly
        const idString = extractId(id);
        console.log('Deleting student with ID:', idString);
        
        const response = await fetch(`http://localhost:8080/api/students/${idString}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStudents(students.filter(student => {
            const studentId = extractId(student._id);
            return studentId !== idString;
          }));
          alert('Student deleted successfully!');
        } else {
          const errorText = await response.text();
          console.error('Delete failed:', errorText);
          alert('Failed to delete student. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students:', data);
        console.log('First student _id:', data[0]?._id);
        console.log('First student _id type:', typeof data[0]?._id);
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSearchResults = (searchResults) => {
    setStudents(searchResults);
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (isFormVisible) {
      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Function to copy ID to clipboard
  const copyToClipboard = (id) => {
    const idString = extractId(id);
    navigator.clipboard.writeText(idString)
      .then(() => {
        alert('ID copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy ID:', err);
      });
  };

  return (
    <section className="student-register-section">
      <div className="section-header">
        <h2 className="section-title">Student Registration</h2>
        <button 
          className="btn-toggle-form" 
          onClick={toggleForm}
        >
          {isFormVisible ? 'Cancel' : 'Register New Student'}
        </button>
      </div>

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
              />
            </div>

            <button type="submit" className="btn-submit">
              {editingId ? 'Update Student' : 'Register Student'}
            </button>
          </form>
        </div>
      )}

      <DSFilters onSearch={handleSearchResults} />

      <div className="students-list">
        <div className="students-list-header">
          <h3>Registered Students</h3>
          <div className="students-count">
            {students.length} student{students.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {students.length === 0 ? (
          <p className="no-students">No students registered yet. Register a new student to get started.</p>
        ) : (
          <div className="students-grid">
            {students.map((student) => {
              const studentId = extractId(student._id);
              console.log('Rendering student with ID:', studentId);
              return (
                <div key={studentId} className="student-card">
                  <div className="student-info">
                    <h4>{student.fullName}</h4>
                    <p className="student-email">{student.email}</p>
                    <p className="student-course">{student.course}</p>
                    <div className="student-id-section">
                      <span className="id-label">MongoDB ID:</span>
                      <div className="id-container">
                        <code className="student-id">{studentId}</code>
                        <button 
                          className="btn-copy-id"
                          onClick={() => copyToClipboard(student._id)}
                          title="Copy ID to clipboard"
                        >
                          📋
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
                      onClick={() => handleDelete(student._id)}
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

export default StudentRegister;