CREATE TABLE `courts` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`winner_id` integer NOT NULL,
	`loser_id` integer NOT NULL,
	`sport` text NOT NULL,
	`court_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loser_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`last_match_at` integer,
	`last_court_id` integer,
	FOREIGN KEY (`last_court_id`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE no action
);
