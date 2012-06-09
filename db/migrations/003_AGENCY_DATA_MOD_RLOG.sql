alter table `request_log`
  add `approved` bool default 0 after `question`,
  add `sent` bool default 0 after `approved`;

/* this table will have to be modified to include timeline details */
create table `agency_data` (
  `agency_id` integer unsigned not null primary key,
  `contact_name` varchar(20),
  `email` varchar (100) not null,
  `template` varchar (100), /* filename of the template */
  constraint
    foreign key (`agency_id`) references entities(`id`)
    on delete cascade
) engine = InnoDB;
