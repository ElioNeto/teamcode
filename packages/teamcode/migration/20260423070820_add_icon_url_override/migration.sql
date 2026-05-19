ALTER TABLE `project` ADD `icon_url_override` text;--> statement-breakpoint
UPDATE `project` SET `icon_url_override` = `icon_url` WHERE `icon_url` IS NOT NULL;
