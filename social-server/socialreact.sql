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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.comments: ~4 rows (aproximadamente)
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`) VALUES
	(1, 5, 2, 'allo', '2025-03-03 16:11:46'),
	(2, 5, 20, 'és pobre? \nchama aí o numeiro pode ser que ele te de um bocado 💩', '2025-03-03 16:22:57'),
	(3, 3, 7, 'allo', '2025-03-04 14:00:40'),
	(4, 5, 7, 'wwww', '2025-03-04 15:26:03'),
	(5, 6, 2, 'GG mano, eu subi ontem e ja estou no grind outravez 💪', '2025-03-05 14:30:42');

-- A despejar estrutura para tabela socialreact.comment_reactions
CREATE TABLE IF NOT EXISTS `comment_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction_type` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_comment` (`user_id`,`comment_id`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `comment_reactions_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.comment_reactions: ~0 rows (aproximadamente)
INSERT INTO `comment_reactions` (`id`, `comment_id`, `user_id`, `reaction_type`, `created_at`) VALUES
	(1, 5, 2, 'thumbs_up', '2025-03-05 15:35:22');

-- A despejar estrutura para tabela socialreact.comment_replies
CREATE TABLE IF NOT EXISTS `comment_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_reply_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comment_id` (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `comment_replies_ibfk_3` (`parent_reply_id`),
  CONSTRAINT `comment_replies_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_replies_ibfk_3` FOREIGN KEY (`parent_reply_id`) REFERENCES `comment_replies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.comment_replies: ~0 rows (aproximadamente)
INSERT INTO `comment_replies` (`id`, `comment_id`, `user_id`, `content`, `created_at`, `parent_reply_id`) VALUES
	(1, 5, 22, 'Adiciona aí para farmar uns bosses.', '2025-03-05 15:23:26', NULL),
	(4, 5, 2, 'ol', '2025-03-05 16:00:03', 1),
	(5, 5, 22, 'allo estas ocupada', '2025-03-05 16:02:31', 1),
	(6, 5, 22, 'oh louco', '2025-03-05 16:02:55', 4);

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.friends: ~12 rows (aproximadamente)
INSERT INTO `friends` (`id`, `user_id`, `friend_id`, `created_at`, `status`) VALUES
	(1, 2, 3, '2025-02-09 18:00:15', 'pending'),
	(3, 2, 6, '2025-02-09 18:13:16', 'accepted'),
	(4, 2, 4, '2025-02-10 15:30:41', 'pending'),
	(7, 15, 7, '2025-02-17 18:00:37', 'accepted'),
	(9, 17, 2, '2025-02-21 21:08:50', 'accepted'),
	(15, 8, 2, '2025-02-26 13:58:56', 'accepted'),
	(21, 18, 2, '2025-02-26 15:13:58', 'accepted'),
	(23, 19, 2, '2025-02-26 18:46:42', 'accepted'),
	(25, 2, 16, '2025-03-01 11:45:57', 'accepted'),
	(27, 20, 2, '2025-03-03 15:52:13', 'accepted'),
	(28, 2, 7, '2025-03-04 16:32:55', 'accepted'),
	(29, 21, 2, '2025-03-04 17:00:36', 'accepted'),
	(30, 22, 2, '2025-03-05 14:32:27', 'accepted');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.likes: ~1 rows (aproximadamente)
INSERT INTO `likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES
	(2, 5, 2, '2025-03-03 16:20:24'),
	(3, 3, 7, '2025-03-04 14:00:34'),
	(4, 6, 2, '2025-03-05 14:30:06');

-- A despejar estrutura para tabela socialreact.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT '0',
  `reply_to_id` int DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `reply_to_id` (`reply_to_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=252 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela socialreact.messages: ~244 rows (aproximadamente)
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `sent_at`, `is_read`, `reply_to_id`, `image_url`) VALUES
	(1, 2, 6, 'allo', '2025-02-10 13:05:56', 1, NULL, NULL),
	(2, 6, 2, 'ta tudo?', '2025-02-10 13:07:06', 1, NULL, NULL),
	(3, 2, 6, 'allo', '2025-02-10 13:11:38', 1, NULL, NULL),
	(4, 6, 2, 'acho que nao esta a funcionar corretamente', '2025-02-10 13:11:57', 1, NULL, NULL),
	(5, 2, 6, 'asas', '2025-02-10 16:42:32', 1, NULL, NULL),
	(6, 2, 6, 'wwwwwww', '2025-02-10 16:43:05', 1, NULL, NULL),
	(7, 6, 2, 'aswedsasdd', '2025-02-10 16:46:02', 1, NULL, NULL),
	(8, 2, 6, 'nnnnmmm', '2025-02-11 11:59:32', 1, NULL, NULL),
	(9, 6, 2, 'Teste de notificaçao', '2025-02-11 12:17:56', 1, NULL, NULL),
	(10, 6, 2, 'allo', '2025-02-11 14:05:49', 1, NULL, NULL),
	(11, 2, 6, 'queres cenas?', '2025-02-11 14:06:00', 1, NULL, NULL),
	(12, 2, 6, 'so se tiveres amnesia', '2025-02-11 14:09:28', 1, NULL, NULL),
	(13, 6, 2, 'isso devia ser eu a dizer xD', '2025-02-11 14:09:49', 1, NULL, NULL),
	(14, 2, 6, 'siga entao?', '2025-02-11 14:18:56', 1, NULL, NULL),
	(15, 2, 6, '😊', '2025-02-11 15:21:53', 1, NULL, NULL),
	(16, 2, 6, '😹', '2025-02-11 15:24:32', 1, NULL, NULL),
	(17, 2, 6, 'asdfg', '2025-02-11 16:16:34', 1, NULL, NULL),
	(18, 2, 6, 'esta tudo bem', '2025-02-11 16:21:20', 1, 2, NULL),
	(19, 2, 6, '🚓', '2025-02-11 16:21:29', 1, NULL, NULL),
	(20, 2, 6, 'www', '2025-02-13 15:23:03', 1, NULL, NULL),
	(21, 2, 6, '555', '2025-02-13 15:35:41', 1, NULL, NULL),
	(22, 2, 6, 'esta mensagem est toda lixado e a de baixo tambem 💀💀', '2025-02-13 15:38:13', 1, 6, NULL),
	(23, 2, 6, '😀😀', '2025-02-13 15:52:31', 1, NULL, NULL),
	(24, 2, 6, 'teste teste reply ', '2025-02-13 15:53:41', 1, 13, NULL),
	(25, 2, 6, 'este é manwhua é muito bravo 🥵', '2025-02-13 16:34:32', 1, NULL, '/uploads/messages/message-1739464472490-286468024.jpg'),
	(26, 2, 6, 'testes de imagem 2', '2025-02-13 16:35:29', 1, NULL, '/uploads/messages/message-1739464529523-237529435.jpg'),
	(27, 2, 6, 'teste 3', '2025-02-13 16:36:50', 1, NULL, '/uploads/messages/message-1739464610613-802194801.jpg'),
	(28, 2, 6, '', '2025-02-13 16:44:02', 1, NULL, '/uploads/messages/message-1739465042338-856134315.jpg'),
	(29, 2, 6, '', '2025-02-13 16:44:15', 1, NULL, '/uploads/messages/message-1739465055563-66335920.jpg'),
	(30, 2, 6, 'top', '2025-02-13 16:47:23', 1, NULL, NULL),
	(31, 2, 6, 'top', '2025-02-13 16:47:48', 1, NULL, NULL),
	(32, 2, 6, 'sssss', '2025-02-13 16:48:41', 1, NULL, NULL),
	(33, 2, 6, 'aaaaa', '2025-02-14 15:27:24', 1, NULL, NULL),
	(34, 2, 6, 'aaaaa', '2025-02-14 15:32:48', 1, NULL, NULL),
	(35, 2, 6, 'ja saiu o primeiro volume de solo leveling na fnac 💸', '2025-02-14 15:33:22', 1, NULL, NULL),
	(36, 2, 6, '', '2025-02-14 15:33:35', 1, NULL, NULL),
	(37, 2, 6, '', '2025-02-14 15:36:57', 1, NULL, '/uploads/messages/message-1739547417644-20986308.jpg'),
	(38, 2, 6, 'kkkkk', '2025-02-14 15:38:37', 1, NULL, '/uploads/messages/message-1739547517654-841770872.jpg'),
	(39, 2, 6, 'qqqq', '2025-02-14 15:39:08', 1, NULL, NULL),
	(40, 2, 6, 'assss', '2025-02-14 15:39:14', 1, NULL, NULL),
	(41, 2, 6, '', '2025-02-14 15:39:20', 1, NULL, '/uploads/messages/message-1739547560268-471108039.jpg'),
	(42, 2, 6, 'tentativa 10', '2025-02-14 15:41:12', 1, NULL, '/uploads/messages/message-1739547672213-703057779.jpg'),
	(43, 2, 6, '', '2025-02-14 15:41:35', 1, NULL, '/uploads/messages/message-1739547695563-500187313.jpg'),
	(44, 2, 6, 'agr vai', '2025-02-14 15:50:14', 1, NULL, '/uploads/messages/message-1739548214658-820166137.jpg'),
	(45, 7, 2, 'como é?', '2025-02-14 15:51:56', 1, NULL, NULL),
	(46, 2, 7, 'tu de 4 e eu em pe', '2025-02-14 15:52:19', 1, NULL, NULL),
	(47, 7, 2, 'ja nao esta a funcionar como deve de ser', '2025-02-14 15:52:40', 1, NULL, NULL),
	(48, 2, 7, 'aaaa', '2025-02-14 15:55:12', 1, NULL, NULL),
	(49, 2, 7, 'e agr ja da? olha agir nao diz que estou typing', '2025-02-14 15:59:31', 1, NULL, NULL),
	(50, 2, 7, 'e agr ja da? olha agir nao diz que estou typing', '2025-02-14 15:59:31', 1, NULL, NULL),
	(51, 2, 7, 'mas ja aparece automatico', '2025-02-14 15:59:43', 1, NULL, '/uploads/messages/message-1739548783899-779397466.jpg'),
	(52, 2, 7, 'mas ja aparece automatico', '2025-02-14 15:59:43', 1, NULL, NULL),
	(53, 2, 7, 'allo', '2025-02-14 18:41:46', 1, NULL, NULL),
	(54, 7, 2, 'aaaa', '2025-02-14 18:42:02', 1, NULL, '/uploads/messages/message-1739558522481-341651989.JPG'),
	(55, 7, 2, '', '2025-02-14 18:42:16', 1, NULL, '/uploads/messages/message-1739558536780-827107112.jpg'),
	(56, 7, 2, 'aaaaa', '2025-02-14 18:43:09', 1, NULL, NULL),
	(57, 2, 7, '', '2025-02-14 18:43:15', 1, NULL, '/uploads/messages/message-1739558595117-495990750.jpg'),
	(58, 2, 7, 'florensia', '2025-02-14 18:47:53', 1, NULL, NULL),
	(59, 2, 7, 'florensia', '2025-02-14 18:47:56', 1, NULL, NULL),
	(60, 2, 7, 'florensia', '2025-02-14 18:49:16', 1, NULL, NULL),
	(61, 2, 7, 'sssss', '2025-02-14 18:49:26', 1, NULL, '/uploads/messages/message-1739558966418-437212960.jpg'),
	(62, 2, 7, 'e isto funciona?', '2025-02-14 18:49:56', 1, 54, NULL),
	(63, 2, 7, 'eeee', '2025-02-14 18:52:23', 1, NULL, NULL),
	(64, 2, 8, '', '2025-02-14 19:00:19', 1, NULL, '/uploads/messages/message-1739559619110-267341949.gif'),
	(65, 8, 2, '😂', '2025-02-14 19:01:07', 1, NULL, NULL),
	(66, 8, 2, '', '2025-02-15 00:26:51', 1, NULL, '/uploads/messages/message-1739579211462-926025654.jpg'),
	(67, 8, 2, 'www', '2025-02-15 00:27:17', 1, NULL, NULL),
	(68, 8, 2, 'Foi muito pior que bala de canhao', '2025-02-15 00:28:40', 1, NULL, NULL),
	(69, 2, 8, 'isto ja ta fodido outravez', '2025-02-15 00:28:55', 1, NULL, NULL),
	(70, 2, 8, 'wtf', '2025-02-15 00:29:01', 1, NULL, NULL),
	(71, 8, 2, 'allo', '2025-02-15 00:29:06', 1, NULL, NULL),
	(72, 8, 2, 'afinal so buga de vez em quando', '2025-02-15 00:29:20', 1, NULL, NULL),
	(73, 2, 8, 'foi por cantares jajao', '2025-02-15 00:29:28', 1, NULL, NULL),
	(74, 7, 2, 'vamos ver se isto da', '2025-02-16 16:19:06', 1, NULL, NULL),
	(75, 7, 2, 'vou mandar mais algumas', '2025-02-16 16:19:14', 1, NULL, NULL),
	(76, 7, 2, 'we', '2025-02-16 16:20:59', 1, NULL, NULL),
	(77, 7, 2, 'we', '2025-02-16 16:20:59', 1, NULL, NULL),
	(78, 7, 2, 'we', '2025-02-16 16:21:00', 1, NULL, NULL),
	(79, 7, 2, 'we', '2025-02-16 16:21:01', 1, NULL, NULL),
	(80, 7, 2, 'we', '2025-02-16 16:21:01', 1, NULL, NULL),
	(81, 7, 2, 'we', '2025-02-16 16:21:02', 1, NULL, NULL),
	(82, 2, 7, 'we rock', '2025-02-16 16:26:03', 1, NULL, '/uploads/messages/message-1739723163702-584039546.gif'),
	(83, 7, 15, 'Boas', '2025-02-17 18:03:15', 1, NULL, NULL),
	(84, 15, 7, 'allo', '2025-02-17 18:03:21', 1, NULL, NULL),
	(85, 15, 7, '💸', '2025-02-17 18:03:45', 1, NULL, '/uploads/messages/message-1739815425069-110507354.gif'),
	(86, 15, 7, 'allo', '2025-02-17 18:03:59', 1, 83, NULL),
	(87, 7, 15, 'dfdfdfdddf', '2025-02-17 18:04:09', 1, NULL, NULL),
	(88, 2, 7, 'vvvvvv', '2025-02-17 18:09:01', 1, NULL, NULL),
	(89, 2, 7, '', '2025-02-17 18:12:02', 1, NULL, '/uploads/messages/message-1739815922251-99296736.jfif'),
	(90, 2, 17, 'ola', '2025-02-21 21:09:15', 1, NULL, NULL),
	(91, 17, 2, 'ola', '2025-02-21 21:09:30', 1, NULL, '/uploads/messages/message-1740172170935-964706515.gif'),
	(92, 2, 17, '💸', '2025-02-21 21:09:49', 1, 91, NULL),
	(93, 7, 2, 'uuuu', '2025-02-21 21:17:51', 1, NULL, NULL),
	(94, 7, 2, 'teste', '2025-02-21 21:31:06', 1, NULL, NULL),
	(95, 7, 2, 'aaaa', '2025-02-21 21:38:41', 1, NULL, NULL),
	(96, 7, 2, 'www', '2025-02-21 21:48:10', 1, NULL, NULL),
	(97, 7, 2, '💩', '2025-02-21 21:48:47', 1, NULL, NULL),
	(98, 7, 2, '', '2025-02-21 21:52:20', 1, NULL, '/uploads/messages/message-1740174740212-227547255.jpg'),
	(99, 7, 2, 'www', '2025-02-21 21:52:27', 1, NULL, NULL),
	(100, 7, 2, 'aaaaa', '2025-02-21 22:18:27', 1, NULL, NULL),
	(101, 7, 2, 'sssss', '2025-02-21 22:26:57', 1, NULL, NULL),
	(102, 7, 2, 'ssssss', '2025-02-21 22:27:04', 1, NULL, NULL),
	(103, 7, 2, 'wwwww', '2025-02-21 22:27:42', 1, NULL, NULL),
	(104, 7, 2, 'aaa', '2025-02-21 22:33:07', 1, NULL, NULL),
	(105, 2, 7, 'ww', '2025-02-24 16:00:00', 1, NULL, NULL),
	(106, 2, 7, 'ww', '2025-02-24 16:00:07', 1, 104, NULL),
	(107, 2, 7, '🐒', '2025-02-24 16:00:23', 1, NULL, '/uploads/messages/message-1740412823601-133491901.gif'),
	(108, 2, 7, '', '2025-02-24 16:00:29', 1, NULL, '/uploads/messages/message-1740412829327-656778146.jpg'),
	(109, 2, 8, 'ww', '2025-02-25 14:17:49', 1, NULL, NULL),
	(110, 8, 2, 'teste notificaçao mensagem', '2025-02-25 14:35:21', 1, NULL, NULL),
	(111, 8, 2, 'wwww', '2025-02-25 14:36:08', 1, NULL, NULL),
	(112, 8, 2, 'wwww', '2025-02-25 14:36:23', 1, NULL, NULL),
	(113, 8, 2, 'wwww', '2025-02-25 14:36:37', 1, NULL, NULL),
	(114, 2, 8, 'wwww', '2025-02-25 14:37:41', 1, NULL, NULL),
	(115, 2, 7, 'wwe', '2025-02-25 14:38:55', 1, NULL, NULL),
	(116, 2, 7, 'eeee', '2025-02-25 14:40:01', 1, NULL, NULL),
	(117, 7, 2, 'www', '2025-02-25 14:52:18', 1, NULL, NULL),
	(118, 7, 2, 'wwwwww', '2025-02-25 14:56:45', 1, NULL, NULL),
	(119, 7, 2, 'wqqq', '2025-02-25 14:57:00', 1, NULL, NULL),
	(120, 2, 7, 'qqqqqqq', '2025-02-25 14:58:22', 1, NULL, NULL),
	(121, 2, 7, 'wwwww', '2025-02-25 15:04:08', 1, NULL, NULL),
	(122, 2, 7, 'wwwww', '2025-02-25 15:27:54', 1, NULL, NULL),
	(123, 2, 7, 'wwwww', '2025-02-25 15:28:32', 1, NULL, NULL),
	(124, 7, 2, 'wwww', '2025-02-25 15:37:04', 1, NULL, NULL),
	(125, 7, 2, 'wwww', '2025-02-25 15:37:11', 1, NULL, NULL),
	(126, 7, 2, 'wwwwwwwww', '2025-02-25 15:44:08', 1, NULL, NULL),
	(127, 7, 2, 'ww', '2025-02-25 16:01:33', 1, NULL, NULL),
	(128, 2, 7, 'eeeee', '2025-02-25 16:11:02', 1, NULL, NULL),
	(129, 2, 7, 'wwww', '2025-02-25 16:11:29', 1, NULL, NULL),
	(130, 7, 2, 'ww', '2025-02-25 16:16:21', 1, NULL, NULL),
	(131, 7, 2, 'wwwww', '2025-02-25 16:22:09', 1, NULL, NULL),
	(132, 7, 2, 'fffff', '2025-02-25 16:23:39', 1, NULL, NULL),
	(133, 7, 2, 'wwww', '2025-02-25 16:36:50', 1, NULL, NULL),
	(134, 7, 2, 'wwwwww', '2025-02-25 16:46:34', 1, NULL, NULL),
	(135, 7, 2, 'qq', '2025-02-25 16:46:53', 1, NULL, NULL),
	(136, 7, 2, 'ww', '2025-02-25 16:47:18', 1, NULL, NULL),
	(137, 7, 2, 'www', '2025-02-25 16:49:11', 1, NULL, NULL),
	(138, 7, 2, 'qqq', '2025-02-25 16:50:26', 1, NULL, NULL),
	(139, 7, 2, 'qq', '2025-02-25 16:50:56', 1, NULL, NULL),
	(140, 7, 2, 'ww', '2025-02-25 16:51:11', 1, NULL, NULL),
	(141, 7, 2, 'www', '2025-02-25 16:51:27', 1, NULL, NULL),
	(142, 7, 2, 'www', '2025-02-25 16:52:20', 1, NULL, NULL),
	(143, 7, 2, 'qqqqq', '2025-02-26 11:51:07', 1, NULL, NULL),
	(144, 7, 2, 'www', '2025-02-26 11:53:03', 1, NULL, NULL),
	(145, 7, 2, 'q', '2025-02-26 11:55:41', 1, NULL, NULL),
	(146, 7, 2, '2', '2025-02-26 12:03:28', 1, NULL, NULL),
	(147, 7, 2, 'q', '2025-02-26 12:03:57', 1, NULL, NULL),
	(148, 7, 2, 'www', '2025-02-26 12:04:08', 1, NULL, NULL),
	(149, 7, 2, 'www', '2025-02-26 12:04:32', 1, NULL, NULL),
	(150, 7, 2, 'ww', '2025-02-26 12:05:10', 1, NULL, NULL),
	(151, 7, 2, 'qq', '2025-02-26 12:11:27', 1, NULL, NULL),
	(152, 7, 2, 'www', '2025-02-26 12:15:35', 1, NULL, NULL),
	(153, 7, 2, 'wwww', '2025-02-26 12:25:27', 1, NULL, NULL),
	(154, 7, 2, 'www', '2025-02-26 12:28:27', 1, NULL, NULL),
	(155, 7, 2, 'www', '2025-02-26 12:28:54', 1, NULL, NULL),
	(156, 7, 2, 'wwww', '2025-02-26 12:30:14', 1, NULL, NULL),
	(157, 7, 2, 'wwww', '2025-02-26 12:39:02', 1, NULL, NULL),
	(158, 7, 2, 'ww', '2025-02-26 12:48:36', 1, NULL, NULL),
	(159, 7, 2, 'www', '2025-02-26 12:55:56', 1, NULL, NULL),
	(160, 7, 2, 'www', '2025-02-26 12:57:12', 1, NULL, NULL),
	(161, 7, 2, 'www', '2025-02-26 13:58:03', 1, NULL, NULL),
	(162, 7, 2, 'w', '2025-02-26 13:58:14', 1, NULL, NULL),
	(163, 7, 2, 'w', '2025-02-26 13:58:24', 1, NULL, NULL),
	(164, 7, 2, 'w', '2025-02-26 13:59:41', 1, NULL, NULL),
	(165, 6, 2, 'w', '2025-02-26 14:01:52', 1, NULL, NULL),
	(166, 18, 2, 'ola', '2025-02-26 14:07:45', 1, NULL, NULL),
	(167, 18, 2, 'tudo bem', '2025-02-26 14:07:53', 1, NULL, NULL),
	(168, 18, 2, 'www', '2025-02-26 14:38:32', 1, NULL, NULL),
	(169, 18, 2, 'www', '2025-02-26 15:10:57', 1, NULL, NULL),
	(170, 2, 19, 'allo', '2025-02-26 18:47:19', 1, NULL, NULL),
	(171, 19, 2, '🙋‍♀️', '2025-02-26 18:47:52', 1, NULL, NULL),
	(172, 19, 2, '😂', '2025-02-26 18:48:05', 1, NULL, NULL),
	(173, 2, 19, 'ggg', '2025-02-26 18:48:12', 1, NULL, NULL),
	(174, 2, 19, 'oo', '2025-02-26 18:48:43', 1, 171, NULL),
	(175, 2, 7, 'e', '2025-02-27 10:05:19', 1, NULL, NULL),
	(176, 2, 7, 'w', '2025-02-27 10:05:28', 1, NULL, NULL),
	(177, 2, 7, 'ee', '2025-02-27 10:18:25', 1, NULL, NULL),
	(178, 2, 7, 'ww', '2025-02-27 10:18:38', 1, NULL, NULL),
	(179, 7, 2, 'www', '2025-02-27 10:24:40', 1, NULL, NULL),
	(180, 7, 2, 'wwwwwww', '2025-02-27 10:25:25', 1, NULL, NULL),
	(181, 2, 7, 'www', '2025-02-27 10:39:40', 1, NULL, NULL),
	(182, 7, 2, 'www', '2025-02-27 11:16:02', 1, NULL, NULL),
	(183, 2, 7, 'yyuu', '2025-02-27 11:41:37', 1, NULL, NULL),
	(184, 2, 7, 'ppp', '2025-02-27 11:41:50', 1, NULL, NULL),
	(185, 2, 7, 'op', '2025-02-27 11:42:08', 1, NULL, NULL),
	(186, 7, 2, 'rrr', '2025-02-27 11:42:21', 1, NULL, NULL),
	(187, 2, 7, 'wwww', '2025-02-27 12:03:15', 1, NULL, NULL),
	(188, 7, 2, 'wwwwww', '2025-02-27 12:03:54', 1, NULL, NULL),
	(189, 7, 2, 'www', '2025-02-27 12:04:11', 1, NULL, NULL),
	(190, 7, 2, 'wwwww', '2025-02-27 12:04:26', 1, NULL, NULL),
	(191, 7, 2, 'ss', '2025-02-27 12:26:17', 1, NULL, NULL),
	(192, 7, 2, 'sss', '2025-02-27 14:46:22', 1, NULL, NULL),
	(193, 7, 2, 'ww', '2025-02-27 14:46:40', 1, NULL, NULL),
	(194, 7, 2, 'ww', '2025-02-27 14:48:07', 1, NULL, NULL),
	(195, 7, 2, 'w', '2025-02-27 14:48:20', 1, NULL, NULL),
	(196, 7, 2, '', '2025-02-27 14:48:35', 1, NULL, '/uploads/messages/message-1740667714887-965822350.gif'),
	(197, 2, 7, 'boy acredita estou bem', '2025-02-27 14:48:58', 1, 196, NULL),
	(198, 2, 7, '33333', '2025-02-27 14:49:20', 1, 195, NULL),
	(199, 2, 7, 'eee', '2025-02-27 14:49:35', 1, 196, NULL),
	(200, 7, 2, 'ww', '2025-02-27 14:50:10', 1, NULL, NULL),
	(201, 7, 2, 'ja li esse capitulo', '2025-02-27 14:50:44', 1, 108, NULL),
	(202, 7, 2, 'eeee', '2025-03-01 11:32:21', 1, NULL, NULL),
	(203, 7, 2, 'wwww', '2025-03-01 11:32:28', 1, NULL, NULL),
	(204, 7, 2, 'wwwww', '2025-03-01 11:40:02', 1, NULL, NULL),
	(205, 2, 7, 'wwww', '2025-03-01 11:43:30', 1, NULL, NULL),
	(206, 20, 2, 'cc', '2025-03-03 15:19:06', 1, NULL, NULL),
	(207, 20, 2, 'ww', '2025-03-03 15:51:56', 1, NULL, NULL),
	(208, 7, 2, 'ww', '2025-03-04 14:26:30', 1, NULL, NULL),
	(209, 7, 2, 'w', '2025-03-04 14:44:09', 1, NULL, NULL),
	(210, 7, 2, 'ww', '2025-03-04 14:48:05', 1, NULL, NULL),
	(211, 7, 2, 'w', '2025-03-04 14:52:42', 1, NULL, NULL),
	(212, 7, 2, 'w', '2025-03-04 14:54:16', 1, NULL, NULL),
	(213, 7, 2, 'www', '2025-03-04 14:54:33', 1, NULL, NULL),
	(214, 7, 2, 'wwwww', '2025-03-04 14:57:55', 1, NULL, NULL),
	(215, 7, 2, 'wq', '2025-03-04 14:58:23', 1, NULL, NULL),
	(216, 2, 7, 'wwww', '2025-03-04 14:58:31', 1, NULL, NULL),
	(217, 7, 2, 'ww', '2025-03-04 14:58:42', 1, NULL, NULL),
	(218, 7, 2, 'www', '2025-03-04 15:01:37', 1, NULL, NULL),
	(219, 2, 7, 'www', '2025-03-04 15:01:46', 1, NULL, NULL),
	(220, 7, 2, 'ww', '2025-03-04 15:02:02', 1, NULL, NULL),
	(221, 7, 2, 'www', '2025-03-04 15:03:07', 1, NULL, NULL),
	(222, 7, 2, 'www', '2025-03-04 15:03:13', 1, NULL, NULL),
	(223, 7, 2, 'qqq', '2025-03-04 15:06:16', 1, NULL, NULL),
	(224, 7, 2, 'ww', '2025-03-04 15:08:12', 1, NULL, NULL),
	(225, 2, 7, 'ww', '2025-03-04 15:08:24', 1, NULL, NULL),
	(226, 7, 2, 'wwww', '2025-03-04 15:14:14', 1, NULL, NULL),
	(227, 7, 2, 'w', '2025-03-04 15:14:21', 1, NULL, NULL),
	(228, 7, 2, 'www', '2025-03-04 15:15:25', 1, NULL, NULL),
	(229, 2, 7, 'qqqq', '2025-03-04 15:16:13', 1, NULL, NULL),
	(230, 2, 7, 'www', '2025-03-04 15:17:55', 1, NULL, NULL),
	(231, 7, 2, 'www', '2025-03-04 15:18:01', 1, NULL, NULL),
	(232, 2, 7, 'www', '2025-03-04 15:18:38', 1, NULL, NULL),
	(233, 7, 2, '22222222', '2025-03-04 15:22:29', 1, NULL, NULL),
	(234, 7, 2, 'wwwww', '2025-03-04 15:23:54', 1, NULL, NULL),
	(235, 7, 2, 'www', '2025-03-04 15:24:11', 1, NULL, NULL),
	(236, 7, 2, 'wwww', '2025-03-04 15:24:37', 1, NULL, NULL),
	(237, 7, 2, 'www', '2025-03-04 15:24:46', 1, NULL, NULL),
	(238, 7, 2, 'wwww', '2025-03-04 15:25:13', 1, NULL, NULL),
	(239, 7, 2, 'allo allo', '2025-03-04 15:25:39', 1, NULL, NULL),
	(240, 7, 2, 'www', '2025-03-04 15:25:48', 1, NULL, NULL),
	(241, 2, 7, 'ss', '2025-03-04 16:32:32', 1, NULL, NULL),
	(242, 2, 7, 'ss', '2025-03-04 16:32:38', 1, NULL, NULL),
	(243, 2, 21, 'cc', '2025-03-04 17:01:07', 1, NULL, NULL),
	(244, 21, 2, 'ddd', '2025-03-04 17:01:12', 1, NULL, NULL),
	(245, 22, 2, 'Boas mano tudo bem?\nHj cheguei a outro nivel queres ir farmar bosses?', '2025-03-05 14:33:34', 1, NULL, NULL),
	(246, 2, 22, 'Siga, estou no server 1', '2025-03-05 14:34:52', 1, NULL, '/uploads/messages/message-1741185292066-356678576.jpg'),
	(247, 2, 22, 'ate ja', '2025-03-05 14:35:12', 1, NULL, NULL),
	(248, 22, 2, 'www', '2025-03-05 14:57:04', 1, NULL, NULL),
	(249, 2, 22, 'qqq', '2025-03-05 14:57:08', 1, NULL, NULL),
	(250, 2, 22, 'oh louco', '2025-03-05 16:05:37', 1, NULL, NULL),
	(251, 22, 2, 'mekielas?', '2025-03-05 16:05:48', 1, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.posts: ~2 rows (aproximadamente)
INSERT INTO `posts` (`id`, `user_id`, `content`, `image_url`, `created_at`) VALUES
	(1, 2, 'Ola Mundo', 'profilePicture-1735242657189-85347727.jpg', '2024-12-27 13:48:21'),
	(3, 2, 'asdfghjkl\r\n#CARIANI', '/uploads/posts/post-1735401896976-661285511.jpg', '2024-12-28 16:04:57'),
	(4, 15, 'Posososos', '/uploads/posts/post-1739815252771-699194258.jpg', '2025-02-17 18:00:52'),
	(5, 7, 'Cidade Bonita, só não vou viver para o Porto pq não tenho dinheiro.\r\n#Pobre', '/uploads/posts/post-1740651009544-76050430.jpg', '2025-02-27 10:10:09'),
	(6, 22, 'Hj consegui finalmente subir de nivel.\r\n#Florensia#NoP2W', '/uploads/posts/post-1741184981002-542686444.jpg', '2025-03-05 14:29:41');

-- A despejar estrutura para tabela socialreact.reply_reactions
CREATE TABLE IF NOT EXISTS `reply_reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reply_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction_type` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_reply` (`user_id`,`reply_id`),
  KEY `reply_id` (`reply_id`),
  CONSTRAINT `reply_reactions_ibfk_1` FOREIGN KEY (`reply_id`) REFERENCES `comment_replies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reply_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.reply_reactions: ~0 rows (aproximadamente)
INSERT INTO `reply_reactions` (`id`, `reply_id`, `user_id`, `reaction_type`, `created_at`) VALUES
	(1, 1, 2, 'heart', '2025-03-05 16:00:31'),
	(2, 4, 22, 'angry', '2025-03-05 16:01:46');

-- A despejar estrutura para tabela socialreact.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bio` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela socialreact.users: ~17 rows (aproximadamente)
INSERT INTO `users` (`id`, `email`, `username`, `password`, `profile_picture`, `cover_photo`, `birth_date`, `created_at`, `bio`, `last_active`) VALUES
	(2, 'goncalomoreira373@gmail.com', 'SlayerX', '$2b$10$ACW/Nr02B1a13Z.cyCRj5uDLzgv7JOlRCDw/AzB9DzQOClcrdzqs2', 'photo-1739285459123-533357550.JPG', 'coverPhoto-1741018884667-559383024.jpg', '1999-10-05', '2024-12-26 18:45:51', 'Sou lindo #CR7 éué 227\r\n', '2025-03-05 16:05:53'),
	(3, 'slayerxd998@gmail.com', 'Rhakeid', '$2b$10$t4FRpiyrJqzzb2pahByNUelGDDu3787SjLeQ8APVHk.tn0zNCu1XO', 'profilePicture-1735242657189-85347727.jpg', NULL, '1999-10-10', '2024-12-26 19:50:57', NULL, NULL),
	(4, 'ragusen@gmail.com', 'Ragusen', 'Kunalo9990', NULL, NULL, '2025-02-09', '2025-02-09 16:30:05', NULL, NULL),
	(6, 'asuk@gmail.com', 'Asuk', '$2b$10$E/xNPKOv2N8QOdMOZnAXPuyA7zb9vI6AGM8XMFleAF/E2SzphvKJS', 'profilePicture-1739124749584-142862384.jpg', NULL, '1998-11-04', '2025-02-09 18:12:29', NULL, '2025-02-26 14:01:56'),
	(7, 'Exitas@gmail.com', 'ExitasBerg', '$2b$10$mlTK.yCotlPZg1N/BMRIGeZ8hV/UsK7urUVwY4b4UrY.1rXRVHkvC', 'profilePicture-1739283735527-776750777.jfif', NULL, '1996-06-12', '2025-02-11 14:22:15', NULL, '2025-03-04 17:27:49'),
	(8, 'pedrosantos@gmail.com', 'PapaLoiras', '$2b$10$ktAH2f0GLQKTEdh/VIgQl.C75UZr2D0PoVkRpQEVRUN13de9EaRey', 'profilePicture-1739559491322-891398625.jfif', NULL, '2000-01-17', '2025-02-14 18:58:11', '', '2025-02-26 13:59:16'),
	(10, 'hicasbatatas@gmail.com', 'Jarvas', '$2b$10$OmuFjE1En6FiKzmhwMU/T.BzryVH92dh830WUY15JvkOolz2j.V5m', 'profilePicture-1739716678853-560021386.jfif', NULL, '1996-10-13', '2025-02-16 14:37:58', NULL, NULL),
	(11, 'uuuuuuu@gmail.com', 'isc', '$2b$10$FRutQYHzPv6wCGo19ztZQuPJRtQhRm/w2SBUoPDcJeobNvLYgB2Bi', 'profilePicture-1739717739055-595216844.jpg', NULL, '1999-05-05', '2025-02-16 14:55:39', NULL, NULL),
	(12, 'uytrewqazxcvbn@gmail.com', 'kinghicas99', '$2b$10$AB0VpPrl4UJYekJc2Osd7uji0v8YkRc5RjrK6BqfHljF7HvfZqKrK', 'profilePicture-1739718920518-775919297.jpg', NULL, '1999-11-08', '2025-02-16 15:15:20', NULL, NULL),
	(13, 'zsrxdc@gmail.com', 'akakak', '$2b$10$HvMC.peJqikseLlogFLfHeLKzAfryRmlMWO4Zf/0RXyRxpnjDEp0W', 'profilePicture-1739719214440-551868338.jpg', NULL, '2011-05-04', '2025-02-16 15:20:14', NULL, NULL),
	(14, 'asasasaaas@gmail.com', 'addd999', '$2b$10$Sjayyz7qFEKg3uHYzxvphu5z9oEUYwRNl9o/LZA/QXiDWVnL51.B6', 'profilePicture-1739719354238-836832352.jpg', NULL, '1999-02-10', '2025-02-16 15:22:34', NULL, NULL),
	(15, 'frederico@gmail.com', 'Fred99x', '$2b$10$J4NH544rtOUHI3kB25oxgeAGEgmmvVvA0TpTl315BoJYHKXDPbpNu', 'photo-1739815191679-437855681.jpg', NULL, '1999-12-11', '2025-02-17 17:58:28', 'DEDEDEDE', '2025-02-17 18:04:28'),
	(16, 'abdousasuke@gmail.com', 'Abdou99', '$2b$10$xxMj25pgF.iBrZfm9sSesuY.y90r61qOoJ.y1.Z6RfBfi3OjCf9n6', 'profilePhoto-1741017049388-30059413.jpg', 'coverPhoto-1741017049390-800457263.jpg', '1995-03-10', '2025-02-19 16:48:27', 'w22222', '2025-03-03 15:51:04'),
	(17, 'faria99@gmail.com', 'xFariaX', '$2b$10$iyqjPrOJw/0J.spoXnxk8eOFijomNcQSAy2s9o6iv1k1oRqe.5CSK', 'profilePicture-1740172096240-480002083.png', NULL, '1997-12-12', '2025-02-21 21:08:16', NULL, '2025-02-21 21:11:09'),
	(18, 'testepedidoamizade@gmail.com', 'testeteste', '$2b$10$Zpw/B3g0L5yqQFNcr3PhOeimYUNolmAN/nF996Vyryw3B5p1P1C/m', 'profilePicture-1740578573015-279182018.jpg', NULL, '1999-12-12', '2025-02-26 14:02:53', NULL, '2025-02-26 18:41:52'),
	(19, 'xLyssaRR@gmail.com', 'xLyssa', '$2b$10$d6Hbh/eSa8qhoFFscdGrl.q4BusyR8tR0uJMy1fjK.IoMADxh3jru', 'profilePicture-1740595507010-625718086.jpg', NULL, '1999-12-12', '2025-02-26 18:45:07', NULL, '2025-02-27 10:03:42'),
	(20, 'teste30@gmail.com', 'teste30', '$2b$10$RYuXqsQXdqhUtKhM/MEhPu5BbO0yS6jge6ezGKJikAmKuAjwgbR7y', 'profilePhoto-1741017098574-84562763.jpg', 'coverPhoto-1741017098576-906206995.jpg', '1999-12-05', '2025-03-03 15:18:09', 'eeeew22', '2025-03-04 14:00:01'),
	(21, 'JackRS@gmail.com', 'JackRS', '$2b$10$PLMymS5mY3hbcy5kns.wROoXvAEci0DSce4ZAqO1Ai.O7Gsr28kbu', 'profilePhoto-1741107203210-873525564.jpg', 'coverPhoto-1741107203255-346909387.jpg', '1999-12-12', '2025-03-04 16:47:20', 'Anda cá menino!', '2025-03-05 14:26:28'),
	(22, 'Bony@gmail.com', 'xBonyX', '$2b$10$xFiLB2KNjIIEPS4Rc1Ndwe.I50nwJm98QETwzfwzjbNlmkcKlFxxK', 'profilePicture-1741184835275-262710755.jpg', 'coverPhoto-1741184902796-65444630.jpg', '1999-12-12', '2025-03-05 14:27:15', 'Teste 05/03\r\nAs 14:28', '2025-03-05 16:05:54');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
