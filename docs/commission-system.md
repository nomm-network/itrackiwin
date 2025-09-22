# Commission System Documentation

## Overview
The commission system manages ambassador partnerships with gyms, tracks performance, calculates earnings, and provides transparent reporting for all stakeholders.

## System Architecture

### Core Components

#### 1. Ambassador Management
- **ambassador_profiles**: Ambassador user profiles and status
- **battles**: Competition campaigns for gym partnerships
- **battle_participants**: Ambassador participation tracking
- **battle_invitations**: Invitation and response system

#### 2. Partnership Tracking
- **ambassador_gym_deals**: Signed partnership agreements
- **ambassador_gym_visits**: Visit verification with photo proof
- **ambassador_commission_agreements**: Commission rate contracts

#### 3. Financial Processing
- **gym_monthly_revenue**: Revenue data for commission calculation
- **ambassador_commission_accruals**: Calculated commission amounts
- **Commission Views**: Analytics and reporting views

## Data Models

### Ambassador Profile
```typescript
interface AmbassadorProfile {
  id: string;
  user_id: string;
  status: 'eligible' | 'active' | 'suspended';
  bio?: string;
  created_at: string;
}
```

### Battle System
```typescript
interface Battle {
  id: string;
  name: string;
  city_id: string;
  status: 'draft' | 'active' | 'completed';
  starts_at: string;
  ends_at: string;
  target_win_deals: number;
  max_participants: number;
  created_at: string;
}

interface BattleParticipant {
  battle_id: string;
  ambassador_id: string;
  joined_at: string;
}
```

### Gym Partnership
```typescript
interface AmbassadorGymDeal {
  id: string;
  battle_id: string;
  gym_id: string;
  ambassador_id: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  signed_at: string;
  contract_url?: string;
  verified_at?: string;
  verified_by?: string;
}
```

### Commission Agreement
```typescript
interface AmbassadorCommissionAgreement {
  id: string;
  ambassador_id: string;
  gym_id: string;
  battle_id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  percent: number; // Commission percentage
  starts_at: string;
  ends_at?: string;
  created_at: string;
}
```

### Commission Calculation
```typescript
interface AmbassadorCommissionAccrual {
  id: string;
  agreement_id: string;
  year: number;
  month: number;
  gross_revenue: number;
  commission_due: number;
  computed_at: string;
}
```

## Business Logic

### Partnership Workflow

#### 1. Battle Creation
```javascript
// Admin creates battle for specific city
const battle = await supabase
  .from('battles')
  .insert({
    name: 'Berlin Q1 2025 Battle',
    city_id: berlinCityId,
    status: 'active',
    starts_at: '2025-01-01T00:00:00Z',
    ends_at: '2025-03-31T23:59:59Z',
    target_win_deals: 2, // Deals needed to win
    max_participants: 10
  });
```

#### 2. Ambassador Invitation
```javascript
// System sends invitations to eligible ambassadors
const invitation = await supabase
  .from('battle_invitations')
  .insert({
    battle_id: battleId,
    ambassador_id: ambassadorId,
    status: 'pending'
  });
```

#### 3. Ambassador Participation
```javascript
// Ambassador accepts invitation
await supabase
  .from('battle_invitations')
  .update({ 
    status: 'accepted',
    responded_at: new Date().toISOString()
  })
  .eq('id', invitationId);

// Add to participants
await supabase
  .from('battle_participants')
  .insert({
    battle_id: battleId,
    ambassador_id: ambassadorId
  });
```

#### 4. Gym Deal Submission
```javascript
// Ambassador reports signed gym deal
const deal = await supabase
  .from('ambassador_gym_deals')
  .insert({
    battle_id: battleId,
    gym_id: gymId,
    ambassador_id: ambassadorId,
    status: 'pending_verification',
    signed_at: new Date().toISOString(),
    contract_url: contractFileUrl
  });
```

#### 5. Deal Verification
```javascript
// Admin verifies deal and creates commission agreement
await supabase
  .from('ambassador_gym_deals')
  .update({
    status: 'verified',
    verified_at: new Date().toISOString(),
    verified_by: adminUserId
  })
  .eq('id', dealId);

// Create commission agreement
await supabase
  .from('ambassador_commission_agreements')
  .insert({
    ambassador_id: ambassadorId,
    gym_id: gymId,
    battle_id: battleId,
    tier: calculateTier(dealMetrics),
    percent: getTierCommissionRate(tier),
    starts_at: new Date().toISOString()
  });
```

### Commission Calculation

#### Monthly Revenue Processing
```sql
-- Function: run_commission_accruals(year, month)
-- Calculates commissions for all active agreements
CREATE OR REPLACE FUNCTION public.run_commission_accruals(p_year int, p_month int)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  r record; 
  agr record; 
  base_month date := make_date(p_year, p_month, 1);
  gross numeric; 
  due numeric;
BEGIN
  -- For each gym's monthly revenue
  FOR r IN SELECT * FROM public.gym_monthly_revenue 
           WHERE year = p_year AND month = p_month LOOP
    
    -- Find all active agreements for this gym/month
    FOR agr IN
      SELECT *
      FROM public.ambassador_commission_agreements a
      WHERE a.gym_id = r.gym_id
        AND a.starts_at <= (base_month + interval '1 month' - interval '1 day')
        AND (a.ends_at IS NULL OR a.ends_at >= base_month)
    LOOP
      gross := r.gross_revenue;
      due := round(gross * (agr.percent/100.0), 2);

      -- Insert or update commission accrual
      INSERT INTO public.ambassador_commission_accruals(
        agreement_id, year, month, gross_revenue, commission_due
      )
      VALUES (agr.id, p_year, p_month, gross, due)
      ON CONFLICT (agreement_id, year, month) DO UPDATE
      SET gross_revenue = EXCLUDED.gross_revenue,
          commission_due = EXCLUDED.commission_due,
          computed_at = now();
    END LOOP;
  END LOOP;
END$$;
```

#### Commission Tier Structure
```javascript
const commissionTiers = {
  bronze: {
    percentage: 2.5,
    requirements: {
      min_deals: 1,
      min_monthly_visits: 2
    }
  },
  silver: {
    percentage: 3.5,
    requirements: {
      min_deals: 2,
      min_monthly_visits: 4,
      min_revenue_generated: 5000
    }
  },
  gold: {
    percentage: 5.0,
    requirements: {
      min_deals: 3,
      min_monthly_visits: 6,
      min_revenue_generated: 10000
    }
  },
  platinum: {
    percentage: 7.5,
    requirements: {
      min_deals: 5,
      min_monthly_visits: 8,
      min_revenue_generated: 25000
    }
  }
};

function calculateTier(ambassadorMetrics) {
  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  
  for (const tier of tiers) {
    const requirements = commissionTiers[tier].requirements;
    
    if (ambassadorMetrics.deals >= requirements.min_deals &&
        ambassadorMetrics.monthly_visits >= requirements.min_monthly_visits &&
        ambassadorMetrics.revenue_generated >= (requirements.min_revenue_generated || 0)) {
      return tier;
    }
  }
  
  return 'bronze'; // Default tier
}
```

## Analytics & Reporting

### Ambassador Performance Views

#### Individual Statement View
```sql
-- v_ambassador_statements: Detailed commission breakdown
CREATE OR REPLACE VIEW public.v_ambassador_statements AS
SELECT
  a.id as agreement_id,
  a.ambassador_id,
  a.gym_id,
  g.name as gym_name,
  a.battle_id,
  a.tier,
  a.percent,
  acc.year,
  acc.month,
  acc.gross_revenue,
  acc.commission_due,
  a.starts_at,
  a.ends_at,
  (make_date(acc.year, acc.month, 1) BETWEEN 
   date_trunc('month', a.starts_at)::date AND 
   COALESCE(date_trunc('month', a.ends_at)::date, '2099-12-31'::date)) as in_window
FROM public.ambassador_commission_agreements a
JOIN public.ambassador_commission_accruals acc ON acc.agreement_id = a.id
JOIN public.gyms g ON g.id = a.gym_id;
```

#### Monthly Summary View
```sql
-- v_ambassador_statement_month: Monthly totals
CREATE OR REPLACE VIEW public.v_ambassador_statement_month AS
SELECT
  s.ambassador_id,
  s.year,
  s.month,
  SUM(s.commission_due) as commission_total
FROM public.v_ambassador_statements s
GROUP BY s.ambassador_id, s.year, s.month;
```

#### Performance Summary View
```sql
-- v_ambassador_summary: KPI overview
CREATE OR REPLACE VIEW public.v_ambassador_summary AS
SELECT
  ap.id as ambassador_id,
  ap.user_id,
  COUNT(DISTINCT agd.gym_id) FILTER (WHERE agd.status='verified') as verified_deals_total,
  COUNT(*) FILTER (WHERE agv.visited_at >= date_trunc('month', now())) as visits_mtd,
  MAX(agv.visited_at) as last_visit_at
FROM public.ambassador_profiles ap
LEFT JOIN public.ambassador_gym_deals agd ON agd.ambassador_id = ap.id
LEFT JOIN public.ambassador_gym_visits agv ON agv.ambassador_id = ap.id
GROUP BY ap.id, ap.user_id;
```

### Operations Views

#### Commission Summary View
```sql
-- v_ambassador_commission_summary: Current vs previous month
CREATE OR REPLACE VIEW public.v_ambassador_commission_summary AS
WITH cur AS (
  SELECT aca.ambassador_id, SUM(a.commission_due) as commission_mtd
  FROM public.ambassador_commission_accruals a
  JOIN public.ambassador_commission_agreements aca ON aca.id = a.agreement_id
  WHERE date_trunc('month', make_date(a.year, a.month, 1)) = date_trunc('month', now())
  GROUP BY aca.ambassador_id
),
prev AS (
  SELECT aca.ambassador_id, SUM(a.commission_due) as commission_prev
  FROM public.ambassador_commission_accruals a
  JOIN public.ambassador_commission_agreements aca ON aca.id = a.agreement_id
  WHERE date_trunc('month', make_date(a.year, a.month, 1)) = 
        date_trunc('month', now() - interval '1 month')
  GROUP BY aca.ambassador_id
)
SELECT
  COALESCE(cur.ambassador_id, prev.ambassador_id) as ambassador_id,
  COALESCE(cur.commission_mtd, 0) as commission_mtd,
  COALESCE(prev.commission_prev, 0) as commission_last_month
FROM cur
FULL JOIN prev ON prev.ambassador_id = cur.ambassador_id;
```

## Export Functions

### Ambassador CSV Export
```sql
-- Function: export_my_commissions_csv(year, month)
-- Returns: CSV string with ambassador's commission data
CREATE OR REPLACE FUNCTION public.export_my_commissions_csv(p_year int, p_month int)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  uid uuid := auth.uid();
  csv text;
BEGIN
  WITH my_rows AS (
    SELECT gym_name, tier, percent, gross_revenue, commission_due
    FROM public.v_ambassador_statements s
    JOIN public.ambassador_profiles ap ON ap.id = s.ambassador_id
    WHERE ap.user_id = uid AND s.year = p_year AND s.month = p_month
    ORDER BY gym_name
  )
  SELECT string_agg(format('%s,%s,%.2f,%.2f,%.2f',
                           gym_name, tier, percent, gross_revenue, commission_due), E'\n')
    INTO csv
  FROM my_rows;
  
  RETURN COALESCE('Gym,Tier,Percent,Gross,Commission' || E'\n' || csv, 
                  'Gym,Tier,Percent,Gross,Commission');
END$$;
```

### Operations Payout Export
```sql
-- Function: export_payouts_csv(year, month) 
-- Returns: CSV string with all ambassador payouts for operations
CREATE OR REPLACE FUNCTION public.export_payouts_csv(p_year int, p_month int)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  csv text;
BEGIN
  IF NOT public.is_superadmin_simple() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  WITH rows AS (
    SELECT ap.user_id,
           u.email,
           s.ambassador_id,
           SUM(s.commission_due) as total_due
    FROM public.v_ambassador_statements s
    JOIN public.ambassador_profiles ap ON ap.id = s.ambassador_id
    LEFT JOIN auth.users u ON u.id = ap.user_id
    WHERE s.year = p_year AND s.month = p_month
    GROUP BY ap.user_id, u.email, s.ambassador_id
    ORDER BY total_due DESC
  )
  SELECT string_agg(format('%s,%s,%s,%.2f', 
                           user_id, COALESCE(email,''), ambassador_id, total_due), E'\n')
    INTO csv
  FROM rows;

  RETURN COALESCE('UserId,Email,AmbassadorId,TotalDue' || E'\n' || csv, 
                  'UserId,Email,AmbassadorId,TotalDue');
END$$;
```

## Visit Verification System

### Photo Proof Tracking
```typescript
interface AmbassadorGymVisit {
  id: string;
  ambassador_id: string;
  gym_id: string;
  visited_at: string;
  photo_url?: string; // Proof of visit
  notes?: string;
}
```

### Poster Freshness Monitoring
```sql
-- v_gym_poster_freshness: Track last poster verification per gym
CREATE OR REPLACE VIEW public.v_gym_poster_freshness AS
SELECT
  g.id as gym_id,
  MAX(agv.visited_at) FILTER (WHERE agv.photo_url IS NOT NULL) as last_poster_proof_at
FROM public.gyms g
LEFT JOIN public.ambassador_gym_visits agv ON agv.gym_id = g.id
GROUP BY g.id;

-- v_gyms_needing_poster_check: Identify gyms requiring poster updates
CREATE OR REPLACE VIEW public.v_gyms_needing_poster_check AS
SELECT
  g.id as gym_id,
  g.name,
  COALESCE(pf.last_poster_proof_at, '1900-01-01'::timestamptz) as last_poster_proof_at,
  now() - COALESCE(pf.last_poster_proof_at, '1900-01-01') as age
FROM public.gyms g
LEFT JOIN public.v_gym_poster_freshness pf ON pf.gym_id = g.id
WHERE COALESCE(pf.last_poster_proof_at, '1900-01-01') < now() - interval '60 days';
```

## Frontend Integration

### Ambassador Dashboard
```typescript
// Commission statements component
export function AmbassadorStatements() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const { data: statements } = useAmbassadorStatements(selectedYear, selectedMonth);
  const { data: summary } = useAmbassadorStatementSummary();
  
  const handleExportCSV = async () => {
    const csvData = await exportCommissionsCSV(selectedYear, selectedMonth);
    downloadCSV(csvData, `commissions_${selectedYear}_${selectedMonth}.csv`);
  };
  
  return (
    <div>
      <MonthYearPicker onSelect={(year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
      }} />
      
      <CommissionTable data={statements} />
      <ExportButton onClick={handleExportCSV} />
      <HistoricalSummary data={summary} />
    </div>
  );
}
```

### Operations Dashboard
```typescript
// Payout management component
export function PayoutsExport() {
  const { isSuperAdmin } = useUserRole();
  const [selectedPeriod, setSelectedPeriod] = useState({ year: 2025, month: 1 });
  
  const handleExportPayouts = async () => {
    const csvData = await exportPayoutsCSV(selectedPeriod.year, selectedPeriod.month);
    downloadCSV(csvData, `payouts_${selectedPeriod.year}_${selectedPeriod.month}.csv`);
  };
  
  if (!isSuperAdmin) {
    return <AccessDenied />;
  }
  
  return (
    <div>
      <PeriodSelector onSelect={setSelectedPeriod} />
      <PayoutSummary period={selectedPeriod} />
      <ExportButton onClick={handleExportPayouts} />
      <SecurityNotices />
    </div>
  );
}
```

## Security & Compliance

### Row Level Security
```sql
-- Ambassador commission accruals - users see only their own data
CREATE POLICY "accr_sel" ON public.ambassador_commission_accruals
FOR SELECT USING (
  is_superadmin_simple() OR 
  EXISTS (
    SELECT 1 FROM ambassador_commission_agreements a
    WHERE a.id = ambassador_commission_accruals.agreement_id
      AND EXISTS (
        SELECT 1 FROM ambassador_profiles ap
        WHERE ap.id = a.ambassador_id 
          AND ap.user_id = auth.uid()
      )
  )
);

-- Commission agreements - read-only for ambassadors
CREATE POLICY "agr_sel" ON public.ambassador_commission_agreements
FOR SELECT USING (
  is_superadmin_simple() OR 
  EXISTS (
    SELECT 1 FROM ambassador_profiles ap
    WHERE ap.id = ambassador_commission_agreements.ambassador_id 
      AND ap.user_id = auth.uid()
  )
);
```

### Audit Trail
```sql
-- All commission calculations logged
INSERT INTO public.admin_audit_log (
  action_type,
  target_user_id,
  performed_by,
  details
) VALUES (
  'commission_calculated',
  ambassador_user_id,
  system_user_id,
  jsonb_build_object(
    'year', p_year,
    'month', p_month,
    'amount', commission_due,
    'gym_id', gym_id
  )
);
```

### Data Privacy
- **PII Protection**: Email addresses only accessible to superadmins
- **Financial Data**: Commission amounts visible only to earning ambassadors
- **Geographic Limits**: Battle participation restricted by city
- **Time-based Access**: Historical data limited to active agreement periods

## Performance Optimization

### Indexing Strategy
```sql
-- Commission calculation optimization
CREATE INDEX idx_ambassador_commission_accruals_agreement_year_month 
ON ambassador_commission_accruals(agreement_id, year, month);

-- Statement queries optimization  
CREATE INDEX idx_ambassador_profiles_user_id 
ON ambassador_profiles(user_id);

-- Analytics optimization
CREATE INDEX idx_ambassador_gym_visits_gym_photo 
ON ambassador_gym_visits(gym_id, visited_at) 
WHERE photo_url IS NOT NULL;
```

### Caching Strategy
```javascript
// React Query caching for commission data
export function useAmbassadorStatements(year, month) {
  return useQuery({
    queryKey: ['ambassador-statements', year, month],
    queryFn: () => fetchStatements(year, month),
    staleTime: 300000, // 5 minutes
    cacheTime: 1800000, // 30 minutes
  });
}
```

## Testing & Quality Assurance

### Unit Tests
```javascript
describe('Commission Calculation', () => {
  test('should calculate correct commission amount', () => {
    const grossRevenue = 10000;
    const commissionPercent = 5.0;
    const expected = 500.00;
    
    const result = calculateCommission(grossRevenue, commissionPercent);
    expect(result).toBe(expected);
  });
  
  test('should handle multiple agreements for same gym', () => {
    const agreements = [
      { ambassador_id: 'amb1', percent: 3.0 },
      { ambassador_id: 'amb2', percent: 2.5 }
    ];
    const grossRevenue = 10000;
    
    const results = calculateMultipleCommissions(agreements, grossRevenue);
    expect(results).toHaveLength(2);
    expect(results[0].commission_due).toBe(300.00);
    expect(results[1].commission_due).toBe(250.00);
  });
});
```

### Integration Tests
```javascript
describe('Commission Workflow', () => {
  test('should complete full commission cycle', async () => {
    // 1. Create battle and agreements
    const battle = await createBattle();
    const agreement = await createCommissionAgreement(battle.id);
    
    // 2. Add revenue data
    await addMonthlyRevenue(agreement.gym_id, 2025, 1, 10000);
    
    // 3. Run commission calculation
    await runCommissionAccruals(2025, 1);
    
    // 4. Verify commission was calculated
    const accruals = await getCommissionAccruals(agreement.id);
    expect(accruals).toHaveLength(1);
    expect(accruals[0].commission_due).toBeGreaterThan(0);
    
    // 5. Test export functionality
    const csvData = await exportCommissionsCSV(2025, 1);
    expect(csvData).toContain('Gym,Tier,Percent,Gross,Commission');
  });
});
```

---

*Last Updated: 2025-01-06*
*Commission System Version: 1.0*