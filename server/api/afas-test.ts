/**
 * AFAS API Test Endpoint
 *
 * This endpoint allows testing AFAS REST API connections and exploring available data.
 * It handles token encoding and makes requests to AFAS GetConnectors.
 */

export default defineEventHandler(async (event) => {
  try {
    // Get configuration from environment variables
    const config = useRuntimeConfig();
    const afasToken = process.env.AFAS_TOKEN;
    const afasEnvironmentId = process.env.AFAS_ENVIRONMENT_ID;

    // Validate environment variables
    if (!afasToken || afasToken.includes('YOUR_TOKEN_HERE')) {
      return {
        success: false,
        error: 'AFAS_TOKEN not configured in .env file',
        message: 'Please add your AFAS token to the .env file'
      };
    }

    if (!afasEnvironmentId || afasEnvironmentId === 'YOUR_ENVIRONMENT_ID') {
      return {
        success: false,
        error: 'AFAS_ENVIRONMENT_ID not configured in .env file',
        message: 'Please add your AFAS environment ID to the .env file'
      };
    }

    // Get query parameters
    const query = getQuery(event);
    const connector = (query.connector as string) || 'Profit_Article';
    const skip = query.skip !== undefined ? String(query.skip) : '0';
    const take = query.take !== undefined ? String(query.take) : '10';
    const filterfieldids = query.filterfieldids as string;
    const filtervalues = query.filtervalues as string;
    const operatortypes = query.operatortypes as string;
    const orderbyfieldids = query.orderbyfieldids as string;
    const filterjson = query.filterjson as string;

    // Build AFAS API URL
    const baseUrl = `https://${afasEnvironmentId}.rest.afas.online/profitrestservices/connectors/${connector}`;
    const params = new URLSearchParams();
    params.append('skip', skip);
    params.append('take', take);

    if (filterfieldids) params.append('filterfieldids', filterfieldids);
    if (filtervalues) params.append('filtervalues', filtervalues);
    if (operatortypes) params.append('operatortypes', operatortypes);
    if (orderbyfieldids) params.append('orderbyfieldids', orderbyfieldids);
    if (filterjson) params.append('filterjson', filterjson);

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Encode token to Base64
    const base64Token = Buffer.from(afasToken, 'utf-8').toString('base64');
    const authHeader = `AfasToken ${base64Token}`;

    // Make request to AFAS API
    console.log(`Making AFAS API request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    // Get response data
    const responseData = await response.json();

    // Filter out blocked products for Items connector
    let filteredData = responseData;
    let blockedCount = 0;

    if (connector.includes('Items') && responseData.rows) {
      const originalCount = responseData.rows.length;
      filteredData = {
        ...responseData,
        rows: responseData.rows.filter((row: any) => !row.Geblokkeerd)
      };
      blockedCount = originalCount - filteredData.rows.length;

      if (blockedCount > 0) {
        console.log(`   Filtered out ${blockedCount} blocked products from ${connector}`);
      }
    }

    // Return response with metadata
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      request: {
        url: apiUrl,
        connector: connector,
        parameters: {
          skip,
          take,
          filterfieldids: filterfieldids || null,
          filtervalues: filtervalues || null,
          operatortypes: operatortypes || null,
          orderbyfieldids: orderbyfieldids || null,
          filterjson: filterjson || null
        }
      },
      data: filteredData,
      recordCount: filteredData.rows ? filteredData.rows.length : 0,
      blockedCount: blockedCount > 0 ? blockedCount : undefined
    };

  } catch (error: any) {
    console.error('AFAS API Error:', error);

    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    };
  }
});
