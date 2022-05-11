BEGIN;

DROP TABLE IF EXISTS card_has_label, list, card, label;

CREATE TABLE IF NOT EXISTS "list" (
    -- "id" SERIAL PRIMARY KEY,
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "card" (
    -- "id" SERIAL PRIMARY KEY,
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#FFF',
    "position" integer NOT NULL DEFAULT 0,
    "list_id" integer NOT NULL REFERENCES "list"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "label"(
    -- "id" SERIAL PRIMARY KEY,
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#FFF',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "card_has_label" (
  "card_id" integer NOT NULL REFERENCES "card"("id") ON DELETE CASCADE,
  "label_id" integer NOT NULL REFERENCES "label"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "list" ("name", "position") VALUES
    ('TODO', 1),
    ('Doing', 1),
    ('Done', 1);

INSERT INTO "card" ("name", "color", "list_id") VALUES
    ('Carte 1', '#ff1414', 1),
    ('Carte 2', '#ff1414', 1),
    ('Carte 3', '#ff1414', 1);

INSERT INTO "label" ("name", "color") VALUES
    ('Label 1', '#ff1414'),
    ('Label 2', '#ff1414'),
    ('Label 3', '#ff1414');


INSERT INTO "card_has_label" ("card_id", "label_id") VALUES
    (1,1);

COMMIT;