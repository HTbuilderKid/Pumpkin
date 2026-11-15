-- The database: who is on the crew, and every set of vitals they log.
-- Run at every start (Database.init), so it only ever creates what is missing. It never deletes anything.

CREATE TABLE IF NOT EXISTS astronaut (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL CHECK (length(trim(name)) > 0),
    height_cm   REAL CHECK (height_cm IS NULL OR height_cm > 0),
    launch_date TEXT NOT NULL DEFAULT (date('now'))     -- mission day 0; readings before it are the personal baseline
);

-- One row = one log entry. Only the vitals measured at that moment are filled in; the rest stay NULL.
CREATE TABLE IF NOT EXISTS data (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    astronaut_id     INTEGER NOT NULL,
    recorded_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mission_day      INTEGER NOT NULL,                  -- days since launch; negative = before launch
    source           TEXT    NOT NULL DEFAULT 'manual', -- manual | simulated
    heart_rate       INTEGER CHECK (heart_rate BETWEEN 20 AND 230),
    bp_systolic      INTEGER CHECK (bp_systolic BETWEEN 50 AND 280),
    bp_diastolic     INTEGER CHECK (bp_diastolic BETWEEN 20 AND 180),
    blood_oxygen     REAL    CHECK (blood_oxygen > 0 AND blood_oxygen <= 100),
    blood_glucose    REAL    CHECK (blood_glucose BETWEEN 10 AND 700),
    body_temp        REAL    CHECK (body_temp BETWEEN 30 AND 45),
    sleep_hours      REAL    CHECK (sleep_hours BETWEEN 0 AND 24),
    urine_color      INTEGER CHECK (urine_color BETWEEN 1 AND 8),   -- the eight-step colour chart: 1 clear ... 8 brown
    exercise_minutes REAL    CHECK (exercise_minutes BETWEEN 0 AND 600),
    strength         REAL    CHECK (strength >= 0),
    body_mass        REAL    CHECK (body_mass > 0),
    mood             INTEGER CHECK (mood BETWEEN 1 AND 5),
    FOREIGN KEY (astronaut_id) REFERENCES astronaut(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_data_astronaut_day ON data(astronaut_id, mission_day, id);
