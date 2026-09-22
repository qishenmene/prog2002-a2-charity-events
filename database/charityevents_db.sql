-- ============================================================
-- PROG2002 Assessment 2 — Charity Events Website
-- Database: charityevents_db
--
-- Creates the database schema and sample data for the
-- Coffs Coast Charity Collective case study.
--
-- How to import (MySQL Workbench): Server > Data Import >
-- Import from Self-Contained File > select this file > Start Import.
-- Or via command line:  mysql -u root -p < charityevents_db.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS charityevents_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE charityevents_db;

-- ------------------------------------------------------------
-- Drop existing tables (re-importable)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organisations;

-- ------------------------------------------------------------
-- Table: organisations
-- Charitable organisations that host the events
-- ------------------------------------------------------------
CREATE TABLE organisations (
  org_id         INT AUTO_INCREMENT COMMENT 'Primary key',
  org_name       VARCHAR(120) NOT NULL COMMENT 'Organisation name',
  contact_email  VARCHAR(120) NOT NULL COMMENT 'Public contact email',
  contact_phone  VARCHAR(30)  NOT NULL COMMENT 'Public contact phone',
  description    TEXT         NOT NULL COMMENT 'What the organisation does',
  PRIMARY KEY (org_id),
  UNIQUE KEY uq_org_name (org_name)
) ENGINE = InnoDB COMMENT = 'Charitable organisations hosting events';

-- ------------------------------------------------------------
-- Table: categories
-- Event categories used to group and filter events
-- ------------------------------------------------------------
CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT COMMENT 'Primary key',
  category_name VARCHAR(60) NOT NULL COMMENT 'Category name, e.g. Fun Run',
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (category_name)
) ENGINE = InnoDB COMMENT = 'Event categories for grouping and filtering';

-- ------------------------------------------------------------
-- Table: events
-- Charity events. event_status supports the policy-suspension
-- requirement: suspended events are never exposed by the API.
-- goal_amount / funds_raised power the Goal vs. Progress display.
-- ------------------------------------------------------------
CREATE TABLE events (
  event_id          INT AUTO_INCREMENT COMMENT 'Primary key',
  event_name        VARCHAR(150)   NOT NULL COMMENT 'Event name',
  event_description TEXT           NOT NULL COMMENT 'Full event description',
  event_date        DATE           NOT NULL COMMENT 'Event date (past/upcoming is derived from this)',
  event_time        TIME           NOT NULL COMMENT 'Start time',
  location          VARCHAR(150)   NOT NULL COMMENT 'Venue / suburb, used by search',
  ticket_price      DECIMAL(8, 2)  NOT NULL DEFAULT 0.00 COMMENT 'Ticket price in AUD, 0.00 = free',
  goal_amount       DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Fundraising goal in AUD',
  funds_raised      DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Amount raised so far in AUD',
  event_image       VARCHAR(255)   DEFAULT NULL COMMENT 'Image file name served by the website',
  event_status      ENUM('active', 'suspended') NOT NULL DEFAULT 'active' COMMENT 'Suspended events violate policy and are hidden',
  category_id       INT NOT NULL COMMENT 'FK -> categories',
  org_id            INT NOT NULL COMMENT 'FK -> organisations',
  PRIMARY KEY (event_id),
  KEY idx_event_date (event_date),
  KEY idx_event_status (event_status),
  KEY idx_location (location),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories (category_id),
  CONSTRAINT fk_events_org FOREIGN KEY (org_id) REFERENCES organisations (org_id)
) ENGINE = InnoDB COMMENT = 'Charity events';

-- ------------------------------------------------------------
-- Sample data: organisations
-- ------------------------------------------------------------
INSERT INTO organisations (org_name, contact_email, contact_phone, description) VALUES
('Coffs Coast Children''s Foundation', 'hello@cccf.org.au', '(02) 6650 1200',
 'Supports the education, health and wellbeing of children on the Coffs Coast through grants, programs and community events.'),
('Marine Conservation Coffs Harbour', 'info@marinecoffs.org.au', '(02) 6650 1450',
 'A volunteer group protecting the Solitary Islands coastal ecosystem through clean-ups, research and community education.'),
('Coffs Animal Shelter Alliance', 'contact@coffsanimals.org.au', '(02) 6650 1320',
 'Rescues, rehabilitates and rehomes companion animals across the Coffs Harbour region, funded entirely by donations.');

-- ------------------------------------------------------------
-- Sample data: categories
-- ------------------------------------------------------------
INSERT INTO categories (category_name) VALUES
('Fun Run'),
('Gala Dinner'),
('Auction'),
('Concert'),
('Community Market'),
('Trivia Night');

-- ------------------------------------------------------------
-- Sample data: events (10)
-- 8 upcoming active events, 1 past active event (2026-09-12),
-- 1 suspended event (hidden by the API to demonstrate policy
-- suspension). Dates are relative to the A2 submission week.
-- ------------------------------------------------------------
INSERT INTO events
  (event_name, event_description, event_date, event_time, location,
   ticket_price, goal_amount, funds_raised, event_image, event_status, category_id, org_id)
VALUES
('Coffs Harbour Fun Run 2026',
 'Join 800 runners and walkers for the biggest fun run on the Coffs Coast. Choose a 5 km course along Coffs Creek or a family-friendly 2 km loop. Every registration includes a race pack, and all proceeds fund school breakfast programs across the region.',
 '2026-10-11', '07:00:00', 'Coffs Creek Reserve',
 25.00, 20000.00, 8450.00, 'event-fun-run.jpg', 'active', 1, 1),

('Starlight Gala Night',
 'An evening of fine dining, live jazz and auctions at Opal Cove Resort in support of children''s health services. Black-tie optional. Tickets include a three-course dinner and drinks; tables of ten can be reserved for corporate supporters.',
 '2026-10-24', '18:30:00', 'Opal Cove Resort',
 120.00, 50000.00, 21500.00, 'event-gala-night.jpg', 'active', 2, 1),

('Silent Auction by the Sea',
 'Browse and bid on artworks, weekend getaways and experiences donated by local businesses. Entry is free and all bidders receive a complimentary welcome drink. Proceeds fund marine debris research along the Solitary Islands.',
 '2026-11-07', '17:00:00', 'Coffs Harbour Botanic Garden Pavilion',
 0.00, 15000.00, 5300.00, 'event-auction.jpg', 'active', 3, 2),

('Concert for Kids',
 'A family concert evening featuring local school choirs, the Coffs Coast Concert Band and a special guest headliner. Gates open at 5:30 pm with food stalls and face painting. All proceeds go to the children''s hospital equipment appeal.',
 '2026-11-21', '19:00:00', 'C.ex Coffs International Stadium',
 45.00, 30000.00, 12000.00, 'event-concert.jpg', 'active', 4, 1),

('Beachside Community Market',
 'A Saturday market with over 60 stalls of artisan food, crafts and pre-loved treasures. Stall fees and gold-coin donations support the Coffs Animal Shelter Alliance. Bring the whole family, dogs on leads welcome.',
 '2026-10-04', '08:00:00', 'Park Beach Reserve',
 0.00, 8000.00, 3100.00, 'event-market.jpg', 'active', 5, 3),

('Trivia for Turtles',
 'Round up a team of up to eight for a night of trivia, raffles and prizes at the Coffs Harbour Yacht Club. Themes include ocean trivia, music and local history. Funds support turtle rescue and rehabilitation equipment.',
 '2026-11-14', '18:30:00', 'Coffs Harbour Yacht Club',
 15.00, 6000.00, 1900.00, 'event-trivia.jpg', 'active', 6, 2),

('Paws in the Park Walk',
 'Grab a leash and join the annual 3 km charity dog walk through the Coffs Harbour Botanic Garden. Registration includes a bandana for your pup and a pooch photo booth. Every dollar helps shelter animals find a home.',
 '2026-12-06', '09:00:00', 'Coffs Harbour Botanic Garden',
 10.00, 10000.00, 2400.00, 'event-dog-walk.jpg', 'active', 1, 3),

('New Year''s Eve Charity Ball',
 'See in the new year in style at the Pacific Bay Resort ballroom. The night includes a five-course dinner, champagne toast, live band and a midnight raffle draw. Proceeds provide education grants for local children in need.',
 '2026-12-31', '19:00:00', 'Pacific Bay Resort',
 150.00, 60000.00, 9000.00, 'event-nye-ball.jpg', 'active', 2, 1),

('Spring Art Auction',
 'Our spring auction of works by Mid North Coast artists has now closed. Thank you to everyone who bid — the event raised $13,400 for marine conservation, exceeding its goal.',
 '2026-09-12', '16:00:00', 'Coffs Regional Gallery',
 0.00, 12000.00, 13400.00, 'event-art-auction.jpg', 'active', 3, 2),

('Harbourside Sunset Concert',
 'This event has been suspended by the organisers pending organiser verification and will not be displayed on the website.',
 '2026-10-18', '18:00:00', 'Muttonbird Island Lookout',
 35.00, 18000.00, 0.00, 'event-sunset-concert.jpg', 'suspended', 4, 2);
