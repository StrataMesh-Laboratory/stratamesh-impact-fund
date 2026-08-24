-- StrataMesh Impact Fund — schema sketch (PostgreSQL / D1-compatible subset)

CREATE TABLE IF NOT EXISTS repositories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER NOT NULL UNIQUE,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  default_branch TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contributors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_user_id INTEGER NOT NULL UNIQUE,
  github_login TEXT NOT NULL,
  avatar_url TEXT,
  profile_url TEXT,
  claimed INTEGER NOT NULL DEFAULT 0,
  contact_email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contributor_id INTEGER NOT NULL,
  repository_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- commit | pull_request | review | issue | release
  github_id TEXT,
  number INTEGER,
  state TEXT,
  title TEXT,
  url TEXT,
  created_at TEXT,
  closed_at TEXT,
  merged_at TEXT,
  FOREIGN KEY (contributor_id) REFERENCES contributors(id),
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);

CREATE TABLE IF NOT EXISTS contribution_metrics (
  contribution_id INTEGER PRIMARY KEY,
  additions INTEGER,
  deletions INTEGER,
  changed_files INTEGER,
  comments INTEGER,
  review_count INTEGER,
  ci_status TEXT,
  FOREIGN KEY (contribution_id) REFERENCES contributions(id)
);

CREATE TABLE IF NOT EXISTS epochs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE, -- e.g. 2026-09
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | frozen | allocated | paid
  methodology_version TEXT,
  frozen_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS contributor_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contributor_id INTEGER NOT NULL,
  epoch_id INTEGER NOT NULL,
  commits INTEGER DEFAULT 0,
  prs_opened INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  issues_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  repositories INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  merge_rate REAL,
  UNIQUE (contributor_id, epoch_id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id),
  FOREIGN KEY (epoch_id) REFERENCES epochs(id)
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  epoch_id INTEGER,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  provider TEXT,
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'recorded',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (epoch_id) REFERENCES epochs(id)
);

CREATE TABLE IF NOT EXISTS allocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  epoch_id INTEGER NOT NULL,
  contributor_id INTEGER NOT NULL,
  share REAL NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'proposed', -- proposed | approved | paid | failed
  FOREIGN KEY (epoch_id) REFERENCES epochs(id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE TABLE IF NOT EXISTS payout_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contributor_id INTEGER NOT NULL UNIQUE,
  payout_provider TEXT NOT NULL,
  payout_recipient_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE TABLE IF NOT EXISTS github_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  delivery_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  action TEXT,
  payload_hash TEXT,
  processed INTEGER NOT NULL DEFAULT 0,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
