# Marketplace System Documentation

## Overview
The marketplace system provides a public discovery platform for gyms and mentors, enabling users to find fitness facilities and coaching services in their area with seamless integration to the core platform.

## System Architecture

### Core Components

#### 1. Public Discovery
- **Gym Marketplace**: City-based gym discovery with activity metrics
- **Mentor Marketplace**: Category-based mentor discovery with specializations
- **Search & Filtering**: Location and attribute-based filtering
- **SEO Optimization**: Public pages for search engine visibility

#### 2. Data Aggregation  
- **Activity Metrics**: Real-time gym usage statistics
- **Performance Indicators**: Member and coach counts
- **Content Management**: Photos, descriptions, and metadata
- **Availability Status**: Real-time equipment and coach availability

#### 3. Integration Layer
- **QR Code Joining**: Seamless gym membership activation
- **Coach Requests**: Direct mentor booking and consultation
- **Geographic Services**: Location-based discovery and mapping
- **Social Proof**: Reviews, ratings, and community metrics

## Data Models

### Marketplace Gym
```typescript
interface MarketplaceGym {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  photo_url?: string;
  active_members: number;
  active_coaches: number;
  description?: string;
  amenities?: string[];
  operating_hours?: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    // ... other days
  };
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}
```

### Marketplace Mentor
```typescript
interface MarketplaceMentor {
  mentor_profile_id: string;
  headline?: string;
  bio?: string;
  slug?: string;
  is_active: boolean;
  categories: string[];
  specializations?: string[];
  hourly_rate_cents?: number;
  currency?: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  rating_average?: number;
  rating_count?: number;
  location_preferences?: string[];
}
```

### Local Context
```typescript
interface LocalMentor {
  mentor_profile_id: string;
  headline?: string;
  slug?: string;
  city: string;
  country: string;
  active_gym_count: number;
  last_activity?: string;
}
```

## Database Views

### Gym Marketplace View
```sql
-- v_marketplace_gyms: Public gym catalog with activity metrics
CREATE OR REPLACE VIEW public.v_marketplace_gyms AS
SELECT
  g.id,
  g.slug,
  g.name,
  g.city,
  g.country,
  g.photo_url,
  g.description,
  g.contact_info,
  g.operating_hours,
  COALESCE(ga.active_members, 0) as active_members,
  COALESCE(ga.active_coaches, 0) as active_coaches,
  COALESCE(ga.workouts_7d, 0) as weekly_workouts,
  COALESCE(ga.workouts_30d, 0) as monthly_workouts
FROM public.gyms g
LEFT JOIN public.v_gym_activity ga ON ga.gym_id = g.id
WHERE g.status = 'active'
  AND g.is_public = true;
```

### Mentor Marketplace View  
```sql
-- v_marketplace_mentors: Public mentor catalog with categories
CREATE OR REPLACE VIEW public.v_marketplace_mentors AS
SELECT
  mp.id as mentor_profile_id,
  mp.headline,
  mp.bio,
  mp.slug,
  mp.is_active,
  mp.hourly_rate_cents,
  mp.currency,
  mp.avatar_url,
  array_agg(mc.category_key ORDER BY mc.category_key) 
    FILTER (WHERE mc.category_key IS NOT NULL) as categories,
  COUNT(DISTINCT gcm.gym_id) as active_gym_count,
  MAX(gcm.created_at) as last_gym_activity
FROM public.mentor_profiles mp
LEFT JOIN public.mentor_categories mc ON mc.mentor_profile_id = mp.id
LEFT JOIN public.gym_coach_memberships gcm ON gcm.mentor_id = mp.id 
  AND gcm.status = 'active'
WHERE mp.is_active = true 
  AND mp.is_public = true 
  AND mp.accepts_clients = true
GROUP BY mp.id, mp.headline, mp.bio, mp.slug, mp.is_active, 
         mp.hourly_rate_cents, mp.currency, mp.avatar_url;
```

### Local Mentor View
```sql
-- v_marketplace_local_mentors: Location-based mentor discovery
CREATE OR REPLACE VIEW public.v_marketplace_local_mentors AS
SELECT DISTINCT
  mp.id as mentor_profile_id,
  mp.headline,
  mp.slug,
  mp.avatar_url,
  c.city,
  c.country,
  COUNT(DISTINCT gcm.gym_id) as gym_count,
  MAX(gcm.created_at) as last_activity_at
FROM public.mentor_profiles mp
JOIN public.gym_coach_memberships gcm ON gcm.mentor_id = mp.id 
  AND gcm.status = 'active'
JOIN public.gyms g ON g.id = gcm.gym_id
JOIN public.cities c ON lower(c.city) = lower(g.city) 
  AND lower(c.country) = lower(g.country)
WHERE mp.is_active = true 
  AND mp.is_public = true
  AND g.status = 'active'
GROUP BY mp.id, mp.headline, mp.slug, mp.avatar_url, c.city, c.country;
```

## API Endpoints

### Gym Discovery
```typescript
// Get marketplace gyms with filtering
async function getMarketplaceGyms(filters: {
  city?: string;
  country?: string;
  sortBy?: 'name' | 'members_desc' | 'coaches_desc';
  limit?: number;
}) {
  let query = supabase
    .from('v_marketplace_gyms')
    .select('*');
    
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  
  if (filters.country) {
    query = query.ilike('country', `%${filters.country}%`);
  }
  
  // Apply sorting
  switch (filters.sortBy) {
    case 'members_desc':
      query = query.order('active_members', { ascending: false });
      break;
    case 'coaches_desc':
      query = query.order('active_coaches', { ascending: false });
      break;
    default:
      query = query.order('name');
  }
  
  const { data, error } = await query.limit(filters.limit || 20);
  if (error) throw error;
  return data;
}

// Get gym details by slug
async function getGymBySlug(slug: string) {
  const { data, error } = await supabase
    .from('gyms')
    .select(`
      *,
      gym_equipment (
        equipment (name, slug),
        availability_status
      ),
      gym_coach_memberships (
        mentor_profiles (headline, avatar_url)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
    
  if (error) throw error;
  return data;
}
```

### Mentor Discovery
```typescript
// Get marketplace mentors with filtering
async function getMarketplaceMentors(filters: {
  category?: string;
  city?: string;
  hourly_rate_max?: number;
  limit?: number;
}) {
  let query = supabase
    .from('v_marketplace_mentors')
    .select('*');
    
  if (filters.category) {
    query = query.contains('categories', [filters.category]);
  }
  
  if (filters.hourly_rate_max) {
    query = query.lte('hourly_rate_cents', filters.hourly_rate_max * 100);
  }
  
  const { data, error } = await query
    .order('active_gym_count', { ascending: false })
    .limit(filters.limit || 20);
    
  if (error) throw error;
  return data;
}

// Get local mentors by location
async function getLocalMentors(city: string, country?: string) {
  let query = supabase
    .from('v_marketplace_local_mentors')
    .select('*')
    .ilike('city', `%${city}%`);
    
  if (country) {
    query = query.ilike('country', `%${country}%`);
  }
  
  const { data, error } = await query
    .order('gym_count', { ascending: false })
    .limit(20);
    
  if (error) throw error;
  return data;
}
```

## Frontend Components

### Marketplace Home
```typescript
export function MarketplaceHome() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Fitness Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover gyms and mentors in your area. Connect with the fitness community.
        </p>
      </div>

      <Tabs defaultValue="gyms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gyms">
            <MapPin className="h-4 w-4 mr-2" />
            Gyms
          </TabsTrigger>
          <TabsTrigger value="mentors">
            <Users className="h-4 w-4 mr-2" />
            Mentors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gyms">
          <GymsMarketplace />
        </TabsContent>

        <TabsContent value="mentors">
          <MentorsMarketplace />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Gym Marketplace
```typescript
export function GymsMarketplace() {
  const [searchCity, setSearchCity] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const { data: gyms, isLoading } = useMarketplaceGyms(searchCity, searchCountry, sortBy);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Search by country..."
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="members_desc">Most Members</SelectItem>
            <SelectItem value="coaches_desc">Most Coaches</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms?.map((gym) => (
          <GymCard key={gym.id} gym={gym} />
        ))}
      </div>
    </div>
  );
}
```

### Mentor Marketplace
```typescript
export function MentorsMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');

  const { data: mentors } = useMarketplaceMentors(selectedCategory, searchCity);

  const categories = [
    'strength', 'cardio', 'yoga', 'pilates', 'crossfit',
    'bodybuilding', 'powerlifting', 'nutrition', 'weight-loss', 'rehabilitation'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors?.map((mentor) => (
          <MentorCard key={mentor.mentor_profile_id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
}
```

## Public Pages

### Gym Profile Page
```typescript
// Route: /g/{slug}
export function GymProfile({ slug }: { slug: string }) {
  const { data: gym, isLoading } = useGymBySlug(slug);
  
  if (isLoading) return <LoadingSpinner />;
  if (!gym) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <GymHeader gym={gym} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GymDescription gym={gym} />
          <EquipmentSection equipment={gym.gym_equipment} />
          <CoachesSection coaches={gym.gym_coach_memberships} />
        </div>
        
        <div className="space-y-6">
          <JoinGymCard gym={gym} />
          <GymStats gym={gym} />
          <ContactInfo gym={gym} />
        </div>
      </div>
    </div>
  );
}

function JoinGymCard({ gym }: { gym: any }) {
  const handleJoinGym = () => {
    // Generate QR code or redirect to joining flow
    window.location.href = `/join/${gym.slug}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join This Gym</CardTitle>
        <CardDescription>
          Start your fitness journey at {gym.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleJoinGym} className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Join Gym
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Mentor Profile Page
```typescript
// Route: /m/{slug-or-id}
export function MentorProfile({ identifier }: { identifier: string }) {
  const { data: mentor, isLoading } = useMentorById(identifier);
  
  if (isLoading) return <LoadingSpinner />;
  if (!mentor) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <MentorHeader mentor={mentor} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MentorBio mentor={mentor} />
          <Specializations mentor={mentor} />
          <Availability mentor={mentor} />
        </div>
        
        <div className="space-y-6">
          <RequestCoachingCard mentor={mentor} />
          <RatingsSummary mentor={mentor} />
          <PricingInfo mentor={mentor} />
        </div>
      </div>
    </div>
  );
}

function RequestCoachingCard({ mentor }: { mentor: any }) {
  const handleRequestCoaching = () => {
    // Create coach-client link request
    createCoachingRequest(mentor.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Coaching</CardTitle>
        <CardDescription>
          Start working with {mentor.headline}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRequestCoaching} className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          Request Coaching
        </Button>
      </CardContent>
    </Card>
  );
}
```

## SEO Optimization

### Meta Tags Generation
```typescript
// Dynamic meta tags for gym pages
export function generateGymMetaTags(gym: MarketplaceGym) {
  return {
    title: `${gym.name} - Gym in ${gym.city}, ${gym.country}`,
    description: `Join ${gym.name} in ${gym.city}. ${gym.active_members} active members, ${gym.active_coaches} coaches. Find equipment, classes, and fitness community.`,
    keywords: [
      'gym', 'fitness', 'workout', gym.city, gym.country,
      'personal training', 'strength training', 'cardio'
    ].join(', '),
    openGraph: {
      title: `${gym.name} - Fitness Community`,
      description: `Join the fitness community at ${gym.name} in ${gym.city}`,
      image: gym.photo_url,
      type: 'business.business'
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Gym',
      name: gym.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: gym.city,
        addressCountry: gym.country
      },
      image: gym.photo_url,
      telephone: gym.contact_info?.phone,
      url: `https://yourapp.com/g/${gym.slug}`
    }
  };
}

// Dynamic meta tags for mentor pages
export function generateMentorMetaTags(mentor: MarketplaceMentor) {
  return {
    title: `${mentor.headline} - Personal Trainer & Fitness Coach`,
    description: `Train with ${mentor.headline}. Specializing in ${mentor.categories?.join(', ')}. Professional fitness coaching and personal training.`,
    keywords: [
      'personal trainer', 'fitness coach', 'workout coach',
      ...mentor.categories || []
    ].join(', '),
    openGraph: {
      title: `${mentor.headline} - Fitness Coach`,
      description: mentor.bio,
      image: mentor.avatar_url,
      type: 'profile'
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: mentor.headline,
      description: mentor.bio,
      image: mentor.avatar_url,
      jobTitle: 'Fitness Coach',
      offers: {
        '@type': 'Offer',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: mentor.hourly_rate_cents ? mentor.hourly_rate_cents / 100 : undefined,
          priceCurrency: mentor.currency
        }
      }
    }
  };
}
```

### Sitemap Generation
```typescript
// Generate sitemap for public pages
export function generateMarketplaceSitemap() {
  const urls = [];
  
  // Marketplace homepage
  urls.push({
    url: '/marketplace',
    lastmod: new Date().toISOString(),
    priority: 0.8
  });
  
  // Individual gym pages
  const gyms = getMarketplaceGyms({ limit: 1000 });
  gyms.forEach(gym => {
    urls.push({
      url: `/g/${gym.slug}`,
      lastmod: gym.updated_at || gym.created_at,
      priority: 0.6
    });
  });
  
  // Individual mentor pages
  const mentors = getMarketplaceMentors({ limit: 1000 });
  mentors.forEach(mentor => {
    urls.push({
      url: `/m/${mentor.slug || mentor.mentor_profile_id}`,
      lastmod: mentor.updated_at || mentor.created_at,
      priority: 0.6
    });
  });
  
  return urls;
}
```

## Analytics & Tracking

### Page View Tracking
```typescript
// Track marketplace page views
export function trackMarketplaceView(pageType: 'gym' | 'mentor', identifier: string) {
  analytics.track('marketplace_view', {
    page_type: pageType,
    identifier: identifier,
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    referrer: document.referrer
  });
}

// Track marketplace searches
export function trackMarketplaceSearch(searchType: 'gym' | 'mentor', filters: any) {
  analytics.track('marketplace_search', {
    search_type: searchType,
    filters: filters,
    timestamp: Date.now()
  });
}
```

### Conversion Tracking
```typescript
// Track gym join attempts
export function trackGymJoinAttempt(gymId: string, source: 'marketplace' | 'qr' | 'direct') {
  analytics.track('gym_join_attempt', {
    gym_id: gymId,
    source: source,
    timestamp: Date.now()
  });
}

// Track coaching requests
export function trackCoachingRequest(mentorId: string, source: 'marketplace' | 'referral') {
  analytics.track('coaching_request', {
    mentor_id: mentorId,
    source: source,
    timestamp: Date.now()
  });
}
```

## Performance Optimization

### Caching Strategy
```typescript
// React Query with aggressive caching for marketplace data
export function useMarketplaceGyms(city?: string, country?: string, sortBy?: string) {
  return useQuery({
    queryKey: ['marketplace-gyms', city, country, sortBy],
    queryFn: () => getMarketplaceGyms({ city, country, sortBy }),
    staleTime: 300000, // 5 minutes
    cacheTime: 1800000, // 30 minutes
    keepPreviousData: true
  });
}

// Image optimization for gym photos
function optimizeImage(url: string, width: number, height: number) {
  if (!url) return '/placeholder-gym.jpg';
  
  // Use image optimization service
  return `${url}?w=${width}&h=${height}&q=80&fit=crop`;
}
```

### Database Optimization
```sql
-- Indexes for marketplace queries
CREATE INDEX idx_gyms_marketplace ON gyms(status, is_public, city, country) 
WHERE status = 'active' AND is_public = true;

CREATE INDEX idx_mentors_marketplace ON mentor_profiles(is_active, is_public, accepts_clients)
WHERE is_active = true AND is_public = true AND accepts_clients = true;

-- Partial index for gym activity lookups
CREATE INDEX idx_gym_activity_active ON v_gym_activity(gym_id) 
WHERE active_members > 0 OR active_coaches > 0;
```

## Security Considerations

### Public Data Exposure
```sql
-- RLS policies ensure only appropriate data is exposed
CREATE POLICY "marketplace_gyms_public" ON gyms
FOR SELECT TO anon, authenticated
USING (status = 'active' AND is_public = true);

CREATE POLICY "marketplace_mentors_public" ON mentor_profiles  
FOR SELECT TO anon, authenticated
USING (is_active = true AND is_public = true AND accepts_clients = true);
```

### Rate Limiting
```javascript
// Implement rate limiting for public endpoints
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/marketplace', rateLimiter);
```

---

*Last Updated: 2025-01-06*
*Marketplace System Version: 1.0*
