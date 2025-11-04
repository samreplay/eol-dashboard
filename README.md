# EOL Dashboard

End of Life Product Management Dashboard built with Nuxt 3, Vue.js, and Supabase.

## Features

- **Phase-based Product Lifecycle Management**
  - Phase 0 (Green): In stock and portfolio product
  - Phase 1 (Purple): Phasing out - portfolio team only
  - Phase 2 (Orange): Sell out started
  - Phase 3 (Red): Stock depleted
  - Phase 4 (Blue): Action required - stock remaining after 12+ months

- **Product Tracking**
  - Product details (name, code, pricing)
  - EOL date and reason
  - Replacement product information
  - Stock levels and sales data
  - Website and reseller portal status

- **Automated Phase Transitions**
  - Automatic phase calculation based on stock levels and dates
  - Phase history tracking
  - Future: Automated notifications

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Supabase:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_anon_key
     ```

4. Setup database:
   - Go to your Supabase project SQL Editor
   - Run the SQL commands from `database/schema.sql`

5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
EOL-Dashboard/
├── assets/css/          # Global styles and Tailwind CSS
├── components/          # Vue components
├── composables/         # Vue composables and utilities
├── database/            # Database schema and migrations
├── layouts/             # Layout components
├── pages/               # Route pages
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── app.vue             # Root component
```

## Phase Logic

The dashboard automatically calculates product phases based on:

- **Phase 0**: Product is in stock, no EOL date set, active in portfolio
- **Phase 1**: EOL date is set but not yet announced (internal phase)
- **Phase 2**: Triggered when:
  - Stock is less than 1 month based on monthly sales, OR
  - More than 11 months have passed since EOL date
- **Phase 3**: Stock quantity is 0 or negative
- **Phase 4**: More than 12 months since EOL date AND stock is still available

## API Integration

The dashboard is designed to integrate with external inventory/ERP systems. See `composables/useApiIntegration.ts` for integration structure.

Expected API format:
```json
{
  "product_code": "ABC123",
  "stock_quantity": 500,
  "monthly_sales": 50
}
```

## Future Enhancements

- Email notification system
- Role-based access control for Phase 1 visibility
- Bulk import/export functionality
- Advanced filtering and search
- Analytics dashboard
- Mobile responsive design optimization

## License

Private - Internal Use Only
