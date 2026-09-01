const { google } = require('/Users/karanarora/google-search-console-mcp/node_modules/googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = '1XGjO7pFp8NsgY7uPGUcAqJUuu_cSBMtlSbkAXd9cO7Y';

const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/karanarora/.config/gcloud/gsc-service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function formatSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  
  const cityOverviewSheet = meta.data.sheets.find(s => s.properties.title === 'City Overview');
  const allHotelsSheet = meta.data.sheets.find(s => s.properties.title === 'All Hotels Audit');

  const requests = [];

  // Helper for Header styling
  const styleHeader = (sheetId, endColIndex) => ({
    repeatCell: {
      range: {
        sheetId: sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: endColIndex
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.12, green: 0.23, blue: 0.54 }, // Dark Navy Blue #1E3A8A
          textFormat: {
            foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
            bold: true,
            fontSize: 10
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE'
        }
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
    }
  });

  // Freeze top row
  const freezeTopRow = (sheetId) => ({
    updateSheetProperties: {
      properties: {
        sheetId: sheetId,
        gridProperties: {
          frozenRowCount: 1
        }
      },
      fields: 'gridProperties.frozenRowCount'
    }
  });

  if (cityOverviewSheet) {
    const id = cityOverviewSheet.properties.sheetId;
    requests.push(styleHeader(id, 9));
    requests.push(freezeTopRow(id));
    requests.push({
      autoResizeDimensions: {
        dimensions: { sheetId: id, dimension: 'COLUMNS', startIndex: 0, endIndex: 9 }
      }
    });
  }

  if (allHotelsSheet) {
    const id = allHotelsSheet.properties.sheetId;
    requests.push(styleHeader(id, 15));
    requests.push(freezeTopRow(id));
    requests.push({
      autoResizeDimensions: {
        dimensions: { sheetId: id, dimension: 'COLUMNS', startIndex: 0, endIndex: 15 }
      }
    });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests }
    });
    console.log('✅ Applied professional Google Sheets styling, frozen headers, and auto-column widths!');
  }
}

formatSheet().catch(console.error);
