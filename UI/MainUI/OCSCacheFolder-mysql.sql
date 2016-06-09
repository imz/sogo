--
-- (C) 2004-2005 SKYRIX Software AG
-- (C) 2006-2007 Inverse inc.
--

CREATE TABLE @{tableName} (
  	c_uid VARCHAR(255) NOT NULL,
        c_path VARCHAR(255) NOT NULL,
        c_parent_path VARCHAR(255),
        c_type TINYINT UNSIGNED NOT NULL,
        c_creationdate INT NOT NULL,
        c_lastmodified INT NOT NULL,
        c_version INT NOT NULL DEFAULT 0,
        c_deleted TINYINT NOT NULL DEFAULT 0,
        c_content LONGTEXT,
        CONSTRAINT @{tableName}_pkey PRIMARY KEY (c_uid, c_path)
);
