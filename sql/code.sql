--
-- Setup
--

/*
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  medium character varying NOT NULL,
  identifier character varying NOT NULL,
  status integer NOT NULL,
  body text NOT NULL,
  created_at timestamp without time zone NOT NULL
);

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Alice', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 1, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Alice', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Alice', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Alice', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Alice', 1, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Alice', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Alice', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('email', 'Bob', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Bob', 1, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('SMS', 'Bob', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Bob', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('pigeon', 'Bob', 0, 'Hello', NOW());

INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Bob', 2, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Bob', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Bob', 0, 'Hello', NOW());
INSERT INTO messages (medium, identifier, status, body, created_at)
  VALUES ('push', 'Bob', 0, 'Hello', NOW());
*/

--
-- PostgreSQL-specific solution
--

WITH in_flight_message_recipients AS (
  SELECT identifier, medium
    FROM messages
    WHERE status = 1
    GROUP BY identifier, medium
    ORDER BY identifier, medium
), in_flight_messages_and_peers AS (
  SELECT m.id, m.identifier, m.medium, m.status
    FROM messages AS m
    INNER JOIN in_flight_message_recipients AS ifmr
    ON m.medium = ifmr.medium
      AND m.identifier = ifmr.identifier
    ORDER BY m.identifier, m.medium, m.status DESC
)
--  SELECT * FROM in_flight_message_recipients
--  SELECT * FROM in_flight_messages_and_peers

-- NOTE: `DISTINCT ON` is Postgres-specific syntax.
  SELECT DISTINCT ON (m.identifier, m.medium)
    m.id, m.identifier, m.medium, m.created_at
    FROM messages AS m
    LEFT JOIN in_flight_messages_and_peers AS ifmap
    ON m.id = ifmap.id
    WHERE ifmap.id IS NULL
      AND m.status = 0
    ORDER BY m.identifier, m.medium, m.created_at ASC
;

--
-- Database-agnostic solution
--

WITH in_flight_message_recipients AS (
  SELECT identifier, medium
    FROM messages
    WHERE status = 1
    GROUP BY identifier, medium
    ORDER BY identifier, medium
), in_flight_messages_and_peers AS (
  SELECT m.id, m.identifier, m.medium, m.status
    FROM messages AS m
    INNER JOIN in_flight_message_recipients AS ifmr
    ON m.medium = ifmr.medium
      AND m.identifier = ifmr.identifier
    ORDER BY m.identifier, m.medium, m.status DESC
), earliest_sendable_messages AS (
  SELECT m.identifier, m.medium, MIN(m.created_at) AS created_at
    FROM messages AS m
    LEFT JOIN in_flight_messages_and_peers AS ifmap
    ON m.id = ifmap.id
    WHERE ifmap.id IS NULL
      AND m.status = 0
    GROUP BY m.identifier, m.medium
)
--  SELECT * FROM in_flight_message_recipients
--  SELECT * FROM in_flight_messages_and_peers
--  SELECT * FROM earliest_sendable_messages
  SELECT MIN(m.id) AS id, m.identifier, m.medium, m.created_at
    FROM messages AS m
    INNER JOIN earliest_sendable_messages AS esm
    ON m.identifier = esm.identifier
      AND m.medium = esm.medium
      AND m.created_at = esm.created_at
    WHERE m.status = 0
    GROUP BY m.identifier, m.medium, m.created_at
    ORDER BY m.identifier, m.medium
;
