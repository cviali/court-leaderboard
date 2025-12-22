CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_date_time` integer NOT NULL,
	`end_date_time` integer NOT NULL,
	`organizer` text NOT NULL,
	`created_at` integer NOT NULL
);
