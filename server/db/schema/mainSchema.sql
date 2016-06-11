-- CREATE DATABASE weTubeMainDb;

USE weTubeMainDb;

CREATE TABLE users (
  -- a user table
  id int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  displayName varchar(200) NOT NULL,
  password varchar(200),
  email varchar(200) NOT NULL,
  profile_photo varchar(300)
);

CREATE TABLE friendships (
  -- a table for friendships, histrical data can be added in future
  id int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  userId1 int,
  FOREIGN KEY(userId1) REFERENCES users(id),
  userId2 int,
  FOREIGN KEY(userId2) REFERENCES users(id)
);

CREATE TABLE friendRequests (
  id int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  userId1 int,
  FOREIGN KEY(userId1) REFERENCES users(id),
  userId2 int,
  FOREIGN KEY(userId2) REFERENCES users(id)  
);