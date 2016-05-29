CREATE DATABASE weTubeSessions;

USE weTubeSessions;

CREATE TABLE userSessions (
  id int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  lastLocation varchar(200),
  currentlyWatching varchar (200),
  ts timestamp
);