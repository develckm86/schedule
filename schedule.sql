DROP
DATABASE IF EXISTS schedule;

CREATE SCHEMA schedule DEFAULT CHARACTER SET utf8mb4;

-- 개발자 계정 생성
CREATE
USER 'schedule_dev'@'localhost' IDENTIFIED BY 'mysql';
GRANT ALL PRIVILEGES ON schedule.* TO
'developer'@'localhost' WITH GRANT OPTION;

-- 사용자 계정 생성
CREATE
USER 'schedule_user'@'localhost' IDENTIFIED BY 'mysql';
GRANT
SELECT,
INSERT
,
UPDATE,
DELETE
ON schedule.* TO 'schedule_user'@'localhost';

USE
schedule;

-- 사용자 테이블
CREATE TABLE users
(
    user_id    VARCHAR(255) PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    pw_hash    VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 캘린더 테이블
CREATE TABLE calendars
(
    calendar_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id     VARCHAR(255),
    calendar_name VARCHAR(255),
    FOREIGN KEY (author_id) REFERENCES users (user_id) ON DELETE CASCADE,
    UNIQUE (author_id, calendar_name)
);
CREATE TABLE roles
(
    role_name  VARCHAR(50) PRIMARY KEY,                                        -- 역할 이름 (WRITE, READ, INVITED)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                            -- 생성 일자
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 업데이트 일자
);

-- 캘린더 사용자 테이블
CREATE TABLE calendar_users
(
    calendar_id INT UNSIGNED,
    user_id     VARCHAR(255),
    --role        ENUM('WRITE', 'READ', 'INVITED'),
    role_name VARCHAR(50),
        PRIMARY KEY (calendar_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES roles (role_name) ON DELETE CASCADE,
    FOREIGN KEY (calendar_id) REFERENCES calendars (calendar_id) ON DELETE CASCADE
);
-- 이벤트 테이블
CREATE TABLE events
(
    event_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    calendar_id INT          NOT NULL,
    author_id   VARCHAR(255) NOT NULL,
    title       VARCHAR(100) NOT NULL,
    type        ENUM('ALL', 'TIMED', 'MULTI') NOT NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE,
    start_time  TIME,
    end_time    TIME,
    icon        VARCHAR(10),
    color       VARCHAR(20),
    FOREIGN KEY (calendar_id) REFERENCES calendars (calendar_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE event_alarms
(
    alarm_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id   INT UNSIGNED,
    start_date DATE NOT NULL,
    start_time TIME,
    FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE
);
-- 사용자 역할 테이블
-- CREATE TABLE user_roles
-- (
--     role_id   INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(50) NOT NULL UNIQUE
-- );
--
-- -- 사용자 선호도 테이블
-- CREATE TABLE user_preferences
-- (
--     prefer_id    INT AUTO_INCREMENT PRIMARY KEY,
--     user_id          INT          NOT NULL,
--     name  VARCHAR(100) NOT NULL,
--     value VARCHAR(255),
--     FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
-- );

-- 사용자 역할 추가
-- INSERT INTO user_roles (role_name)
-- VALUES ('admin'),
--        ('editor'),
--        ('viewer');
--
-- -- 사용자 선호도 추가
-- INSERT INTO user_preferences (user_id, preference_name, preference_value)
-- VALUES (1, 'theme', 'dark'),
--        (2, 'language', 'en');
