CREATE TABLE short_link_paste (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`language` text,
	FOREIGN KEY (`short_link_id`) REFERENCES short_link(`id`)
);

CREATE TABLE short_link_upload (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`size` integer NOT NULL,
	`hash` text NOT NULL,
	FOREIGN KEY (`short_link_id`) REFERENCES short_link(`id`)
);

CREATE TABLE short_link_url (
	`short_link_id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	FOREIGN KEY (`short_link_id`) REFERENCES short_link(`id`)
);

CREATE TABLE short_link (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`expires_at` integer,
	`type` text NOT NULL
);
