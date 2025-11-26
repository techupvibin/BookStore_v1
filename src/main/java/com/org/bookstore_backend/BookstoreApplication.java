package com.org.bookstore_backend;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//@SpringBootApplication(exclude = {
//		org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
//})
//public class BookstoreApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(BookstoreApplication.class, args);
//	}
//
//}
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.*;
import java.lang.reflect.InvocationTargetException;
/**
 * Main Spring Boot application class.
 * This class serves as the entry point for the Book Library application.
 *
 * @SpringBootApplication is a convenience annotation that adds:
 * - @Configuration: Tags the class as a source of bean definitions for the application context.
 * - @EnableAutoConfiguration: Tells Spring Boot to start adding beans based on classpath settings,
 * other beans, and various property settings.
 * - @ComponentScan: Tells Spring to scan for other components, configurations, and services
 * in the 'com.example.booklibrary' package, allowing them to be discovered and registered as beans.
 */
@SpringBootApplication
public class BookstoreApplication {

	// This static method runs the Spring Boot application.
	// It sets up the default configuration, starts the Spring application context,
	// performs component scanning, and starts the embedded web server (if applicable).
	public static void main(String[] args) throws InvocationTargetException, InstantiationException, IllegalAccessException, NoSuchMethodException, IOException {
//
		SpringApplication.run(BookstoreApplication.class, args);
		//MongoDBDataSource instance1 = MongoDBDataSource.getInstance();
/*
		// Breaking Singleton using Reflection
		// This will break the singleton pattern by using reflection to access the private constructor		<MongoDBDataSource> constructor = MongoDBDataSource.class.getDeclaredConstructor();
		constructor.setAccessible(true);
		MongoDBDataSource instance2 = constructor.newInstance();
		System.out.println("Instance 1: " + instance1.hashCode());
		System.out.println("Instance 2: " + instance2.hashCode());

//
		// Breaking Singleton using Serialization
		MongoDBDataSource instance1 = MongoDBDataSource.getInstance();

		// Serialize Singleton
		ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("singleton.ser"));
		out.writeObject(instance1);
		out.close();
		// Deserialize Singleton
		ObjectInputStream in = new ObjectInputStream(new FileInputStream("singleton.ser"));
		MongoDBDataSource instance2 = (MongoDBDataSource) in.readObject();
		in.close();
		System.out.println("Instance 1: " + instance1.hashCode());
		System.out.println("Instance 2: " + instance2.hashCode());
		if (instance1 == instance2) {
			System.out.println("Singleton pattern is broken!");
		} else {
			System.out.println("Singleton pattern is intact.");
		}

		/*
		  @Override
    	protected Object clone() throws CloneNotSupportedException {
        return super.clone(); // Cloning will create a new instance
    }
{
	}*/
	}
}

