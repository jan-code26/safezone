This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## About SafeGuard Radar

SafeGuard Radar is a web application demo designed to help people check on friends and family during weather events and disasters. Inspired by market research, SafeGuard Radar addresses the need for a unified solution that combines real-time location sharing with up-to-date disaster and safety information.

The application emphasizes monitoring static locations like homes and workplaces while also providing a robust plan for live location tracking.

### Core Features

- **Full-Stack Demonstration:** Includes both frontend (Next.js, React, Tailwind CSS) and backend (Next.js API Routes, Supabase) components.
- **Map Integration:** Interactive map display (Leaflet) with dynamic markers for locations, contacts, and alerts.
- **Disaster Data Overlays:** Capable of displaying various safety-relevant events (weather, alerts) on the map. (Note: Specific real-time disaster API integrations beyond basic alerts would be future enhancements).
- **Location Management:** Allows users to manage important places and view contacts' locations. Demo mode available for unauthenticated users.
- **Mobile-Responsive Design:** Built with responsive design principles for accessibility during emergencies.

### Key Focus Areas

#### Static Location Emphasis
The application allows users to define and monitor key locations such as:
- Home addresses
- Workplaces
- Schools
- Other important properties

These locations can be visualized on the map, and their status can be assessed in conjunction with disaster overlay data.

#### Live Location Planning & Implementation
A significant portion of development has focused on live location sharing. Key aspects include:
- **Real-time Sharing:** Users can share their live location with selected contacts.
- **Viewing Live Locations:** Users can see the live locations of contacts who are sharing with them.
- **Technical Implementation:**
    - **API Routes:** `app/api/live-locations/route.ts` for CRUD operations.
    - **Custom Hook:** `app/hooks/useLiveLocation.ts` for managing geolocation, permissions, and updates.
    - **UI Components:** `app/components/live-location/LiveLocationPanel.tsx` for user interaction.
    - **Database:** Supabase backend with a `live_locations` table, including RLS policies for privacy.
- **Detailed documentation:** See `LIVE_LOCATION_SETUP.md` for an in-depth explanation of the setup, data flow, and technical details.

#### API Resilience
Strategies for API resilience include:
- **Primary/Secondary Data Sources (Planned):** For critical data like weather or alerts, the system can be designed to failover to a secondary API if the primary one is unavailable. (e.g., using a different weather provider).
- **Caching:** Implemented for frequently accessed, less dynamic data to reduce API calls and improve performance.
- **Error Handling & Graceful Degradation:** The application attempts to handle API errors gracefully, potentially displaying cached data or notifying the user of a temporary service interruption. For instance, the map can function with demo data if backend services are temporarily unavailable for new users.

#### User Experience (UX)
- **Intuitive Design:** The interface is designed to be clear and easy to use, especially in high-stress emergency situations.
- **Responsive Layout:** Adapts to various screen sizes, ensuring accessibility on mobile devices.
- **Clear Visual Cues:** Use of icons, colors, and status indicators (e.g., on map markers) to convey information quickly.
- **Loading States & Feedback:** The application provides feedback during data loading or authentication processes.

### Pitch Readiness

#### Value Proposition
Safezone offers peace of mind by unifying critical location information and disaster data into a single, easy-to-use platform. Unlike juggling multiple apps (maps, weather, communication), Safezone provides a consolidated view, enabling quicker assessment and response during emergencies. Its focus on both static (property) and live (people) locations makes it a comprehensive safety tool.

#### Go-to-Market Strategy (Conceptual)
1.  **Target Audience:** Families, individuals with dependents (elderly parents, children), small businesses concerned about employee safety during local events.
2.  **Initial Launch:** Freemium model. Basic features (managing a few locations, limited alerts) are free. Premium subscription for unlimited locations, advanced alert types, live location sharing with more contacts, and longer history.
3.  **Marketing:**
    *   Content marketing: Blog posts, articles about emergency preparedness, safety tips.
    *   Social media: Targeted ads on platforms like Facebook, Instagram focusing on safety-conscious demographics.
    *   Partnerships: Collaborate with local emergency services, community organizations, or insurance companies.
4.  **Monetization:** Subscription tiers, potential B2B offerings for small organizations.

### Technical Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Leaflet
- **Backend:** Next.js API Routes, Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Vercel

Safezone aims to provide a secure, user-friendly environment for staying connected and informed during emergencies.
