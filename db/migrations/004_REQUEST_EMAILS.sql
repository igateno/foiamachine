/* details about request emails sent and received */
create table `request_emails` (
  `id` integer unsigned not null auto_increment primary key,
  `request_log_id` integer unsigned not null,
  `agency_id` integer unsigned not null,
  `subject` varchar(255),
  `body` text,
  `outgoing` boolean,
  `timestamp` timestamp,
  constraint
    foreign key (`request_log_id`) references request_log(`id`)
    on delete cascade
) engine = InnoDB;
