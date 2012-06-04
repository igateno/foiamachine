drop table if exists `foia`.`request_log_agencies`;
drop table if exists `foia`.`request_log_doc_types`;
drop table if exists `foia`.`request_log`;

/*
 * This table should have one row per request made by the user.
 * There should be a one-to-many relationship between rows in this
 * table and rows in the request_log_* tables, which are meant to
 * contain auxiliary information about each request.
 */
create table `foia`.`request_log` (
  `id` integer unsigned not null auto_increment primary key,
  `user_id` integer unsigned not null,
  `country_id` integer unsigned not null,
  `topic_id` integer unsigned not null,
  `start_date` datetime default null,
  `end_date` datetime default null,
  `question` text,
  `created` timestamp default current_timestamp,
  constraint `user_id_foreign_key`
    foreign key (`user_id`) references users(`id`)
    on delete cascade,
  constraint `country_id_foreign_key`
    foreign key (`country_id`) references entities(`id`)
    on delete cascade,
  constraint `topic_id_foreign_key`
    foreign key (`topic_id`) references entities(`id`)
    on delete cascade
) engine = InnoDB;

create table `foia`.`request_log_agencies` (
  `request_log_id` integer unsigned not null,
  `agency_id` integer unsigned not null,
  primary key (`request_log_id`, `agency_id`),
  constraint `request_log_id_foreign_key`
    foreign key (`request_log_id`) references request_log(`id`)
    on delete cascade,
  constraint `agency_id_foreign_key`
    foreign key (`agency_id`) references entities(`id`)
    on delete cascade
) engine = InnoDB;

create table `foia`.`request_log_doc_types` (
  `request_log_id` integer unsigned not null,
  `doctype_id` integer unsigned not null,
  primary key (`request_log_id`, `doctype_id`),
  constraint `request_log_id_foreign_key_1`
    foreign key (`request_log_id`) references request_log(`id`)
    on delete cascade,
  constraint `doc_type_id_foreign_key`
    foreign key (`doctype_id`) references entities(`id`)
    on delete cascade
) engine = InnoDB;
