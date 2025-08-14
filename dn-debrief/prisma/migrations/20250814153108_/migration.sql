-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "search" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "credential" INTEGER NOT NULL DEFAULT 0,
    "birthdate" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "cookies" BOOLEAN,
    "claims" JSONB
);

-- CreateTable
CREATE TABLE "supervisors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "surname" TEXT,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "supervisors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "awards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "award" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "awardedById" INTEGER,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "awards_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "search" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "league" TEXT NOT NULL DEFAULT 'SENIOR',
    "region" TEXT
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "memberships_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "content" JSONB NOT NULL,
    "link" TEXT
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TOURNAMENT',
    "code" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "search" TEXT NOT NULL,
    "external" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "beginning" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "deadline" DATETIME NOT NULL,
    "exceptions" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "registration" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "userData" JSONB,
    "eventId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventOrganizers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EventOrganizers_A_fkey" FOREIGN KEY ("A") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventOrganizers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_search_idx" ON "users"("email", "search");

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_email_key" ON "supervisors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_userId_key" ON "supervisors"("userId");

-- CreateIndex
CREATE INDEX "supervisors_email_idx" ON "supervisors"("email");

-- CreateIndex
CREATE INDEX "awards_userId_awardedById_award_level_idx" ON "awards"("userId", "awardedById", "award", "level");

-- CreateIndex
CREATE UNIQUE INDEX "awards_userId_award_level_key" ON "awards"("userId", "award", "level");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_search_key" ON "clubs"("search");

-- CreateIndex
CREATE INDEX "clubs_search_region_league_idx" ON "clubs"("search", "region", "league");

-- CreateIndex
CREATE INDEX "memberships_userId_clubId_year_idx" ON "memberships"("userId", "clubId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_clubId_year_key" ON "memberships"("userId", "clubId", "year");

-- CreateIndex
CREATE INDEX "blogs_title_idx" ON "blogs"("title");

-- CreateIndex
CREATE UNIQUE INDEX "events_code_key" ON "events"("code");

-- CreateIndex
CREATE INDEX "events_code_search_beginning_end_idx" ON "events"("code", "search", "beginning", "end");

-- CreateIndex
CREATE INDEX "registrations_userId_eventId_idx" ON "registrations"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "_EventOrganizers_AB_unique" ON "_EventOrganizers"("A", "B");

-- CreateIndex
CREATE INDEX "_EventOrganizers_B_index" ON "_EventOrganizers"("B");
