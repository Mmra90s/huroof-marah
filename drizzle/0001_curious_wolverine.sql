CREATE TABLE `gameStates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`gridLetters` text NOT NULL,
	`gridOwners` text NOT NULL,
	`currentQuestionId` int,
	`buzzedPlayerId` int,
	`buzzedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gameStates_id` PRIMARY KEY(`id`),
	CONSTRAINT `gameStates_roomId_unique` UNIQUE(`roomId`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`team` enum('team1','team2') NOT NULL,
	`isHost` boolean NOT NULL DEFAULT false,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(255) NOT NULL DEFAULT 'عام',
	`difficulty` enum('سهل','متوسط','صعب') NOT NULL DEFAULT 'متوسط',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(6) NOT NULL,
	`hostId` int NOT NULL,
	`hostName` varchar(255) NOT NULL,
	`gridSize` enum('5x5','4x4','3x3') NOT NULL DEFAULT '5x5',
	`gameMode` enum('grid_buzzer','buzzer_only','grid_only') NOT NULL DEFAULT 'grid_buzzer',
	`rounds` int NOT NULL DEFAULT 1,
	`status` enum('waiting','playing','finished') NOT NULL DEFAULT 'waiting',
	`team1Name` varchar(255) NOT NULL DEFAULT 'الفريق الأول',
	`team1Color` varchar(7) NOT NULL DEFAULT '#22c55e',
	`team2Name` varchar(255) NOT NULL DEFAULT 'الفريق الثاني',
	`team2Color` varchar(7) NOT NULL DEFAULT '#f97316',
	`currentRound` int NOT NULL DEFAULT 1,
	`team1Score` int NOT NULL DEFAULT 0,
	`team2Score` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `gameStates` ADD CONSTRAINT `gameStates_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameStates` ADD CONSTRAINT `gameStates_currentQuestionId_questions_id_fk` FOREIGN KEY (`currentQuestionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gameStates` ADD CONSTRAINT `gameStates_buzzedPlayerId_players_id_fk` FOREIGN KEY (`buzzedPlayerId`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_roomId_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_hostId_users_id_fk` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;