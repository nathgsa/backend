-- Create database
CREATE DATABASE IF NOT EXISTS sinking_fund_db;
USE sinking_fund_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  userID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('member', 'super_admin', 'treasurer', 'screening_committee') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members profile table
CREATE TABLE IF NOT EXISTS member (
  memberID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birthday DATE,
  gender ENUM('Male', 'Female', 'Other'),
  civilStat ENUM('Single', 'Married', 'Divorced', 'Widowed'),
  address TEXT,
  employmentStat VARCHAR(100),
  companyName VARCHAR(200),
  income DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

-- Admin profiles table (for super_admin, treasurer, screening_committee)
CREATE TABLE IF NOT EXISTS admin (
  adminID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  contributionID INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  userID INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
  INDEX idx_userID (userID),
  INDEX idx_date (date)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  loanID INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  userID INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
  INDEX idx_userID (userID),
  INDEX idx_date (date)
);

-- Loan Repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
  repaymentID INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  userID INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
  INDEX idx_userID (userID),
  INDEX idx_date (date)
);