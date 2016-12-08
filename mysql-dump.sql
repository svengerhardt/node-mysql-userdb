SET sql_mode = '';

CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT,
	userName VARCHAR(100) NULL,
	password VARCHAR(255) NULL,
	givenName VARCHAR(100) NULL,
	familyName VARCHAR(100) NULL,
	nickName VARCHAR(100) NULL,
	organization VARCHAR(100) NULL,
	active TINYINT NULL DEFAULT 0,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	lastModified TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT uc_users UNIQUE (userName)
);

CREATE TABLE IF NOT EXISTS user_groups (
	id INT AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	lastModified TIMESTAMP DEFAULT 0 ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	CONSTRAINT uc_groups UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS user_groups_relation (
	user_id INT,
	rel_id INT,
	PRIMARY KEY (user_id, rel_id),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (rel_id) REFERENCES user_groups(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS types (
	id INT AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	PRIMARY KEY (id),
	CONSTRAINT uc_types UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS user_emails (
  id INT AUTO_INCREMENT,
  value VARCHAR(100) NOT NULL,
  primary_value TINYINT NULL DEFAULT 0,
  type_id INT NULL DEFAULT 0,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uc_emails UNIQUE (value),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
