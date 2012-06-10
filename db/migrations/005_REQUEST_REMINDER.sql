/* queue of requests that need reminders */
create table `request_reminders` (
  `request_log_id` integer unsigned not null,
  `next_send_date` timestamp,
  constraint
    foreign key (`request_log_id`) references request_log(`id`)
    on delete cascade
) engine = InnoDB;
