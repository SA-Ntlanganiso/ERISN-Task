package com.erisn.erisn.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

@Document(collection = "students")
public class Student {

    @Id
    @JsonProperty("_id")  // Tell Jackson to serialize this field as "_id" in JSON
    @JsonSerialize(using = ToStringSerializer.class)  // Serialize ObjectId as plain string
    private ObjectId id;  // Keep the Java field name as "id" for cleaner code
    
    private String fullName;
    private String email;
    private String course;

    // Constructors
    public Student() {
    }

    public Student(String fullName, String email, String course) {
        this.fullName = fullName;
        this.email = email;
        this.course = course;
    }

    // Getters and Setters - these match your existing Service code
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", course='" + course + '\'' +
                '}';
    }
}