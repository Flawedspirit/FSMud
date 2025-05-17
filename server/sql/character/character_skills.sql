DROP TABLE IF EXISTS `character_skills`;

CREATE TABLE IF NOT EXISTS `character_skills` (
    `UUID` char(36) NOT NULL DEFAULT '' COMMENT 'Account identifier',
    `cooking` smallint unsigned NOT NULL DEFAULT '1',
    `herbalism` smallint unsigned NOT NULL DEFAULT '1',
    `mining` smallint unsigned NOT NULL DEFAULT '1',
    PRIMARY KEY (`UUID`)
);

LOCK TABLES `character_skills` WRITE;
UNLOCK TABLES;