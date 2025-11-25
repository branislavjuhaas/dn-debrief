CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` int NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` int NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `supervisors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `supervisors_id` PRIMARY KEY(`id`),
	CONSTRAINT `supervisors_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`search` varchar(32) NOT NULL,
	`role` enum('user','organizer','junior_organizer','chief_adjudicator','motion_committee_member','admin','developer') NOT NULL DEFAULT 'user',
	`credential` int NOT NULL DEFAULT 0,
	`birthdate` date,
	`address` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `club_managers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`club_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `club_managers_id` PRIMARY KEY(`id`),
	CONSTRAINT `club_managers_user_id_club_id_unique` UNIQUE(`user_id`,`club_id`)
);
--> statement-breakpoint
CREATE TABLE `club_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`club_id` int NOT NULL,
	`user_id` int NOT NULL,
	`season` varchar(4) NOT NULL,
	`confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `club_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `club_memberships_user_id_season_unique` UNIQUE(`user_id`,`season`)
);
--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`search` varchar(32) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`league` enum('junior','senior','university') NOT NULL DEFAULT 'senior',
	`region` enum('west','central','east') DEFAULT 'central',
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `clubs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_organizers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `event_organizers_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_organizers_event_id_user_id_unique` UNIQUE(`event_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`user_id` int,
	`data` json NOT NULL,
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_registrations_event_id_user_id_unique` UNIQUE(`event_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`season` varchar(9) NOT NULL,
	`name` text NOT NULL,
	`league` enum('junior','senior','university') NOT NULL DEFAULT 'senior',
	`region` enum('west','central','east') DEFAULT 'central',
	`search` varchar(32) NOT NULL,
	`draft` boolean NOT NULL DEFAULT false,
	`beginning` timestamp(3) NOT NULL,
	`end` timestamp(3) NOT NULL,
	`details` json NOT NULL,
	`registration` json NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supervisors` ADD CONSTRAINT `supervisors_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_managers` ADD CONSTRAINT `club_managers_club_id_clubs_id_fk` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_managers` ADD CONSTRAINT `club_managers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_memberships` ADD CONSTRAINT `club_memberships_club_id_clubs_id_fk` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_memberships` ADD CONSTRAINT `club_memberships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_organizers` ADD CONSTRAINT `event_organizers_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_organizers` ADD CONSTRAINT `event_organizers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `supervisors_user_idx` ON `supervisors` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_search_idx` ON `users` (`search`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `club_managers_user_idx` ON `club_managers` (`user_id`);--> statement-breakpoint
CREATE INDEX `club_managers_club_idx` ON `club_managers` (`club_id`);--> statement-breakpoint
CREATE INDEX `club_memberships_user_idx` ON `club_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `club_memberships_user_season_idx` ON `club_memberships` (`user_id`,`season`);--> statement-breakpoint
CREATE INDEX `club_memberships_club_season_confirmed_idx` ON `club_memberships` (`club_id`,`season`,`confirmed`);--> statement-breakpoint
CREATE INDEX `clubs_search_idx` ON `clubs` (`search`);--> statement-breakpoint
CREATE INDEX `event_organizers_event_idx` ON `event_organizers` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_organizers_user_idx` ON `event_organizers` (`user_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_event_idx` ON `event_registrations` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_user_idx` ON `event_registrations` (`user_id`);--> statement-breakpoint
CREATE INDEX `events_search_idx` ON `events` (`search`);--> statement-breakpoint
CREATE INDEX `events_region_idx` ON `events` (`region`);--> statement-breakpoint
CREATE INDEX `events_season_idx` ON `events` (`season`);--> statement-breakpoint
CREATE INDEX `events_end_draft_idx` ON `events` (`end`,`draft`);