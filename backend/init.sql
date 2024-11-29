SELECT 'Hello from init.sql - Script started' AS ''; -- log

CREATE DATABASE IF NOT EXISTS vacation_db;
USE vacation_db;

CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  password VARCHAR(255),
  role ENUM('admin', 'user')
);

CREATE TABLE vacations (
  vacation_id INT PRIMARY KEY AUTO_INCREMENT,
  destination VARCHAR(100),
  description TEXT,
  starting_date DATE,
  ending_date DATE,
  price DECIMAL(10, 2),
  image_path VARCHAR(255)
);

CREATE TABLE followers (
  user_id INT,
  vacation_id INT,
  PRIMARY KEY (user_id, vacation_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id)
);

-- Insert 12 users
USE vacation_db;

INSERT INTO users (first_name, last_name, email, password, role) VALUES
('John', 'Doe', 'john@example.com', 'password123', 'user'),
('Jane', 'Smith', 'jane@example.com', 'password456', 'admin'),
('Bob', 'Johnson', 'bob@example.com', 'password789', 'user'),
('Alice', 'Williams', 'alice@example.com', 'passwordabc', 'user'),
('Charlie', 'Brown', 'charlie@example.com', 'passworddef', 'user'),
('Diana', 'Davis', 'diana@example.com', 'passwordghi', 'user'),
('Ethan', 'Miller', 'ethan@example.com', 'passwordjkl', 'user'),
('Fiona', 'Wilson', 'fiona@example.com', 'passwordmno', 'user'),
('George', 'Moore', 'george@example.com', 'passwordpqr', 'user'),
('Hannah', 'Taylor', 'hannah@example.com', 'passwordstu', 'user'),
('Ian', 'Anderson', 'ian@example.com', 'passwordvwx', 'user'),
('Julia', 'Thomas', 'julia@example.com', 'passwordyz1', 'user');

-- The vacations and followers are inserted seperately in the initVacationsAndFollowers.ts file
