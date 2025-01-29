CREATE TABLE IF NOT EXISTS tblUsers (
  id INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  user_password TEXT,
  joined_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tblPosts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  body TEXT,
  parent_id INTEGER DEFAULT NULL,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  post_type TEXT,
  post_status TEXT DEFAULT 'visible',
  FOREIGN KEY (user_id) REFERENCES tblUsers (id),
  FOREIGN KEY (parent_id) REFERENCES tblPosts (id)
);

CREATE TABLE IF NOT EXISTS tblFiles (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_status TEXT DEFAULT 'visible',
  FOREIGN KEY (post_id) REFERENCES tblPosts (id)
);

CREATE TABLE IF NOT EXISTS tblReactions (
  id INTEGER PRIMARY KEY,
  reaction TEXT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES tblUsers (id),
  FOREIGN KEY (post_id) REFERENCES tblPosts (id)
);
