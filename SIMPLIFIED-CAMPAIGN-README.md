# Simplified Campaign System

## Overview

The new simplified campaign system replaces the complex multi-campaign approach with a single, unified campaign that can handle multiple content sources. This makes the system much more intuitive and functional.

## Key Changes

### 1. Single Campaign Model
- **Before**: Multiple campaigns with complex relationships
- **After**: One campaign with multiple sources

### 2. Direct Source Management
- **Before**: Separate source management with complex linking
- **After**: Add/remove sources directly in the campaign interface

### 3. Simplified Database Schema
- **Before**: Multiple tables with complex JSON fields
- **After**: Simple `simple_campaign` table with array of source URLs

### 4. Streamlined API
- **Before**: Multiple endpoints for campaigns, sources, runs
- **After**: Two simple endpoints: `/api/campaign` and `/api/campaign/run`

## File Structure

\`\`\`
/app/api/campaign/
  ├── route.ts              # Main campaign CRUD operations
  └── run/
      └── route.ts          # Start/stop campaign execution

/app/admin/campaign/
  └── page.tsx              # New simplified campaign page

/components/
  └── simple-campaign-manager.tsx  # Main campaign management UI

setup-simple-campaign.sql   # Database migration script
\`\`\`

## Database Schema

### simple_campaign table
- `id` - UUID primary key
- `name` - Campaign name
- `sources` - Array of source URLs
- `ai_prompt` - AI processing instructions
- `frequency` - How often to run (number)
- `frequency_unit` - 'hours' or 'days'
- `category` - Content category
- `is_active` - Whether campaign is enabled
- `last_run` - Last execution timestamp

### campaign_runs table
- `id` - Text primary key
- `campaign_id` - Reference to simple_campaign
- `status` - 'running', 'completed', 'stopped', 'failed'
- `sources` - Snapshot of sources when run started
- `started_at` - When run began
- `total_sources` - Number of sources to process
- `processed_sources` - Number completed
- `items_found` - Items discovered
- `items_created` - Items successfully created

## Usage

1. **Setup Database**: Run the `setup-simple-campaign.sql` script
2. **Access Interface**: Go to `/admin/campaign`
3. **Configure Campaign**: Set name, AI prompt, frequency, category
4. **Add Sources**: Add multiple website URLs to discover content from
5. **Activate & Run**: Enable the campaign and start execution

## Benefits

- **Simplified UX**: One interface for all campaign management
- **Better Performance**: Fewer database queries and simpler relationships
- **Easier Maintenance**: Less complex code and clearer data flow
- **More Intuitive**: Matches user mental model of "one campaign, multiple sources"

## Migration from Old System

The old complex campaign system can remain in place while this new system is tested. Once validated, the old system can be deprecated and removed.
