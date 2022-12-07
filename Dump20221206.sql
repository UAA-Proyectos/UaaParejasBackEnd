-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `interaction`
--

DROP TABLE IF EXISTS `interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interaction` (
  `idInteraction` int NOT NULL AUTO_INCREMENT,
  `id_user1` int NOT NULL,
  `id_user2` int NOT NULL,
  `idStatus` int NOT NULL,
  PRIMARY KEY (`idInteraction`),
  UNIQUE KEY `unique_index` (`id_user1`,`id_user2`),
  KEY `idSatus_idx` (`idStatus`),
  KEY `id_user1_idx` (`id_user1`),
  KEY `id_user2_idx` (`id_user2`),
  CONSTRAINT `id_user1` FOREIGN KEY (`id_user1`) REFERENCES `user` (`id`),
  CONSTRAINT `id_user2` FOREIGN KEY (`id_user2`) REFERENCES `user` (`id`),
  CONSTRAINT `idSatus` FOREIGN KEY (`idStatus`) REFERENCES `status` (`idStatus`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interaction`
--

LOCK TABLES `interaction` WRITE;
/*!40000 ALTER TABLE `interaction` DISABLE KEYS */;
INSERT INTO `interaction` VALUES (47,14,12,1),(50,12,14,2),(59,13,14,1),(66,12,30,1),(67,14,30,1);
/*!40000 ALTER TABLE `interaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interest`
--

DROP TABLE IF EXISTS `interest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interest`
--

LOCK TABLES `interest` WRITE;
/*!40000 ALTER TABLE `interest` DISABLE KEYS */;
INSERT INTO `interest` VALUES (1,'futbol'),(2,'basquet'),(3,'Netflix'),(4,'Sushi'),(5,'Viajes'),(6,'Negocios'),(7,'Tecnología'),(8,'Autos'),(9,'Twitter'),(10,'Instagram'),(11,'Comedia'),(12,'Día de campo'),(13,'Familia'),(14,'Series'),(15,'Peliculas'),(16,'Peliculas');
/*!40000 ALTER TABLE `interest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `match`
--

DROP TABLE IF EXISTS `match`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match` (
  `id_match` int NOT NULL AUTO_INCREMENT,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `idInteraction` int NOT NULL,
  PRIMARY KEY (`id_match`),
  UNIQUE KEY `unique_index` (`idInteraction`),
  KEY `id_match_idx` (`idInteraction`),
  CONSTRAINT `id_match` FOREIGN KEY (`idInteraction`) REFERENCES `interaction` (`idInteraction`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match`
--

LOCK TABLES `match` WRITE;
/*!40000 ALTER TABLE `match` DISABLE KEYS */;
INSERT INTO `match` VALUES (3,'2022-12-06 15:04:47',50),(5,'2022-12-06 17:35:51',59),(7,'2022-12-07 00:17:46',67);
/*!40000 ALTER TABLE `match` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `idMessage` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` int DEFAULT NULL,
  `content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_match` int DEFAULT NULL,
  PRIMARY KEY (`idMessage`),
  KEY `id_user_idx` (`id_user`),
  KEY `id_match_idx` (`id_match`),
  CONSTRAINT `match_id` FOREIGN KEY (`id_match`) REFERENCES `match` (`id_match`),
  CONSTRAINT `userId` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (8,14,'2022-12-06 18:25:15',1,'hola 3?',3),(11,14,'2022-12-06 18:27:05',1,'hola 3?',3),(14,14,'2022-12-06 18:41:23',0,'Holaaaa ?',3),(15,14,'2022-12-06 19:55:40',0,'aaaa',3),(16,14,'2022-12-06 19:56:49',0,'aaa',3),(17,14,'2022-12-06 20:00:01',0,'xd',3),(18,12,'2022-12-06 20:00:53',0,'aaaa',3),(19,14,'2022-12-06 20:01:52',0,'xxx',3),(20,14,'2022-12-06 20:02:46',0,'xxxx',3),(21,14,'2022-12-06 20:03:47',0,'aaaaaaaaaaaaaaaaaaa',3),(22,14,'2022-12-06 20:07:22',0,'aaa',3),(23,14,'2022-12-06 20:07:28',0,'xddd',3),(24,14,'2022-12-06 20:10:30',0,'aa',3),(25,14,'2022-12-06 20:11:46',0,'aaaa',3),(26,12,'2022-12-06 20:11:57',0,'jejeeee',3),(27,14,'2022-12-06 20:12:29',0,'aaa',3),(28,14,'2022-12-06 20:16:14',0,'aaaaaa',3),(29,14,'2022-12-06 20:16:28',0,'jelo',7),(30,14,'2022-12-06 20:17:07',0,'hhhhh',3),(31,14,'2022-12-06 20:28:01',0,'xd',7),(32,14,'2022-12-06 20:31:35',0,'noop',3);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photo`
--

DROP TABLE IF EXISTS `photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photo` (
  `id_photo` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_photo`),
  KEY `id_user_idx` (`id_user`),
  CONSTRAINT `idUser` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photo`
--

LOCK TABLES `photo` WRITE;
/*!40000 ALTER TABLE `photo` DISABLE KEYS */;
INSERT INTO `photo` VALUES (45,14,'http://localhost:3000/uploads/IMG_20221128_103810_212.jpg'),(46,14,'http://localhost:3000/uploads/artworks-OgiZ0iaR1iFMStAj-ujt3BA-t500x500.jpg'),(47,14,'http://localhost:3000/uploads/WhatsApp Image 2022-09-18 at 7.13.55 PM.jpeg'),(50,12,'http://localhost:3000/uploads/00a9d49d21f60fba24a8e3fbcd03b62f.jpg'),(51,12,'http://localhost:3000/uploads/profile.png'),(52,30,'http://localhost:3000/uploads/profile.png'),(53,31,'http://localhost:3000/uploads/profile.png'),(54,32,'http://localhost:3000/uploads/profile.png'),(55,33,'http://localhost:3000/uploads/profile.png');
/*!40000 ALTER TABLE `photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sexual_orientation`
--

DROP TABLE IF EXISTS `sexual_orientation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sexual_orientation` (
  `id_Sexual_orientation` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id_Sexual_orientation`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sexual_orientation`
--

LOCK TABLES `sexual_orientation` WRITE;
/*!40000 ALTER TABLE `sexual_orientation` DISABLE KEYS */;
INSERT INTO `sexual_orientation` VALUES (1,'indefinido'),(2,'heterosexual'),(3,'homosexual');
/*!40000 ALTER TABLE `sexual_orientation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `idStatus` int NOT NULL AUTO_INCREMENT,
  `Status` varchar(50) NOT NULL,
  PRIMARY KEY (`idStatus`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (1,'liked by user 1'),(2,'rejected by user 1');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `birthdate` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zodiac_sign` int DEFAULT NULL,
  `username` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `location` varchar(45) DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `id_sexual_orientation` int DEFAULT '1',
  `validated` tinyint(1) DEFAULT NULL,
  `gender` int DEFAULT NULL,
  `show_me` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `id_sexual_orientation_idx` (`zodiac_sign`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (12,'2001-02-12','2022-11-23 04:42:57','Ig. pepe_froog\nmi rola es bellakath ?',0,'Pepe Froog','test@mailinator.com','$2a$08$eaRol3bYQF5uObEvbctXNukkTD.GFoq7JZzyriquUV0pwQPetwRGC','Aguascalientes',0,2,NULL,NULL,NULL),(13,'1000-10-12','2022-11-23 16:19:48','a',11,'Jacob Bonilla','test_gina@mailinator.com','$2a$08$Q.XeMGKS.sdv3zN.cbFa5OJJeGJm8.CYfHJ4MZE.iumzfAwnvzWvy',NULL,0,2,NULL,NULL,NULL),(14,'2022-11-30','2022-11-30 02:32:10','Hola soy Jacob ?',9,'Jacob Bonilla ?','jacobhuerta875@gmail.com','$2a$08$wxEzj8gTyQXum8doQsdxeOnFW4AMS3Cwodq5ANWB6g9GNKBCeCvxO','Aguascalientes',0,3,NULL,0,0),(25,'2022-12-27','2022-12-04 21:28:09',NULL,NULL,'Jacob','aaaa@a.com','$2a$08$bIEgxLe7v9OulC9Lz2TJf.XmEUCwL8kh/a0jU1LcZBe3rwe2NrloG',NULL,0,1,NULL,NULL,NULL),(26,'2022-11-10','2022-12-05 02:42:49',NULL,NULL,'PruebaVictor','pepe28aurelio@gmail.com','$2a$08$yJdoQs3lC.sUKFDdLu8Nc.OLvZClsnGelG/IItF6ZCTw15f7RlKrG',NULL,0,1,NULL,NULL,NULL),(30,'2022-12-20','2022-12-07 00:06:28','soy vic ',4,'Vixx','vix@test.com','$2a$08$.as/NAZ0WG9W43f1T2dJEumxPbOBs/RXsyiccnU49s.ogHfTH62w6','Aguascalientes',0,1,NULL,NULL,NULL),(31,'2022-01-06','2022-12-07 03:30:50',NULL,NULL,'diosito','yaporfavor@mimir.com','$2a$08$KU43phdqT9DF/dikAlvkiepyG.2ahV24FAsJ0.4fAkmxkKV53H4F2',NULL,0,1,NULL,NULL,NULL),(32,'2016-02-02','2022-12-07 03:35:10',NULL,NULL,'profa','profa@edu.com','$2a$08$8MBQtn6sSK44lg80RiF9D.Kcd2fwI4EjT4iBliQKDytcrV78pOfcS',NULL,0,1,NULL,NULL,NULL),(33,'2022-12-27','2022-12-07 03:35:43','Soy mayestra',0,'Clelia','profa2@edu.com','$2a$08$X0XlO1q9jqSM5092RlB2X.XO0Ol4Ju.NCn8UaOUPTP3GTI.n2pMW.','Aguascalientes',0,2,NULL,0,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_interest`
--

DROP TABLE IF EXISTS `user_interest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_interest` (
  `category_id` int NOT NULL,
  `id_user` int NOT NULL,
  `id_interest` int DEFAULT NULL,
  KEY `id_user_idx` (`id_user`),
  KEY `id_interest_idx` (`id_interest`),
  CONSTRAINT `id_interest` FOREIGN KEY (`id_interest`) REFERENCES `interest` (`id`),
  CONSTRAINT `id_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_interest`
--

LOCK TABLES `user_interest` WRITE;
/*!40000 ALTER TABLE `user_interest` DISABLE KEYS */;
INSERT INTO `user_interest` VALUES (1,12,7),(1,12,14),(1,30,1),(1,14,2),(1,14,4),(1,14,5),(1,14,7),(1,14,8),(1,14,9),(1,14,10),(1,14,11),(1,14,13),(1,14,15),(1,33,7);
/*!40000 ALTER TABLE `user_interest` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-12-06 21:43:18
