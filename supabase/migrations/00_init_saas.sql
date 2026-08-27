-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext"; -- For case-insensitive emails

-- 1. Profiles (Users) table linking to Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC'::TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Workspaces (Multi-tenant root)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    stripe_customer_id TEXT,
    billing_plan TEXT DEFAULT 'free'::TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Workspace Members (Mapping Users to Workspaces)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member'::TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(workspace_id, user_id)
);

-- 4. Teams (Sub-groups within Workspaces)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Team Members (Mapping Users to Teams)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member'::TEXT NOT NULL CHECK (role IN ('leader', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id)
);

-- 6. Events (Event types, e.g., '30 min discovery call')
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL, -- Optional team association
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    price_amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD'::TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(workspace_id, slug)
);

-- 7. Bookings (Actual appointments)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE RESTRICT NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL, -- Denormalized for faster tenant queries
    host_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    attendee_email CITEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    attendee_timezone TEXT NOT NULL DEFAULT 'UTC'::TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'confirmed'::TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
    meeting_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    canceled_at TIMESTAMPTZ
);

-- ==========================================
-- Indexing for Performance (Optimized for Millions of Records)
-- ==========================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);

-- Workspace Members
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_workspace_id ON teams(workspace_id);

-- Team Members
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_workspace_id ON events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_team_id ON events(team_id);

-- Bookings (Heavy read/write table)
CREATE INDEX IF NOT EXISTS idx_bookings_workspace_id ON bookings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee_email ON bookings(attendee_email);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Composite index for range queries on host availability (Critical for booking systems)
CREATE INDEX IF NOT EXISTS idx_bookings_host_status_time ON bookings(host_id, status, start_time, end_time);

-- ==========================================
-- Functions and Triggers for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Row Level Security (RLS) Setup
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Workspaces viewable by members" ON workspaces FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid())
);
CREATE POLICY "Workspace owners can update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Bookings viewable by host" ON bookings FOR SELECT USING (host_id = auth.uid());
CREATE POLICY "Bookings insertable by public" ON bookings FOR INSERT WITH CHECK (true);
