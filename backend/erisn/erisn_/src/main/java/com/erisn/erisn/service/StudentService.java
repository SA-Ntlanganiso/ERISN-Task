package com.erisn.erisn.service;

import com.erisn.erisn.model.Student;
import com.erisn.erisn.repository.StudentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(ObjectId id) {
        return studentRepository.findById(id);
    }


    public Student createStudent(Student student) {
        validateStudent(student);
        return studentRepository.save(student);
    }


    public Optional<Student> updateStudent(ObjectId id, Student studentDetails) {
        return studentRepository.findById(id)
                .map(existingStudent -> {
                    existingStudent.setFullName(studentDetails.getFullName());
                    existingStudent.setEmail(studentDetails.getEmail());
                    existingStudent.setCourse(studentDetails.getCourse());
                    return studentRepository.save(existingStudent);
                });
    }

    public boolean deleteStudent(ObjectId id) {
        return studentRepository.findById(id)
                .map(student -> {
                    studentRepository.delete(student);
                    return true;
                })
                .orElse(false);
    }

    public List<Student> searchStudents(String keyword) {
        return studentRepository.searchStudents(keyword);
    }

    public List<Student> searchByName(String name) {
        return studentRepository.findByFullNameContainingIgnoreCase(name);
    }


    public List<Student> searchByEmail(String email) {
        return studentRepository.findByEmailContainingIgnoreCase(email);
    }

    public List<Student> searchByCourse(String course) {
        return studentRepository.findByCourseContainingIgnoreCase(course);
    }

    // add exception handling to debugg better  --got from ChatGBT
    private void validateStudent(Student student) {
        if (student.getFullName() == null || student.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (student.getCourse() == null || student.getCourse().trim().isEmpty()) {
            throw new IllegalArgumentException("Course is required");
        }
        if (!isValidEmail(student.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    // got this part from chatGBT still fn't know how thsi still validate some email formats
    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}