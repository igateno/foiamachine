create database if not exists `foia`;

drop table if exists `foia`.`relations`;
drop table if exists `foia`.`entities`;
drop table if exists `foia`.`requests`;
drop table if exists `foia`.`users`;

create table `foia`.`entities` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR (250) NOT NULL,
  `type` INTEGER UNSIGNED NOT NULL
) engine = InnoDB;

create table `foia`.`relations` (
  `id1` INTEGER UNSIGNED NOT NULL,
  `id2` INTEGER UNSIGNED NOT NULL,
  `type` INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (`id1`, `id2`, `type`),
  CONSTRAINT `id1_foreign_key`
    FOREIGN KEY (`id1`) REFERENCES entities(`id`)
    ON DELETE CASCADE,
  CONSTRAINT `id2_foreign_key`
    FOREIGN KEY (`id2`) REFERENCES entities(`id`)
    ON DELETE CASCADE
  /* Check that id1 <> id2 in code or switch to Postgres and implement check */
) engine = InnoDB;

create table `foia`.`requests` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `from` VARCHAR (20) NOT NULL,
  `to` VARCHAR (20) NOT NULL,
  `message` TEXT NOT NULL
) engine = InnoDB;

create table `foia`.`users` (
  `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR (20) NOT NULL,
  `email` VARCHAR (100),
  `hash` CHAR (64) NOT NULL,
  `salt` CHAR (64) NOT NULL,
  `type` INTEGER UNSIGNED NOT NULL
) engine = InnoDB;
