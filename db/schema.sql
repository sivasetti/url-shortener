CREATE TABLE IF NOT EXISTS urls(
        id BIGSERIAL PRIMARY KEY,
        short_code VARCHAR(10) UNIQUE,
        long_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        click_count BIGINT NOT NULL DEFAULT 0);


CREATE TABLE IF NOT EXISTS clicks(
        id BIGSERIAL PRIMARY KEY,
        short_code VARCHAR(10) NOT NULL,
        clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        referrer TEXT);


CREATE INDEX IF NOT EXISTS idx_clicks_code_time ON clicks(short_code, clicked_at);