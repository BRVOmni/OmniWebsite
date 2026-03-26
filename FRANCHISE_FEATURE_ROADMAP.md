# 🤝 Franchise Feature Roadmap

**Grupo Omniprise - Franchise Lead Management System**

---

## 📋 OVERVIEW

**Objective:** Build a comprehensive franchise lead capture and management system that:
1. Is simple and easy for potential franchisees (<5 minutes to complete)
2. Captures rich information for targeted proposal generation
3. Integrates seamlessly with existing dashboard
4. Achieves 90%+ success rate in franchise transactions

**Target Audience:**
- **Franchise Applicants:** Restaurant owners, food entrepreneurs, investors
- **Internal Team:** Sales, Operations, Management

---

## 🎯 BUSINESS GOALS

### Primary Metrics
- **Lead Capture Rate:** 50+ qualified leads/month
- **Conversion Rate:** 25%+ (12+ franchise deals/month)
- **Time to Close:** <60 days from lead to signed deal
- **Deal Success Rate:** 90%+ (from proposal to close)

### Secondary Metrics
- Form Completion Rate: >70%
- Qualified Lead Rate: >40%
- Lead Response Time: <24 hours
- Proposal Acceptance Rate: >80%

---

## 🗄️ DATABASE SCHEMA

### franchise_leads Table
```sql
CREATE TABLE franchise_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ===== PERSONAL INFORMATION =====
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Paraguay',
  age_range VARCHAR(50),              -- 25-35, 35-45, 45-55, 55+

  -- ===== CURRENT BRAND INFORMATION =====
  current_brand_name VARCHAR(255),
  years_in_business INTEGER,
  current_locations_count INTEGER,
  brand_segment VARCHAR(100),            -- quick_service, casual_dining, fast_casual, fine_dining
  cuisine_type VARCHAR(100),             -- pizza, pasta, burgers, mexican, asian, etc.
  current_annual_revenue DECIMAL(15,2),
  current_annual_revenue_currency VARCHAR(10) DEFAULT 'PYG',

  -- ===== OPERATIONAL DETAILS =====
  current_pos_system VARCHAR(100),      -- POS, cash_only, etc.
  has_delivery BOOLEAN DEFAULT false,
  delivery_platforms TEXT[],            -- pedidosya, monchis, uber_eats, own
  has_online_orders BOOLEAN DEFAULT false,
  staff_count INTEGER,

  -- ===== TECHNICAL SOPHISTICATION =====
  tech_sophistication INTEGER CHECK (tech_sophistication BETWEEN 1 AND 5),
  tech_details TEXT,                      -- Free text about current systems

  -- ===== EXPECTATIONS & INVESTMENT =====
  investment_range VARCHAR(100),         -- 50k-100k, 100k-250k, 250k-500k, 500k+
  target_locations INTEGER,
  target_cities TEXT[],                   -- Array of desired cities
  timeframe_to_start VARCHAR(100),       -- immediately, 3-6_months, 6-12_months, next_year
  motivation TEXT,                        -- Why do they want to franchise?
  goals TEXT,                            -- What are their business goals?
  concerns TEXT,                          -- What concerns do they have?

  -- ===== COMPANY READINESS =====
  has_business_plan BOOLEAN,
  has_financial_statements BOOLEAN,
  has_location_identified BOOLEAN,
  available_hours_per_week INTEGER,

  -- ===== OMNIPRISE FIT ASSESSMENT =====
  brand_alignment_score INTEGER CHECK (brand_alignment_score BETWEEN 0 AND 100),
  operational_readiness_score INTEGER CHECK (operational_readiness_score BETWEEN 0 AND 100),
  financial_capability_score INTEGER CHECK (financial_capability_score BETWEEN 0 AND 100),
  growth_potential_score INTEGER CHECK (growth_potential_score BETWEEN 0 AND 100),
  overall_fit_score INTEGER CHECK (overall_fit_score BETWEEN 0 AND 100),
  lead_qualification TEXT,                -- Detailed assessment

  -- ===== INTERNAL TRACKING =====
  lead_status VARCHAR(50) DEFAULT 'new',  -- new, qualified, proposal_sent, negotiating, won, lost, disqualified
  priority_level VARCHAR(20),             -- high, medium, low
  assigned_to UUID REFERENCES users(id),
  qualification_notes TEXT,

  -- ===== FOLLOW-UP TRACKING =====
  follow_up_actions TEXT[],
  next_action VARCHAR(100),
  next_action_date DATE,
  last_contact_date DATE,
  contact_history JSONB,

  -- ===== PROPOSAL TRACKING =====
  proposal_sent_date DATE,
  proposal_version INTEGER DEFAULT 0,
  proposal_status VARCHAR(50),            -- pending, reviewing, accepted, rejected, expired
  proposal_feedback TEXT,

  -- ===== OUTCOME TRACKING =====
  deal_status VARCHAR(50),                -- in_progress, won, lost, on_hold
  deal_value DECIMAL(15,2),
  deal_value_currency VARCHAR(10) DEFAULT 'PYG',
  deal_closing_date DATE,
  deal_location_count INTEGER,
  deal_term_years INTEGER,
  lost_reason VARCHAR(255),

  -- ===== METADATA =====
  lead_source VARCHAR(100),               -- website, referral, linkedin, instagram, other
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer_url TEXT,
  ip_address VARCHAR(45),
  device_info JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_franchise_leads_status ON franchise_leads(lead_status);
CREATE INDEX idx_franchise_leads_created ON franchise_leads(created_at DESC);
CREATE INDEX idx_franchise_leads_priority ON franchise_leads(priority_level, created_at DESC);
CREATE INDEX idx_franchise_leads_email ON franchise_leads(email);
CREATE INDEX idx_franchise_leads_fit_score ON franchise_leads(overall_fit_score DESC);

-- RLS Policies
ALTER TABLE franchise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage franchise_leads"
ON franchise_leads FOR ALL
TO authenticated_users
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Service role can insert leads"
ON franchise_leads FOR INSERT
TO authenticated_users
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
```

---

## 🧠 LEAD SCORING ALGORITHM

### Scoring Categories (Total 100 points)

#### 1. Personal Information (20 points)
```typescript
interface PersonalInfoScore {
  experienceWeight: number;    // 10 pts - Years in business
  locationFitWeight: number;   // 10 pts - Geographic fit
}

const calculatePersonalInfoScore = (data: FranchiseLead): number => {
  let score = 0;

  // Years in business (10 pts)
  if (data.years_in_business >= 5) score += 10;
  else if (data.years_in_business >= 3) score += 7;
  else if (data.years_in_business >= 1) score += 4;

  // Location fit (10 pts)
  if (isInTargetCity(data.city)) score += 10;
  else if (isInTargetRegion(data.country)) score += 5;

  return score;
};
```

#### 2. Brand Strength (25 points)
```typescript
interface BrandStrengthScore {
  revenueWeight: number;       // 10 pts - Annual revenue
  locationsWeight: number;     // 8 pts - Number of locations
  segmentFitWeight: number;    // 7 pts - Segment alignment
}

const calculateBrandStrengthScore = (data: FranchiseLead): number => {
  let score = 0;

  // Revenue (10 pts)
  const annualRevenue = data.current_annual_revenue || 0;
  if (annualRevenue >= 1000000000) score += 10;  // >₲1B
  else if (annualRevenue >= 500000000) score += 7;   // >₲500M
  else if (annualRevenue >= 100000000) score += 4;   // >₲100M

  // Locations (8 pts)
  if (data.current_locations_count >= 5) score += 8;
  else if (data.current_locations_count >= 2) score += 5;
  else if (data.current_locations_count >= 1) score += 3;

  // Segment fit (7 pts)
  const preferredSegments = ['quick_service', 'fast_casual', 'casual_dining'];
  if (preferredSegments.includes(data.brand_segment)) score += 7;
  else if (data.brand_segment === 'fine_dining') score += 3;

  return score;
};
```

#### 3. Investment Alignment (20 points)
```typescript
interface InvestmentAlignmentScore {
  investmentMatchWeight: number; // 10 pts - Investment range
  timelineWeight: number;       // 6 pts - Time to start
  locationCountWeight: number;  // 4 pts - Target locations
}

const calculateInvestmentAlignmentScore = (data: FranchiseLead): number => {
  let score = 0;

  // Investment range (10 pts)
  if (data.investment_range === '500k+') score += 10;
  else if (data.investment_range === '250k-500k') score += 8;
  else if (data.investment_range === '100k-250k') score += 5;
  else if (data.investment_range === '50k-100k') score += 3;

  // Timeline (6 pts)
  if (data.timeframe_to_start === 'immediately') score += 6;
  else if (data.timeframe_to_start === '3-6_months') score += 4;
  else if (data.timeframe_to_start === '6-12_months') score += 2;

  // Target locations (4 pts)
  if (data.target_locations >= 3) score += 4;
  else if (data.target_locations >= 1) score += 2;

  return score;
};
```

#### 4. Operational Readiness (25 points)
```typescript
interface OperationalReadinessScore {
  posSystemWeight: number;      // 8 pts - POS system
  deliveryWeight: number;        // 6 pts - Delivery capability
  techScoreWeight: number;      // 6 pts - Tech sophistication
  staffWeight: number;         // 5 pts - Staff availability
}

const calculateOperationalReadinessScore = (data: FranchiseLead): number => {
  let score = 0;

  // POS system (8 pts)
  if (data.current_pos_system !== 'cash_only') score += 8;
  else score += 2;

  // Delivery capability (6 pts)
  if (data.has_delivery && data.delivery_platforms?.length > 0) score += 6;
  else if (data.has_delivery) score += 3;

  // Tech sophistication (6 pts)
  score += (data.tech_sophistication || 0) * 1.2; // 1-5 → 1.2-6

  // Staff availability (5 pts)
  if (data.available_hours_per_week >= 40) score += 5;
  else if (data.available_hours_per_week >= 20) score += 3;

  return score;
};
```

#### 5. Motivation & Goals (10 points)
```typescript
interface MotivationScore {
  clarityWeight: number;        // 5 pts - Clear motivation
  alignmentWeight: number;      // 5 pts - Goals alignment

const calculateMotivationScore = (data: FranchiseLead): number => {
  let score = 0;

  // Motivation clarity (5 pts)
  if (data.motivation?.length > 100) score += 5;
  else if (data.motivation?.length > 50) score += 3;
  else if (data.motivation?.length > 20) score += 1;

  // Goals alignment (5 pts)
  const growthKeywords = ['escalar', 'expandir', 'crecer', 'aumentar', 'más'];
  const hasGrowthGoal = growthKeywords.some(kw =>
    data.goals?.toLowerCase().includes(kw)
  );
  if (hasGrowthGoal) score += 5;
  else if (data.goals?.length > 50) score += 3;
  else if (data.goals?.length > 20) score += 1;

  return score;
};
```

### Overall Score Calculation
```typescript
interface LeadScore {
  personalInfo: number;         // 0-20
  brandStrength: number;         // 0-25
  investmentAlignment: number;    // 0-20
  operationalReadiness: number;  // 0-25
  motivation: number;            // 0-10

  total: number;                // 0-100
  tier: string;                // champion, high, medium, low
}

const calculateOverallScore = (data: FranchiseLead): LeadScore => {
  const personalInfo = calculatePersonalInfoScore(data);
  const brandStrength = calculateBrandStrengthScore(data);
  const investmentAlignment = calculateInvestmentAlignmentScore(data);
  const operationalReadiness = calculateOperationalReadinessScore(data);
  const motivation = calculateMotivationScore(data);

  const total = personalInfo + brandStrength + investmentAlignment +
                operationalReadiness + motivation;

  let tier: string;
  if (total >= 80) tier = 'champion';
  else if (total >= 65) tier = 'high';
  else if (total >= 50) tier = 'medium';
  else tier = 'low';

  return {
    personalInfo,
    brandStrength,
    investmentAlignment,
    operationalReadiness,
    motivation,
    total,
    tier
  };
};
```

---

## 📱 FRANCHISE APPLICATION FORM

### Multi-Step Wizard Design

```
┌─────────────────────────────────────────────────────────────┐
│  Step Indicator:  ● ● ● ○ ○                              │
│                  1  2  3  4                                │
└─────────────────────────────────────────────────────────────┘
```

#### Step 1: Personal Information
```tsx
<Step1_PersonalInfo>
  <FormSection title="Información Personal">
    <TextField
      label="Nombre completo"
      name="full_name"
      required
      validation={z.string().min(3)}
    />

    <TextField
      label="Email"
      name="email"
      type="email"
      required
      validation={z.string().email()}
    />

    <TextField
      label="Teléfono"
      name="phone"
      type="tel"
      required
      validation={z.string().min(10)}
    />

    <TextField
      label="Ciudad"
      name="city"
      required
      validation={z.string().min(2)}
      suggestions={cities}
    />

    <SelectField
      label="Rango de edad"
      name="age_range"
      options={[
        { value: '25-35', label: '25-35 años' },
        { value: '35-45', label: '35-45 años' },
        { value: '45-55', label: '45-55 años' },
        { value: '55+', label: 'Más de 55 años' },
      ]}
    />
  </FormSection>
</Step1_PersonalInfo>
```

#### Step 2: Brand Information
```tsx
<Step2_BrandInfo>
  <FormSection title="Tu Marca Actual">
    <TextField
      label="Nombre de tu marca"
      name="current_brand_name"
      required
    />

    <NumberField
      label="Años en el negocio"
      name="years_in_business"
      required
      min={0}
    />

    <NumberField
      label="Número de locales actuales"
      name="current_locations_count"
      required
      min={1}
    />

    <SelectField
      label="Segmento de tu marca"
      name="brand_segment"
      required
      options={[
        { value: 'quick_service', label: 'Quick Service' },
        { value: 'fast_casual', label: 'Fast Casual' },
        { value: 'casual_dining', label: 'Casual Dining' },
        { value: 'fine_dining', label: 'Fine Dining' },
      ]}
    />

    <SelectField
      label="Tipo de cocina"
      name="cuisine_type"
      required
      options={[
        { value: 'pizza', label: 'Pizza' },
        { value: 'pasta', label: 'Pasta' },
        { value: 'burgers', label: 'Hamburguesas' },
        { value: 'mexican', label: 'Mexicana' },
        { value: 'asian', label: 'Asiática' },
        { value: 'other', label: 'Otro' },
      ]}
    />

    <CurrencyField
      label="Facturación anual aproximada"
      name="current_annual_revenue"
      currency="PYG"
      required
    />
  </FormSection>
</Step2_BrandInfo>
```

#### Step 3: Operational Details
```tsx
<Step3_Operational>
  <FormSection title="Detalles Operativos">
    <SelectField
      label="Sistema POS actual"
      name="current_pos_system"
      options={[
        { value: 'pos', label: 'Sistema POS' },
        { value: 'cash_only', label: 'Solo efectivo' },
        { value: 'mobile_pos', label: 'POS móvil' },
        { value: 'none', label: 'Ninguno' },
      ]}
    />

    <CheckboxGroup
      label="Plataformas de delivery"
      name="delivery_platforms"
      options={[
        { value: 'pedidosya', label: 'PedidosYa' },
        { value: 'monchis', label: 'Monchis' },
        { value: 'uber_eats', label: 'Uber Eats' },
        { value: 'own', label: 'Propio' },
        { value: 'none', label: 'No tiene' },
      ]}
    />

    <RangeSlider
      label="Nivel tecnológico (1-5)"
      name="tech_sophistication"
      min={1}
      max={5}
      marks={[
        { value: 1, label: 'Bajo' },
        { value: 3, label: 'Medio' },
        { value: 5, label: 'Alto' },
      ]}
    />

    <TextField
      label="Detalles tecnológicos adicionales"
      name="tech_details"
      multiline
      placeholder="Describe tus sistemas actuales..."
    />

    <NumberField
      label="Número de colaboradores"
      name="staff_count"
      required
    />
  </FormSection>
</Step3_Operational>
```

#### Step 4: Expectations & Investment
```tsx
<Step4_Expectations>
  <FormSection title="Expectativas e Inversión">
    <SelectField
      label="Rango de inversión disponible"
      name="investment_range"
      required
      options={[
        { value: '50k-100k', label: '₲50M - ₲100M' },
        { value: '100k-250k', label: '₲100M - ₲250M' },
        { value: '250k-500k', label: '₲250M - ₲500M' },
        { value: '500k+', label: 'Más de ₲500M' },
      ]}
    />

    <NumberField
      label="Número de locales deseados"
      name="target_locations"
      required
      min={1}
    />

    <TextField
      label="Ciudades objetivo"
      name="target_cities"
      placeholder="Ej: Asunción, Luque, San Lorenzo"
      suggestions={cities}
    />

    <SelectField
      label="¿Cuándo te gustaría empezar?"
      name="timeframe_to_start"
      required
      options={[
        { value: 'immediately', label: 'Inmediatamente' },
        { value: '3-6_months', label: 'En 3-6 meses' },
        { value: '6-12_months', label: 'En 6-12 meses' },
        { value: 'next_year', label: 'El próximo año' },
      ]}
    />

    <TextField
      label="¿Por qué quieres ser socio de Omniprise?"
      name="motivation"
      multiline
      required
      placeholder="Cuéntanos tus motivaciones..."
    />

    <TextField
      label="¿Cuáles son tus objetivos de negocio?"
      name="goals"
      multiline
      placeholder="¿Qué esperas lograr?..."
    />

    <TextField
      label="¿Tienes alguna preocupación o duda?"
      name="concerns"
      multiline
      placeholder="Estamos aquí para ayudarte..."
    />
  </FormSection>
</Step4_Expectations>
```

---

## 📊 DASHBOARD INTEGRATION

### New Module: Franchise Management

#### Module Structure
```
Dashboard → Franchise Module
├── Pipeline View
│   ├── Funnel Chart
│   ├── Leads by Status (drag & drop)
│   ├── Lead Cards with scores
│   └── Quick Actions
│
├── Lead Detail View
│   ├── Full Information Display
│   ├── Score Breakdown
│   ├── Timeline/Notes
│   ├── Contact History
│   └── Action Buttons
│
├── Analytics Dashboard
│   ├── Conversion Funnel
│   ├── Lead Sources Chart
│   ├── Time to Close Chart
│   ├── Top Scoring Criteria
│   └── Win/Loss Analysis
│
└── Proposal Generator
    ├── Auto-populated Data
    ├── Customizable Sections
    ├── Preview Mode
    └── Export to PDF
```

#### Pipeline View Design
```tsx
<FranchisePipeline>
  <PipelineHeader>
    <Title>Gestión de Franquicias</Title>
    <Stats>
      <Stat label="Total Leads">47</Stat>
      <Stat label="Qualified">18</Stat>
      <Stat label="In Negotiation">5</Stat>
      <Stat label="Won This Month">3</Stat>
    </Stats>
  </PipelineHeader>

  <PipelineStages>
    <PipelineStage title="Nuevos (12)" status="new">
      <LeadCard
        name="Juan Pérez"
        email="juan@email.com"
        score={78}
        tier="high"
        date="2 days ago"
        actions={['call', 'email', 'qualify']}
      />
      {/* More cards */}
    </PipelineStage>

    <PipelineStage title="Calificados (8)" status="qualified">
      {/* Qualified leads */}
    </PipelineStage>

    <PipelineStage title="Propuesta Enviada (6)" status="proposal_sent">
      {/* Leads with proposal */}
    </PipelineStage>

    <PipelineStage title="Negociando (4)" status="negotiating">
      {/* Active negotiations */}
    </PipelineStage>

    <PipelineStage title="Ganados (3)" status="won">
      {/* Won deals */}
    </PipelineStage>
  </PipelineStages>
</FranchisePipeline>
```

#### Lead Detail View
```tsx
<LeadDetail leadId="uuid">
  <LeadHeader>
    <LeadName>Juan Pérez</LeadName>
    <LeadEmail>juan@email.com</LeadEmail>
    <LeadScoreBadge score={78} tier="high" />
    <LeadStatusBadge status="qualified" />
  </LeadHeader>

  <ScoreBreakdown>
    <ScoreBar label="Experiencia" value={15} max={20} />
    <ScoreBar label="Marca" value={20} max={25} />
    <ScoreBar label="Inversión" value={16} max={20} />
    <ScoreBar label="Operativo" value={18} max={25} />
    <ScoreBar label="Motivación" value={9} max={10} />
  </ScoreBreakdown>

  <Tabs>
    <Tab label="Información">
      <PersonalInfoSection />
      <BrandInfoSection />
      <OperationalInfoSection />
      <ExpectationsSection />
    </Tab>

    <Tab label="Scores">
      <DetailedScores />
      <QualificationNotes />
      <FitAnalysis />
    </Tab>

    <Tab label="Timeline">
      <TimelineEvents />
      <AddNoteForm />
    </Tab>

    <Tab label="Propuesta">
      <ProposalGenerator leadData={lead} />
    </Tab>
  </Tabs>
</LeadDetail>
```

---

## 📄 PROPOSAL GENERATOR

### Auto-Populated Proposal Template

```typescript
interface FranchiseProposal {
  // ===== COVER LETTER =====
  coverLetter: {
    recipientName: string;
    companyName: string;
    date: Date;
    customMessage?: string;
  };

  // ===== COMPANY OVERVIEW =====
  companyOverview: {
    introduction: string;
    ecosystemBenefits: string[];
    provenSuccess: string[];
    keyStats: {
      brands: number;
      locations: number;
      team: number;
      growth: string;
    };
  };

  // ===== FOR THEIR BRAND =====
  brandProjection: {
    currentBrandAnalysis: string;
    growthProjection: {
      year1: number;      // % revenue increase
      year3: number;      // % revenue increase
      year5: number;      // % revenue increase
    };
    operationalSupport: string[];
    technologyStack: string[];
    marketingSupport: string[];
  };

  // ===== FINANCIAL =====
  financialModel: {
    investmentRequired: {
      minimum: number;
      recommended: number;
      breakdown: {
        franchiseFee: number;
        equipment: number;
        initialInventory: number;
        marketing: number;
        workingCapital: number;
      };
    };
    revenueShareModel: string;
    breakEvenEstimate: string;      // "6-9 months"
    projectedROI: {
      year1: number;
      year2: number;
      year3: number;
    };
  };

  // ===== AGREEMENT TERMS =====
  agreement: {
    contractDuration: number;        // years
    territory: string;             // "exclusivo en [ciudad]"
    royaltyRate: number;           // %
    marketingFund: number;         // %
    renewalOptions: string[];
    exitClause: string;
  };

  // ===== CUSTOMIZABLE =====
  customSections: {
    personalMessage: string;
    customTerms: string[];
    additionalNotes: string;
  };

  // ===== EXPORT =====
  exportToPDF: () => void;
  preview: () => void;
}
```

### Proposal Generator Component
```tsx
<ProposalGenerator lead={lead}>
  <ProposalHeader>
    <Title>Propuesta de Franquicia</Title>
    <Subtitle>Para {lead.full_name}</Subtitle>
    <Date>{new Date().toLocaleDateString('es-PY')}</Date>
  </ProposalHeader>

  <ProposalSection title="Sobre Omniprise">
    <CompanyOverview />
    <KeyStats />
    <SuccessStories />
  </ProposalSection>

  <ProposalSection title="Análisis de tu Marca">
    <BrandAnalysis data={lead} />
    <GrowthProjection data={lead} />
    <FitAssessment data={lead} />
  </ProposalSection>

  <ProposalSection title="Inversión y Retorno">
    <InvestmentBreakdown data={lead} />
    <RevenueModel data={lead} />
    <ROIProjection data={lead} />
  </ProposalSection>

  <ProposalSection title="Acuerdo de Franquicia">
    <ContractTerms />
    <RoyaltyStructure />
    <RenewalOptions />
  </ProposalSection>

  <ProposalActions>
    <Button onClick={downloadPDF}>Descargar PDF</Button>
    <Button onClick={sendEmail}>Enviar por Email</Button>
    <Button onClick={customize}>Personalizar</Button>
  </ProposalActions>
</ProposalGenerator>
```

---

## 📅 IMPLEMENTATION PHASES

### Phase 1: Database & Backend (Week 1)
**Goal:** Set up database schema and API endpoints

**Tasks:**
- [ ] Create franchise_leads table migration
- [ ] Create RLS policies
- [ ] Build lead scoring utility functions
- [ ] Create API routes:
  - `POST /api/franchise/leads` - Submit lead
  - `GET /api/franchise/leads` - List leads
  - `GET /api/franchise/leads/[id]` - Get lead details
  - `PUT /api/franchise/leads/[id]` - Update lead
  - `POST /api/franchise/leads/[id]/score` - Recalculate score
  - `POST /api/franchise/leads/[id]/proposal` - Generate proposal
- [ ] Add email notifications on lead submission
- [ ] Create Supabase triggers for auto-scoring

**Deliverables:**
- ✅ Database schema
- ✅ API endpoints
- ✅ Lead scoring system
- ✅ Email notifications

---

### Phase 2: Franchise Form - Frontend (Week 2)
**Goal:** Build multi-step application form

**Tasks:**
- [ ] Create franchise landing page
- [ ] Build multi-step form wizard
- [ ] Implement form validation (Zod)
- [ ] Add progress indicator
- [ ] Implement auto-save functionality
- [ ] Create confirmation page
- [ ] Add success animations
- [ ] Optimize for mobile

**Deliverables:**
- ✅ Franchise landing page
- ✅ Multi-step form
- ✅ Form validation
- ✅ Mobile optimized

---

### Phase 3: Dashboard Module - Pipeline (Week 3)
**Goal:** Create franchise management module in dashboard

**Tasks:**
- [ ] Create franchise module folder
- [ ] Build pipeline view component
- [ ] Implement drag & drop for status changes
- [ ] Create lead card component
- [ ] Add filtering and search
- [ ] Implement quick actions
- [ ] Add role-based access control

**Deliverables:**
- ✅ Pipeline view
- ✅ Lead cards
- ✅ Status management
- ✅ Filtering/search

---

### Phase 4: Dashboard Module - Details & Analytics (Week 4)
**Goal:** Create lead detail views and analytics

**Tasks:**
- [ ] Build lead detail page
- [ ] Implement score breakdown display
- [ ] Create timeline component
- [ ] Add notes/comments system
- [ ] Build analytics dashboard
- [ ] Create conversion funnel chart
- [ ] Add lead sources chart
- [ ] Implement time-to-close tracking

**Deliverables:**
- ✅ Lead detail pages
- ✅ Analytics dashboard
- ✅ Charts and metrics

---

### Phase 5: Proposal Generator (Week 5)
**Goal:** Build automated proposal generation

**Tasks:**
- [ ] Design proposal template
- [ ] Create proposal generator utility
- [ ] Build proposal preview component
- [ ] Implement PDF export (React PDF)
- [ ] Add customization options
- [ ] Create email sending integration
- [ ] Add proposal version tracking

**Deliverables:**
- ✅ Proposal generator
- ✅ PDF export
- ✅ Email integration
- ✅ Version tracking

---

### Phase 6: Testing & Optimization (Week 6)
**Goal:** Test, optimize, and launch

**Tasks:**
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security review
- [ ] Documentation
- [ ] Training materials
- [ ] Launch
- [ ] Monitor and iterate

**Deliverables:**
- ✅ Fully tested system
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Production ready

---

## 🎯 SUCCESS METRICS

### Lead Quality Metrics
- **Lead Score Distribution:**
  - Champion (80+): 20%
  - High (65-79): 35%
  - Medium (50-64): 30%
  - Low (<50): 15%

### Conversion Metrics
- **Form Completion Rate:** >70%
- **Lead Qualification Rate:** >40%
- **Proposal Acceptance Rate:** >80%
- **Deal Success Rate:** >90%

### Operational Metrics
- **Lead Response Time:** <24 hours
- **Time to Proposal:** <48 hours
- **Time to Close:** <60 days
- **Follow-up Completion:** >90%

### Business Impact
- **Deals Closed/Month:** 12+
- **Average Deal Value:** ₲250M+
- **Total Revenue from Franchises:** ₲3B+/year
- **Locations Added:** 50+/year

---

## 🚨 QUICK WINS (Week 1)

These can be implemented immediately:

1. **Create Google Form (Temporary)**
   - Ask all critical questions
   - Set up automatic email notifications
   - Manual entry into dashboard

2. **Simple Landing Page**
   - Add "Conviértete en Socio" button to hero
   - Link to Google Form
   - Add benefits section

3. **Lead Tracking Spreadsheet**
   - Excel template for manual entry
   - Columns for all data points
   - Calculate scores with formulas

---

## 📁 FILE STRUCTURE

### New Dashboard Files
```
src/app/dashboard/franchise/
├── page.tsx                              # Pipeline view
├── [id]/
│   └── page.tsx                          # Lead detail view
├── analytics/
│   └── page.tsx                          # Analytics dashboard
└── proposal/
    └── [id]/
        └── page.tsx                      # Proposal generator

src/components/franchise/
├── pipeline/
│   ├── pipeline-view.tsx
│   ├── pipeline-stage.tsx
│   ├── lead-card.tsx
│   └── quick-actions.tsx
├── lead-detail/
│   ├── lead-header.tsx
│   ├── score-breakdown.tsx
│   ├── timeline-events.tsx
│   └── lead-tabs.tsx
├── analytics/
│   ├── conversion-funnel.tsx
│   ├── lead-sources-chart.tsx
│   └── time-to-close-chart.tsx
└── proposal/
    ├── proposal-generator.tsx
    ├── proposal-preview.tsx
    └── export-pdf.tsx

src/lib/franchise/
├── lead-scoring.ts                       # Scoring algorithms
├── proposal-generator.ts                  # Proposal creation
├── types.ts                              # TypeScript interfaces
└── validations.ts                        # Zod schemas

supabase/migrations/
└── 025_franchise_leads.sql              # Database schema
```

---

## 📝 NEXT STEPS

1. ✅ Review and approve roadmap
2. ✅ Set up database migration
3. ✅ Begin Phase 1 implementation
4. ⏳ Complete all phases
5. ⏳ Launch franchise system
6. ⏳ Monitor metrics and optimize

---

**Last Updated:** 2026-03-26
**Status:** 📋 Roadmap Defined
**Next Milestone:** Phase 1 - Database & Backend
