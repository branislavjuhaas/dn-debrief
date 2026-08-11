ALTER TABLE "methodology_files" RENAME COLUMN "file_path" TO "file_url";--> statement-breakpoint
ALTER TABLE "methodology_files" ALTER COLUMN "file_url" SET NOT NULL;