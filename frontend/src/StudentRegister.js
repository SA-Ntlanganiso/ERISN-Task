import React, { useState } from 'react';
import './StudentRegister.css';

function StudentRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    course: ''
  });

  const [students, setStudents] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
        const response = await fetch(`http://localhost:8080/api/students/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(students.map(student => 
            student.studentID === editingId ? updatedStudent : student
          ));
          alert('Student updated successfully!');
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
        }
      }

      // Reset form
      setFormData({ fullName: '', email: '', course: '' });
      setEditingId(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save student. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      fullName: student.fullName,
      email: student.email,
      course: student.course
    });
    setEditingId(student.studentID);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/students/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setStudents(students.filter(student => student.studentID !== id));
          alert('Student deleted successfully!');
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
        setStudents(data);
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

  React.useEffect(() => {
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
            {students.map((student) => (
              <div key={student.studentID} className="student-card">
                <div className="student-info">
                  <h4>{student.fullName}</h4>
                  <p className="student-email">{student.email}</p>
                  <p className="student-course">{student.course}</p>
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
                    onClick={() => handleDelete(student.studentID)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentRegister;