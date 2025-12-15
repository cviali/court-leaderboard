CREATE TABLE `matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`winner_id` integer NOT NULL,
	`loser_id` integer NOT NULL,
	`sport` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`winner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loser_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`points` integer DEFAULT 0 NOT NULL
);
