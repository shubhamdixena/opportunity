-- Create simplified campaign table
CREATE TABLE IF NOT EXISTS simple_campaign (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of source URLs
  ai_prompt TEXT NOT NULL,
  frequency INTEGER DEFAULT 6,
  frequency_unit TEXT DEFAULT 'hours' CHECK (frequency_unit IN ('hours', 'days')),
  category TEXT DEFAULT 'General',
  is_active BOOLEAN DEFAULT false,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simplified campaign runs table
CREATE TABLE IF NOT EXISTS campaign_runs (
  id TEXT PRIMARY KEY,
  campaign_id UUID REFERENCES simple_campaign(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'stopped', 'failed')),
  sources TEXT[], -- Snapshot of sources when run started
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_sources INTEGER DEFAULT 0,
  processed_sources INTEGER DEFAULT 0,
  items_found INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_runs_status ON campaign_runs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_runs_campaign_id ON campaign_runs(campaign_id);

-- Insert default campaign if none exists
INSERT INTO simple_campaign (name, ai_prompt, category)
SELECT 
  'Content Discovery Campaign',
  'Summarize the following content and extract key information relevant to scholarships, fellowships, grants, and academic opportunities.',
  'General'
WHERE NOT EXISTS (SELECT 1 FROM simple_campaign);
