-- India vehicle registration statistics (PostgreSQL)
-- Data coverage requested: 1995 through September 2026.
-- This schema intentionally contains no invented statistics. Import official
-- figures from VAHAN/MoRTH with their period, metric, coverage and source.

CREATE TABLE IF NOT EXISTS india_vehicle_registration (
    record_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    geography_level    TEXT NOT NULL CHECK (geography_level IN ('India', 'State/UT')),
    state_ut           TEXT,
    period_start       DATE NOT NULL,
    period_end         DATE NOT NULL,
    period_label       TEXT NOT NULL, -- e.g. 1995, 1995-1996, 2026-09
    measure            TEXT NOT NULL CHECK (measure IN (
                           'new_registrations',
                           'cumulative_registered_vehicles',
                           'active_registered_vehicles'
                       )),
    vehicle_count      BIGINT NOT NULL CHECK (vehicle_count >= 0),
    vehicle_scope      TEXT NOT NULL DEFAULT 'All vehicle classes',
    coverage_note      TEXT NOT NULL, -- e.g. reporting RTOs or full state coverage
    source_name        TEXT NOT NULL,
    source_url         TEXT NOT NULL,
    retrieved_on       DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (geography_level, state_ut, period_start, period_end, measure, vehicle_scope),
    CHECK (
        (geography_level = 'India' AND state_ut IS NULL)
        OR (geography_level = 'State/UT' AND state_ut IS NOT NULL)
    ),
    CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_reg_period
    ON india_vehicle_registration (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_vehicle_reg_geography
    ON india_vehicle_registration (geography_level, state_ut);

-- Optional import landing table. Load a CSV here first, then insert validated
-- rows into india_vehicle_registration. Counts must be numeric, without commas.
CREATE TABLE IF NOT EXISTS vehicle_registration_import (
    geography_level   TEXT,
    state_ut          TEXT,
    period_start      DATE,
    period_end        DATE,
    period_label      TEXT,
    measure           TEXT,
    vehicle_count     BIGINT,
    vehicle_scope     TEXT,
    coverage_note     TEXT,
    source_name       TEXT,
    source_url        TEXT
);

-- After loading vehicle_registration_import, validate before inserting:
-- SELECT * FROM vehicle_registration_import
-- WHERE geography_level IS NULL OR period_start IS NULL OR period_end IS NULL
--    OR measure IS NULL OR vehicle_count IS NULL OR source_url IS NULL;
--
-- INSERT INTO india_vehicle_registration (
--   geography_level, state_ut, period_start, period_end, period_label,
--   measure, vehicle_count, vehicle_scope, coverage_note, source_name, source_url
-- )
-- SELECT geography_level, NULLIF(state_ut, ''), period_start, period_end,
--        period_label, measure, vehicle_count, vehicle_scope, coverage_note,
--        source_name, source_url
-- FROM vehicle_registration_import
-- ON CONFLICT (geography_level, state_ut, period_start, period_end, measure, vehicle_scope)
-- DO UPDATE SET vehicle_count = EXCLUDED.vehicle_count,
--               coverage_note = EXCLUDED.coverage_note,
--               source_name = EXCLUDED.source_name,
--               source_url = EXCLUDED.source_url,
--               retrieved_on = CURRENT_DATE;

-- Example queries:
-- National yearly/new registration figures:
-- SELECT period_label, vehicle_count FROM india_vehicle_registration
-- WHERE geography_level = 'India' AND measure = 'new_registrations'
-- ORDER BY period_start;
--
-- State/UT comparisons for one period:
-- SELECT state_ut, vehicle_count FROM india_vehicle_registration
-- WHERE geography_level = 'State/UT' AND period_label = '2025-2026'
--   AND measure = 'new_registrations'
-- ORDER BY vehicle_count DESC;
