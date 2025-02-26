-- --------------------------------------------------------
-- Anfitrião:                    127.0.0.1
-- Versão do servidor:           8.0.30 - MySQL Community Server - GPL
-- SO do servidor:               Win64
-- HeidiSQL Versão:              12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- A despejar estrutura para tabela socialreact.comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.comments: ~0 rows (aproximadamente)

-- A despejar estrutura para tabela socialreact.friends
CREATE TABLE IF NOT EXISTS `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `friend_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','accepted') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.friends: ~1 rows (aproximadamente)
INSERT INTO `friends` (`id`, `user_id`, `friend_id`, `created_at`, `status`) VALUES
	(1, 2, 3, '2025-02-09 18:00:15', 'pending'),
	(3, 2, 6, '2025-02-09 18:13:16', 'accepted'),
	(4, 2, 4, '2025-02-10 15:30:41', 'pending');

-- A despejar estrutura para tabela socialreact.likes
CREATE TABLE IF NOT EXISTS `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.likes: ~0 rows (aproximadamente)

-- A despejar estrutura para tabela socialreact.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  `reply_to_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `reply_to_id` (`reply_to_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela socialreact.messages: ~19 rows (aproximadamente)
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `sent_at`, `is_read`, `reply_to_id`) VALUES
	(1, 2, 6, 'allo', '2025-02-10 13:05:56', 1, NULL),
	(2, 6, 2, 'ta tudo?', '2025-02-10 13:07:06', 1, NULL),
	(3, 2, 6, 'allo', '2025-02-10 13:11:38', 1, NULL),
	(4, 6, 2, 'acho que nao esta a funcionar corretamente', '2025-02-10 13:11:57', 1, NULL),
	(5, 2, 6, 'asas', '2025-02-10 16:42:32', 1, NULL),
	(6, 2, 6, 'wwwwwww', '2025-02-10 16:43:05', 1, NULL),
	(7, 6, 2, 'aswedsasdd', '2025-02-10 16:46:02', 1, NULL),
	(8, 2, 6, 'nnnnmmm', '2025-02-11 11:59:32', 1, NULL),
	(9, 6, 2, 'Teste de notificaçao', '2025-02-11 12:17:56', 1, NULL),
	(10, 6, 2, 'allo', '2025-02-11 14:05:49', 1, NULL),
	(11, 2, 6, 'queres cenas?', '2025-02-11 14:06:00', 1, NULL),
	(12, 2, 6, 'so se tiveres amnesia', '2025-02-11 14:09:28', 1, NULL),
	(13, 6, 2, 'isso devia ser eu a dizer xD', '2025-02-11 14:09:49', 1, NULL),
	(14, 2, 6, 'siga entao?', '2025-02-11 14:18:56', 1, NULL),
	(15, 2, 6, '😊', '2025-02-11 15:21:53', 0, NULL),
	(16, 2, 6, '😹', '2025-02-11 15:24:32', 0, NULL),
	(17, 2, 6, 'asdfg', '2025-02-11 16:16:34', 0, NULL),
	(18, 2, 6, 'esta tudo bem', '2025-02-11 16:21:20', 0, 2),
	(19, 2, 6, '🚓', '2025-02-11 16:21:29', 0, NULL),
	(20, 2, 6, 'www', '2025-02-13 15:23:03', 0, NULL),
	(21, 2, 6, '555', '2025-02-13 15:35:41', 0, NULL),
	(22, 2, 6, 'esta mensagem est toda lixado e a de baixo tambem 💀💀', '2025-02-13 15:38:13', 0, 6),
	(23, 2, 6, '😀😀', '2025-02-13 15:52:31', 0, NULL),
	(24, 2, 6, 'teste teste reply ', '2025-02-13 15:53:41', 0, 13);

-- A despejar estrutura para tabela socialreact.posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.posts: ~2 rows (aproximadamente)
INSERT INTO `posts` (`id`, `user_id`, `content`, `image_url`, `created_at`) VALUES
	(1, 2, 'Ola Mundo', 'profilePicture-1735242657189-85347727.jpg', '2024-12-27 13:48:21'),
	(3, 2, 'asdfghjkl\r\n#CARIANI', '/uploads/posts/post-1735401896976-661285511.jpg', '2024-12-28 16:04:57');

-- A despejar estrutura para tabela socialreact.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.users: ~4 rows (aproximadamente)
INSERT INTO `users` (`id`, `email`, `username`, `password`, `profile_picture`, `birth_date`, `created_at`, `bio`, `last_active`) VALUES
	(2, 'goncalomoreira373@gmail.com', 'SlayerX', '$2b$10$ACW/Nr02B1a13Z.cyCRj5uDLzgv7JOlRCDw/AzB9DzQOClcrdzqs2', 'photo-1739285459123-533357550.JPG', '1999-10-05', '2024-12-26 18:45:51', 'Sou lindo #CR7 éué 22\r\n', '2025-02-13 15:53:47'),
	(3, 'slayerxd998@gmail.com', 'Rhakeid', '$2b$10$t4FRpiyrJqzzb2pahByNUelGDDu3787SjLeQ8APVHk.tn0zNCu1XO', 'profilePicture-1735242657189-85347727.jpg', '1999-10-10', '2024-12-26 19:50:57', NULL, NULL),
	(4, 'ragusen@gmail.com', 'Ragusen', 'Kunalo9990', NULL, '2025-02-09', '2025-02-09 16:30:05', NULL, NULL),
	(6, 'asuk@gmail.com', 'Asuk', '$2b$10$E/xNPKOv2N8QOdMOZnAXPuyA7zb9vI6AGM8XMFleAF/E2SzphvKJS', 'profilePicture-1739124749584-142862384.jpg', '1998-11-04', '2025-02-09 18:12:29', NULL, '2025-02-11 14:20:41'),
	(7, 'Exitas@gmail.com', 'ExitasBerg', '$2b$10$mlTK.yCotlPZg1N/BMRIGeZ8hV/UsK7urUVwY4b4UrY.1rXRVHkvC', 'profilePicture-1739283735527-776750777.jfif', '1996-06-12', '2025-02-11 14:22:15', NULL, '2025-02-11 16:20:51');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
