CREATE TABLE `short_link_event` (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`location` text,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`all_day` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`short_link_id`) REFERENCES `short_link`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_short_link_paste` (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`language` text,
	FOREIGN KEY (`short_link_id`) REFERENCES `short_link`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_short_link_paste`("short_link_id", "code", "language") SELECT "short_link_id", "code", "language" FROM `short_link_paste`;--> statement-breakpoint
DROP TABLE `short_link_paste`;--> statement-breakpoint
ALTER TABLE `__new_short_link_paste` RENAME TO `short_link_paste`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_short_link_upload` (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`size` integer NOT NULL,
	`hash` text NOT NULL,
	FOREIGN KEY (`short_link_id`) REFERENCES `short_link`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_short_link_upload`("short_link_id", "filename", "size", "hash") SELECT "short_link_id", "filename", "size", "hash" FROM `short_link_upload`;--> statement-breakpoint
DROP TABLE `short_link_upload`;--> statement-breakpoint
ALTER TABLE `__new_short_link_upload` RENAME TO `short_link_upload`;--> statement-breakpoint
CREATE TABLE `__new_short_link_url` (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	FOREIGN KEY (`short_link_id`) REFERENCES `short_link`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_short_link_url`("short_link_id", "url") SELECT "short_link_id", "url" FROM `short_link_url`;--> statement-breakpoint
DROP TABLE `short_link_url`;--> statement-breakpoint
ALTER TABLE `__new_short_link_url` RENAME TO `short_link_url`;