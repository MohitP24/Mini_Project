const fetch = globalThis.fetch;

async function testSimulate() {
  const payload = {
    // Draft condition: block IP 192.168.1.15
    conditions: JSON.stringify([{ type: 'ip', value: '192.168.1.15' }]),
    scope: '192.168.1.15'
  };

  try {
    const res = await fetch('http://localhost:8083/api/admin/policies/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Status Code:', res.status);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testSimulate();
