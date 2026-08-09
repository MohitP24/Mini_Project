const fetch = globalThis.fetch;

async function runSimulation(testName, conditions, scope) {
  const payload = {
    conditions: JSON.stringify(conditions),
    scope: scope
  };

  try {
    const res = await fetch('http://localhost:8083/api/admin/policies/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    return {
      testName,
      status: res.status,
      evaluated: json.totalEventsEvaluated,
      diverged: json.divergedCount
    };
  } catch (error) {
    return {
      testName,
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runAllTests() {
  const results = [];
  
  results.push(await runSimulation(
    'CIDR Block / Subnet Blocking',
    [{ type: 'ip', value: '192.168.1.0/24' }],
    '192.168.1'
  ));

  results.push(await runSimulation(
    'Blocking Unauthorized Guest Roles',
    [{ type: 'role', value: 'ROLE_GUEST' }],
    'admin'
  ));

  results.push(await runSimulation(
    'Restricting Endpoint Access',
    [{ type: 'endpoint', value: '/api/payments' }],
    'payments'
  ));

  results.push(await runSimulation(
    'Quarantining High Risk Requests',
    [{ type: 'risk', value: '0.5' }],
    ''
  ));

  results.push(await runSimulation(
    'Multi-Condition (AND) Policy',
    [
      { type: 'ip', value: '203.0.113.99' },
      { type: 'endpoint', value: '/api/payments/process' }
    ],
    '203.0.113.99'
  ));

  console.log('\n=========================================');
  console.log('      WHAT-IF SIMULATION SUMMARY');
  console.log('=========================================');
  results.forEach(r => {
    console.log(`Test Name : ${r.testName}`);
    console.log(`Status    : ${r.status}`);
    if (r.status === 200) {
      console.log(`Evaluated : ${r.evaluated}`);
      console.log(`Diverged  : ${r.diverged}`);
    } else {
      console.log(`Error     : ${r.error}`);
    }
    console.log('-----------------------------------------');
  });
}

runAllTests();
