package com.erisn.erisn.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.bson.types.ObjectId;
import lombok.Data;

@Data
@Document(collection = "students")
public class Student {
    @Id
    private ObjectId studentID; // ssince MongoDB uses ObjectId as ID type

    @Field("fullName")

    private String fullName;
     @Field("email")
    private String email;
    @Field("course")

    private String course;
}
