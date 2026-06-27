CREATE INDEX `session_directory_idx` ON `session` (`directory`);--> statement-breakpoint
CREATE INDEX `session_time_updated_idx` ON `session` (`time_updated`);--> statement-breakpoint
CREATE INDEX `session_project_parent_time_updated_idx` ON `session` (`project_id`,`parent_id`,`time_updated`);