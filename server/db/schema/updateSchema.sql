-- current update
USE weTubeMainDb;

ALTER TABLE users DROP COLUMN name;
ALTER TABLE users ADD COLUMN userName varchar(200) NOT NULL;
ALTER TABLE users ADD COLUMN displayName varchar(200) NOT NULL;

-- example update

-- ALTER TABLE users ADD profile_photo varchar(300);
-- ALTER TABLE users DROP COLUMN social;

-- ALTER TABLE users DROP COLUMN social_investment;

-- ALTER TABLE users ADD social int DEFAULT 5;

-- CREATE TABLE tablename (
--   /* stores the current stocks for all users */
--   PRIMARY KEY (ID)
-- );