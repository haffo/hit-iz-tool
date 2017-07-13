CREATE DATABASE  IF NOT EXISTS `account_iztool` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `account_iztool`;
-- MySQL dump 10.13  Distrib 5.6.13, for osx10.6 (i386)
--
-- Host: localhost    Database: account_iztool
-- ------------------------------------------------------
-- Server version	5.6.14

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `id` bigint(20) NOT NULL,
  `accountType` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `entityDisabled` bit(1) NOT NULL,
  `fullName` varchar(256) DEFAULT NULL,
  `guestAccount` bit(1) NOT NULL,
  `lastCFTestPlanPersistenceId` bigint(20) DEFAULT NULL,
  `lastLoggedInDate` datetime DEFAULT NULL,
  `lastTestPlanPersistenceId` bigint(20) DEFAULT NULL,
  `pending` bit(1) NOT NULL,
  `signedConfidentialityAgreement` bit(1) DEFAULT NULL,
  `username` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cs5bnaggwuluahrdh8mbs1rpe` (`email`),
  UNIQUE KEY `UK_48j2m0d2pfyl4aehqu34n5a8j` (`fullName`),
  UNIQUE KEY `UK_de34gsw4qt8auhffbna969ahp` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AccountPasswordReset`
--

DROP TABLE IF EXISTS `AccountPasswordReset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccountPasswordReset` (
  `id` bigint(20) NOT NULL,
  `currentToken` varchar(255) DEFAULT NULL,
  `numberOfReset` bigint(20) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_i6oajo98rebbp8et98ixj9xvc` (`currentToken`),
  UNIQUE KEY `UK_q0hkmmtuofykolk4mamqnx393` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TransportConfig`
--

DROP TABLE IF EXISTS `TransportConfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TransportConfig` (
  `id` bigint(20) NOT NULL,
  `DOMAIN` varchar(255) NOT NULL,
  `PROTOCOL` varchar(255) NOT NULL,
  `USERID` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKhdwb1taon05bnlb0sbj4d346s` (`PROTOCOL`,`DOMAIN`,`USERID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserTestCaseReport`
--

DROP TABLE IF EXISTS `UserTestCaseReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserTestCaseReport` (
  `id` bigint(20) NOT NULL,
  `accountId` bigint(20) DEFAULT NULL,
  `testCasePersistentId` bigint(20) DEFAULT NULL,
  `version` double DEFAULT NULL,
  `xml` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserTestStepReport`
--

DROP TABLE IF EXISTS `UserTestStepReport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserTestStepReport` (
  `id` bigint(20) NOT NULL,
  `accountId` bigint(20) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `html` text,
  `testStepPersistentId` bigint(20) DEFAULT NULL,
  `version` double DEFAULT NULL,
  `xml` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `authorities`
--

DROP TABLE IF EXISTS `authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authorities` (
  `username` varchar(50) NOT NULL,
  `authority` varchar(50) NOT NULL,
  KEY `fk_authorities_users` (`username`),
  CONSTRAINT `fk_authorities_users` FOREIGN KEY (`username`) REFERENCES `users` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hibernate_sequence`
--

DROP TABLE IF EXISTS `hibernate_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hibernate_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sut_initiator_config`
--

DROP TABLE IF EXISTS `sut_initiator_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sut_initiator_config` (
  `transport_config_id` bigint(20) NOT NULL,
  `property_value` varchar(255) DEFAULT NULL,
  `property_key` varchar(255) NOT NULL,
  PRIMARY KEY (`transport_config_id`,`property_key`),
  CONSTRAINT `FKlmppd4nwel4u77thy7l2549dr` FOREIGN KEY (`transport_config_id`) REFERENCES `TransportConfig` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ta_initiator_config`
--

DROP TABLE IF EXISTS `ta_initiator_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ta_initiator_config` (
  `transport_config_id` bigint(20) NOT NULL,
  `property_value` varchar(255) DEFAULT NULL,
  `property_key` varchar(255) NOT NULL,
  PRIMARY KEY (`transport_config_id`,`property_key`),
  CONSTRAINT `FKadcjnlbt8bdg1n9cnjdnsqskj` FOREIGN KEY (`transport_config_id`) REFERENCES `TransportConfig` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(256) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `accountNonExpired` tinyint(1) NOT NULL,
  `accountNonLocked` tinyint(1) NOT NULL,
  `credentialsNonExpired` tinyint(1) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-07-13 17:36:28
