# Waikato Digital & Tech Ecosystem Frontend

This is a Next.js project replicating the WDT Ecosystem frontend.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Page routes and layouts.
- `src/components`: Reusable UI components (Header, Footer).
- `public/`: Static assets (Images, Logos).

## Notes for Backend Integration

I have added comments marked with `=== 【同事注意 / FOR COLLEAGUE】 ===` in the following files to indicate where backend integration (Airtable, Google Maps API) is needed:

- `src/app/page.tsx`: Statistics on the home page.
- `src/app/about/page.tsx`: Statistics on the about page.
- `src/app/database/page.tsx`: Mock data and filter options.
- `src/app/map/page.tsx`: Google Maps API Key and marker data.
- `src/app/join/page.tsx`: Form submission logic.
- `src/app/contact/page.tsx`: Form submission logic.
- `src/app/opt-out/page.tsx`: Form submission logic.

## Dependencies

- **Tailwind CSS**: For styling.
- **Lucide React**: For icons.
- **@react-google-maps/api**: For Google Maps integration.
- **axios**: For address autocomplete (Photon API).
- **libphonenumber-js** & **react-select-country-list**: For the country/phone selector.

