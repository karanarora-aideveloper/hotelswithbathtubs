const https = require('https');

const MIXPANEL_TOKEN = 'e4466d485df5a447a90ce0833dc50445';

const eventData = [
  {
    event: 'page_view',
    properties: {
      token: MIXPANEL_TOKEN,
      distinct_id: 'test_verification_user_agent',
      path: '/mixpanel-connection-test',
      url: 'https://www.hotelswithbathtubs.com/mixpanel-connection-test',
      title: 'Mixpanel Integration Verification',
      browser: 'Antigravity Verification Agent',
      $lib_version: '1.0.0'
    }
  },
  {
    event: 'hotel_booking_click',
    properties: {
      token: MIXPANEL_TOKEN,
      distinct_id: 'test_verification_user_agent',
      hotel_name: 'Verification Palace Hotel',
      city_name: 'Verify City',
      booking_source: 'Agoda',
      destination_url: 'https://www.agoda.com'
    }
  }
];

const postData = JSON.stringify(eventData);

const options = {
  hostname: 'api.mixpanel.com',
  path: '/track?verbose=1',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📡 Sending test events to Mixpanel...');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Body: ${body}`);
    try {
      const parsed = JSON.parse(body);
      if (parsed.status === 1) {
        console.log('🎉 Mixpanel successfully received the test events!');
      } else {
        console.error('❌ Mixpanel API responded with an error status:', parsed.error);
      }
    } catch {
      console.log('API Response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ HTTP Request failed: ${e.message}`);
});

req.write(postData);
req.end();
