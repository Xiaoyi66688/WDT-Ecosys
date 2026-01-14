# Waikato Digital & Tech Ecosystem

A Next.js web application for managing and displaying the Waikato Digital & Tech Ecosystem organizations, connected to Xano backend.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Xano account with API access
- A Google Maps API Key (for map functionality)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd WDT-Ecosys
```

### 2. Install dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables Setup

### 1. Create `.env.local` file

Create a `.env.local` file in the project root directory:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Xano API Configuration
NEXT_PUBLIC_XANO_API_URL_ECOSYSTEM=your_xano_ecosystem_api_url
NEXT_PUBLIC_XANO_API_URL_AUTH=your_xano_auth_api_url
NEXT_PUBLIC_XANO_API_URL_LOGS=your_xano_logs_api_url
NEXT_PUBLIC_XANO_API_URL_MEMBERS=your_xano_members_api_url
NEXT_PUBLIC_XANO_API_KEY=your_xano_api_key_if_needed
```

**Important**: Replace `your_..._here` with your actual values.

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Maps JavaScript API**
4. Create credentials → API Key
5. Configure API Key restrictions:
   - **Application restrictions**: HTTP referrers
   - Add allowed domains: `http://localhost:3000/*` and your production domain
   - **API restrictions**: Select "Maps JavaScript API" only
6. Copy the API Key and add it to `.env.local`

### 3. Get Xano API URLs

1. Log in to your [Xano](https://xano.com) account
2. Navigate to your project
3. Go to **API** section
4. Find your API Groups and copy the Base URLs:
   - **Ecosystem Map API Group** → `NEXT_PUBLIC_XANO_API_URL_ECOSYSTEM`
   - **Authentication API Group** → `NEXT_PUBLIC_XANO_API_URL_AUTH`
   - **Event Logs API Group** → `NEXT_PUBLIC_XANO_API_URL_LOGS`
   - **Members API Group** → `NEXT_PUBLIC_XANO_API_URL_MEMBERS`
5. If your Xano API requires authentication, get the API Key and add it to `NEXT_PUBLIC_XANO_API_KEY`

---

## 🗄️ Xano Backend Setup

### Required API Endpoints

You need to create the following endpoints in your Xano **Ecosystem Map API Group**:

#### 1. GET /Get_all_organisations
- **Purpose**: Fetch all organizations
- **Table**: `organisations_cleaned` (or your organization table)
- **Response**: Should return array of organizations with fields:
  - `id`, `name`, `contact_person`, `position`, `email_id`, `phone`, `website`, `physical_address`, `expertise`, `impact_area`, `latitude`, `longitude`, etc.

#### 2. POST /organisations
- **Purpose**: Create new organization (Join form submission)
- **Input fields**:
  - `orgName` (text, Required)
  - `orgDesc` (text, Required)
  - `contactPerson` (text, Required)
  - `role` (text, Required)
  - `email` (text, Required)
  - `phone` (text, Required)
  - `address` (text, Required)
  - `expertise` (text, Required)
  - `website` (text, Optional)
  - `country` (text, Optional)
- **Function**: Add Record to `organisations_cleaned` table
- **Response**: Should return the created record

#### 3. POST /contact
- **Purpose**: Submit contact form
- **Input fields**:
  - `name` (text, Required)
  - `organisation` (text, Required)
  - `email` (text, Required)
  - `reason` (text, Required)
  - `comments` (text, Required)
- **Function**: Add Record to `contact_submissions` table
- **Response**: Should return the created record

#### 4. POST /opt-out
- **Purpose**: Submit opt-out request
- **Input fields**:
  - `orgName` (text, Required)
  - `name` (text, Required)
  - `role` (text, Required)
  - `email` (text, Required)
  - `address` (text, Optional)
  - `reason` (text, Required)
- **Function**: Add Record to `opt_out_requests` table
- **Response**: Should return the created record

### Required Database Tables

#### 1. organisations_cleaned
Required fields:
- `id` (integer, Primary Key)
- `name` (text)
- `contact_person` (text)
- `position` (text)
- `email_id` (text)
- `phone` (text)
- `website` (text)
- `physical_address` (text)
- `expertise` (text)
- `impact_area` (text)
- `latitude` (text)
- `longitude` (text)
- And other fields as needed

#### 2. contact_submissions
Required fields:
- `id` (integer, Primary Key, Auto-increment)
- `created_at` (timestamp)
- `name` (text, Required)
- `organisation` (text, Required)
- `email` (text, Required)
- `reason` (text, Required)
- `comments` (text, Required)

#### 3. opt_out_requests
Required fields:
- `id` (integer, Primary Key, Auto-increment)
- `created_at` (timestamp)
- `org_name` (text, Required)
- `name` (text, Required)
- `role` (text, Required)
- `email` (text, Required)
- `address` (text, Optional)
- `reason` (text, Required)

---

## 🏃 Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
WDT-Ecosys/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── database/
│   │   │   └── page.tsx          # Database/Organizations page
│   │   ├── map/
│   │   │   └── page.tsx          # Map page
│   │   ├── join/
│   │   │   └── page.tsx         # Join form page
│   │   ├── contact/
│   │   │   └── page.tsx         # Contact form page
│   │   └── opt-out/
│   │       └── page.tsx         # Opt-out form page
│   └── lib/
│       ├── xano-config.ts       # Xano API configuration
│       └── xano-api.ts          # Xano API service functions
├── .env.local                   # Environment variables (not in git)
└── package.json
```

---

## 🔧 Configuration

### API Configuration

The API configuration is managed in `src/lib/xano-config.ts`. It supports multiple Xano API Groups:

- **Ecosystem Map**: Main API for organizations, database, and forms
- **Auth**: Authentication API
- **Event Logs**: Event logging API
- **Members**: Members and accounts API

### Field Mapping

The application handles field name mapping between Xano database (snake_case) and frontend (camelCase):

- `contact_person` → `contactPerson`
- `position` → `role`
- `email_id` → `email`
- `physical_address` → `address`
- `impact_area` → `impactArea`

---

## 🐛 Troubleshooting

### Google Maps not loading

1. Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Verify the API Key is valid in Google Cloud Console
3. Check API Key restrictions (should allow `localhost:3000`)
4. Ensure "Maps JavaScript API" is enabled

### Xano API errors

1. Verify all API URLs are correct in `.env.local`
2. Check if API endpoints are published in Xano
3. Verify endpoint permissions are set to "Public"
4. Check Xano API rate limits (free plan: 10 requests per 20 seconds)

### Data not loading

1. Check browser console for errors
2. Verify Xano API endpoints are working (test in Xano dashboard)
3. Check database table structure matches expected fields
4. Verify field mapping in `src/lib/xano-api.ts`

---

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## 🔒 Security Notes

- Never commit `.env.local` file to version control
- Keep API Keys secure
- Set proper restrictions on Google Maps API Key
- Monitor API usage to prevent abuse

---

## 👥 For Team Members

### Setting up for the first time

1. **Fork the repository** (if working with forks)
2. **Clone your fork**:
   ```bash
   git clone <your-fork-url>
   cd WDT-Ecosys
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create `.env.local` file**:
   - Copy the environment variables template from the team
   - Or ask team lead for the `.env.local` template
   - Fill in your own API Keys
5. **Run the development server**:
   ```bash
   npm run dev
   ```

### Getting API Keys

- **Google Maps API Key**: Contact team lead or check team documentation
- **Xano API URLs**: Contact team lead or check team documentation
- **Xano API Key**: Contact team lead if authentication is required

### Working with the codebase

- All API calls are centralized in `src/lib/xano-api.ts`
- API configuration is in `src/lib/xano-config.ts`
- Each page component handles its own data fetching and form submissions

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Xano Documentation](https://docs.xano.com)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the Troubleshooting section above
2. Check browser console for error messages
3. Verify your `.env.local` file is configured correctly
4. Contact the team lead or check team documentation
