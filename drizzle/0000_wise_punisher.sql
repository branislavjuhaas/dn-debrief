CREATE TABLE `account` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`userId` int NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` int NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`search` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('user','organizer','junior_organizer','chief_adjudicator','motion_committee_member','admin','developer') NOT NULL DEFAULT 'user',
	`credential` int NOT NULL DEFAULT 0,
	`birthdate` date,
	`address` text,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `club` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`search` varchar(36) NOT NULL,
	`region` enum('western','central','eastern') NOT NULL,
	`league` enum('junior','senior','university') NOT NULL DEFAULT 'senior',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `club_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `club_manager` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`club_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `club_manager_id` PRIMARY KEY(`id`),
	CONSTRAINT `club_manager_user_id_club_id_unique` UNIQUE(`user_id`,`club_id`)
);
--> statement-breakpoint
CREATE TABLE `club_membership` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`club_id` int NOT NULL,
	`season` varchar(4) NOT NULL,
	`confirmed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `club_membership_id` PRIMARY KEY(`id`),
	CONSTRAINT `club_membership_user_id_season_unique` UNIQUE(`user_id`,`season`)
);
--> statement-breakpoint
CREATE TABLE `invoice` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_id` int NOT NULL,
	`payment_id` int NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_item_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoice_item_invoice_id_payment_id_unique` UNIQUE(`invoice_id`,`payment_id`)
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount` float NOT NULL,
	`paid` boolean NOT NULL DEFAULT false,
	`user_id` int NOT NULL,
	`action` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_manager` ADD CONSTRAINT `club_manager_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_manager` ADD CONSTRAINT `club_manager_club_id_user_id_fk` FOREIGN KEY (`club_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_membership` ADD CONSTRAINT `club_membership_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `club_membership` ADD CONSTRAINT `club_membership_club_id_club_id_fk` FOREIGN KEY (`club_id`) REFERENCES `club`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_item` ADD CONSTRAINT `invoice_item_invoice_id_invoice_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_item` ADD CONSTRAINT `invoice_item_payment_id_payment_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment` ADD CONSTRAINT `payment_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_search_idx` ON `user` (`search`);--> statement-breakpoint
CREATE INDEX `club_search_idx` ON `club` (`search`);--> statement-breakpoint
CREATE INDEX `club_manager_user_idx` ON `club_manager` (`user_id`);--> statement-breakpoint
CREATE INDEX `club_manager_club_idx` ON `club_manager` (`club_id`);--> statement-breakpoint
CREATE INDEX `club_membership_user_idx` ON `club_membership` (`user_id`);--> statement-breakpoint
CREATE INDEX `club_membership_user_season_idx` ON `club_membership` (`user_id`,`season`);--> statement-breakpoint
CREATE INDEX `club_membership_club_season_confirmed_idx` ON `club_membership` (`club_id`,`season`,`confirmed`);--> statement-breakpoint
CREATE INDEX `invoice_user_id_idx` ON `invoice` (`user_id`);--> statement-breakpoint
CREATE INDEX `invoice_item_invoice_id_idx` ON `invoice_item` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_item_payment_id_idx` ON `invoice_item` (`payment_id`);--> statement-breakpoint
CREATE INDEX `payment_user_id_idx` ON `payment` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_paid_idx` ON `payment` (`paid`);