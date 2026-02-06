package com.erisn.erisn.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.bson.types.ObjectId;
import com.erisn.erisn.model.Student;
import java.util.List;

public interface StudentRepository extends MongoRepository<Student, ObjectId> {
    
    List<Student> findByFullNameContainingIgnoreCase(String fullName);
    
    List<Student> findByEmailContainingIgnoreCase(String email);
    
    List<Student> findByCourseContainingIgnoreCase(String course);

    // my secrete toa  search across multiple fields and ist verry fast 2
    @Query("{ $or: [ " +
           "{ 'fullName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'email': { $regex: ?0, $options: 'i' } }, " +
           "{ 'course': { $regex: ?0, $options: 'i' } } " +
           "] }")
    List<Student> searchStudents(String keyword);
}