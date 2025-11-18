/**
 * AFAS Data Structure Analyzer
 *
 * Fetches data from all 5 EOL Dashboard connectors and analyzes their structure
 */

export default defineEventHandler(async (event) => {
  try {
    const afasToken = process.env.AFAS_TOKEN;
    const afasEnvironmentId = process.env.AFAS_ENVIRONMENT_ID;

    // Validate environment variables
    if (!afasToken || afasToken.includes('YOUR_TOKEN_HERE')) {
      return {
        success: false,
        error: 'AFAS_TOKEN not configured'
      };
    }

    if (!afasEnvironmentId || afasEnvironmentId === 'YOUR_ENVIRONMENT_ID') {
      return {
        success: false,
        error: 'AFAS_ENVIRONMENT_ID not configured'
      };
    }

    // Define all 5 connectors
    const allConnectors = [
      {
        id: 'cumulative_sales',
        name: 'EOL_dashboard_Cumulative_Sales',
        label: 'Cumulative Sales',
        orderbyfieldids: 'Jaar'
      },
      {
        id: 'sales_price',
        name: 'EOL_dashboard_General_SalesPrice',
        label: 'General Sales Price',
        orderbyfieldids: 'Type_item'
      },
      {
        id: 'items',
        name: 'EOL_dashboard_Items',
        label: 'Dashboard Items',
        orderbyfieldids: 'Type_item'
      },
      {
        id: 'stock',
        name: 'EOL_dashboard_Items_Stock',
        label: 'Stock',
        orderbyfieldids: 'Type_item'
      },
      {
        id: 'units',
        name: 'EOL_dashboard_Unit_Per_Item',
        label: 'Unit Per Item',
        orderbyfieldids: 'ItemType'
      }
    ];

    // Get selected connectors from query parameter
    const query = getQuery(event);
    const selectedConnectorIds = query.connectors
      ? String(query.connectors).split(',').map(id => id.trim())
      : allConnectors.map(c => c.id); // Default to all connectors

    // Filter connectors based on selection
    const connectors = allConnectors.filter(c => selectedConnectorIds.includes(c.id));

    // Validate that we have connectors to analyze
    if (connectors.length === 0) {
      return {
        success: false,
        error: 'No valid connectors selected'
      };
    }

    console.log(`📊 Analyzing ${connectors.length} connector(s): ${connectors.map(c => c.label).join(', ')}`);

    // Encode token
    const base64Token = Buffer.from(afasToken, 'utf-8').toString('base64');
    const authHeader = `AfasToken ${base64Token}`;

    // Fetch data from selected connectors
    const results = await Promise.allSettled(
      connectors.map(async (connector) => {
        const url = `https://${afasEnvironmentId}.rest.afas.online/profitrestservices/connectors/${connector.name}?skip=0&take=10&orderbyfieldids=${connector.orderbyfieldids}`;

        console.log(`Fetching: ${connector.label}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter out blocked products for Items connector
        let filteredRows = data.rows || [];
        let blockedCount = 0;

        if (connector.name.includes('Items') && filteredRows.length > 0) {
          const originalCount = filteredRows.length;
          filteredRows = filteredRows.filter((row: any) => !row.Geblokkeerd);
          blockedCount = originalCount - filteredRows.length;

          if (blockedCount > 0) {
            console.log(`   ${connector.label}: Filtered out ${blockedCount} blocked products`);
          }
        }

        // Analyze the structure
        const analysis = {
          name: connector.name,
          label: connector.label,
          success: true,
          recordCount: filteredRows.length,
          blockedCount: blockedCount > 0 ? blockedCount : undefined,
          fields: filteredRows.length > 0 ? Object.keys(filteredRows[0]) : [],
          fieldTypes: filteredRows.length > 0 ? analyzeFieldTypes(filteredRows[0]) : {},
          sampleRecords: filteredRows,
          rawResponse: {
            skip: data.skip,
            take: data.take
          }
        };

        return analysis;
      })
    );

    // Process results
    const analysis = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: connectors[index].name,
          label: connectors[index].label,
          success: false,
          error: result.reason.message || 'Unknown error',
          recordCount: 0,
          fields: [],
          fieldTypes: {},
          sampleRecords: []
        };
      }
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      connectors: analysis,
      summary: {
        total: connectors.length,
        successful: analysis.filter(a => a.success).length,
        failed: analysis.filter(a => !a.success).length
      }
    };

  } catch (error: any) {
    console.error('AFAS Analysis Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    };
  }
});

/**
 * Analyze field types from sample data
 */
function analyzeFieldTypes(record: any): Record<string, string> {
  const types: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) {
      types[key] = 'null';
    } else if (typeof value === 'number') {
      types[key] = Number.isInteger(value) ? 'integer' : 'decimal';
    } else if (typeof value === 'boolean') {
      types[key] = 'boolean';
    } else if (typeof value === 'string') {
      // Check if it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        types[key] = 'date/string';
      } else {
        types[key] = 'string';
      }
    } else {
      types[key] = typeof value;
    }
  }

  return types;
}
