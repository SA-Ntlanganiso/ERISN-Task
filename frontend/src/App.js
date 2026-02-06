import React, { useState, useEffect } from 'react';
import './App.css';

// Student Register Component (inline for now)
function StudentRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: ''
  });

  const [students, setStudents] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Helper function to extract ID string from various ID formats
  const extractId = (id) => {
    console.log('=== extractId called ===');
    console.log('Input id:', id);
    console.log('typeof id:', typeof id);
    console.log('id is null?', id === null);
    console.log('id is undefined?', id === undefined);
    
    if (!id) {
      console.log('→ Returning empty string (id is falsy)');
      return '';
    }
    
    if (typeof id === 'string') {
      console.log('→ Returning string:', id);
      return id;
    }
    
    console.log('Checking for $oid property...');
    console.log('id.$oid:', id.$oid);
    console.log('id["$oid"]:', id['$oid']);
    console.log('Object.keys(id):', Object.keys(id));
    console.log('JSON.stringify(id):', JSON.stringify(id));
    
    if (typeof id === 'object' && id.$oid) {
      console.log('→ Returning $oid:', id.$oid);
      return id.$oid;
    }
    
    // Try alternative access methods
    if (typeof id === 'object' && id['$oid']) {
      console.log('→ Returning ["$oid"]:', id['$oid']);
      return id['$oid'];
    }
    
    // Check if it has a toString method that returns something useful
    if (typeof id === 'object' && id.toString && id.toString() !== '[object Object]') {
      console.log('→ Returning toString():', id.toString());
      return id.toString();
    }
    
    const result = String(id);
    console.log('→ Returning String(id):', result);
    return result;
  };

  // Helper function to get student ID from student object
  const getStudentId = (student) => {
    console.log('=== getStudentId called ===');
    console.log('Student object:', student);
    console.log('student._id:', student._id);
    console.log('typeof student._id:', typeof student._id);
    
    // Try _id first (MongoDB default), then studentID
    const result = extractId(student._id || student.studentID || student.id);
    console.log('getStudentId result:', result);
    return result;
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
        // Update existing student
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
            const studentId = getStudentId(student);
            return studentId === editingId ? updatedStudent : student;
          }));
          alert('Student updated successfully!');
        } else {
          const errorText = await response.text();
          console.error('Update failed:', errorText);
          alert('Failed to update student. Please try again.');
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
    console.log('=== handleEdit called ===');
    console.log('Editing student:', student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      course: student.course
    });
    const idString = getStudentId(student);
    console.log('Setting editingId to:', idString);
    setEditingId(idString);
    setIsFormVisible(true);
  };

  const handleDelete = async (student) => {
    console.log('=== handleDelete called ===');
    console.log('Received student:', student);
    console.log('typeof student:', typeof student);
    
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const idString = getStudentId(student);
        console.log('Deleting student with ID:', idString);
        console.log('URL will be:', `http://localhost:8080/api/students/${idString}`);
        
        const response = await fetch(`http://localhost:8080/api/students/${idString}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStudents(students.filter(s => {
            const studentId = getStudentId(s);
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
        console.log('=== Fetched students ===');
        console.log('Raw data:', data);
        if (data.length > 0) {
          console.log('First student:', data[0]);
          console.log('First student._id:', data[0]._id);
          console.log('typeof first student._id:', typeof data[0]._id);
          console.log('First student._id.$oid:', data[0]._id.$oid);
          console.log('First student._id["$oid"]:', data[0]._id['$oid']);
        }
        setStudents(data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
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

      <div className="students-list">
        <h3>Registered Students</h3>
        {students.length === 0 ? (
          <p className="no-students">No students registered yet.</p>
        ) : (
          <div className="students-grid">
            {students.map((student) => {
              const studentId = getStudentId(student);
              console.log('Rendering student card with key:', studentId);
              return (
                <div key={studentId} className="student-card">
                  <div className="student-info">
                    <h4>{student.fullName}</h4>
                    <p className="student-email">{student.email}</p>
                    <p className="student-course">{student.course}</p>
                    <p className="student-id">ID: {studentId}</p>
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