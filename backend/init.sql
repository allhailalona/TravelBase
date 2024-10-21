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

-- Insert 12 vacations FOR NOW VACATIONS IS NOT BEING INSERTED....
USE vacation_db;

INSERT INTO vacations (destination, description, starting_date, ending_date, price, image_path) VALUES
('Paris', 'City of Love', '2024-06-01', '2024-06-07', 1200.00, 'https://example.com/paris.jpg'),
('Tokyo', 'Modern Metropolis', '2024-07-15', '2024-07-22', 1500.00, 'https://example.com/tokyo.jpg'),
('New York', 'Big Apple Adventure', '2024-08-10', '2024-08-17', 1300.00, 'https://example.com/newyork.jpg'),
('Rome', 'Ancient History Tour', '2024-09-05', '2024-09-12', 1100.00, 'https://example.com/rome.jpg'),
('Bali', 'Tropical Paradise', '2024-10-20', '2024-10-27', 1400.00, 'https://example.com/bali.jpg'),
('London', 'Royal Experience', '2024-11-15', '2024-11-22', 1250.00, 'https://example.com/london.jpg'),
('Sydney', 'Aussie Adventure', '2025-01-10', '2025-01-17', 1600.00, 'https://example.com/sydney.jpg'),
('Barcelona', 'Mediterranean Getaway', '2025-02-05', '2025-02-12', 1150.00, 'https://example.com/barcelona.jpg'),
('Dubai', 'Desert Luxury', '2025-03-20', '2025-03-27', 1700.00, 'https://example.com/dubai.jpg'),
('Maui', 'Hawaiian Paradise', '2025-04-15', '2025-04-22', 1800.00, 'https://example.com/maui.jpg'),
('Cairo', 'Ancient Egypt Explorer', '2025-05-10', '2025-05-17', 1350.00, 'https://example.com/cairo.jpg'),
('Rio de Janeiro', 'Carnival City', '2025-06-05', '2025-06-12', 1450.00, 'https://example.com/rio.jpg');

-- Insert sample data into followers table
SELECT 'About to insert items to followers table' AS ''; -- log
USE vacation_db;

INSERT INTO followers (user_id, vacation_id) VALUES
(1, 3), (1, 4), (1, 5),
(2, 1), (2, 6), (2, 8),
(3, 2), (3, 7), (3, 9),
(4, 10), (4, 11), (4, 12),
(5, 1), (5, 3), (5, 5),
(6, 2), (6, 4), (6, 6);