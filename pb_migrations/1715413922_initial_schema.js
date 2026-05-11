migrate((db) => {
  // 1. site_config
  const siteConfig = new Collection({
    name: 'site_config',
    type: 'base',
    schema: [
      { name: 'data', type: 'json' }
    ],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null
  });

  // 2. members
  const members = new Collection({
    name: 'members',
    type: 'base',
    schema: [
      { name: 'email', type: 'email', required: true },
      { name: 'name', type: 'text' },
      { name: 'tierId', type: 'text' },
      { name: 'paymentStatus', type: 'select', options: { values: ['active', 'inactive', 'failed', 'completed'] } },
      { name: 'payerId', type: 'text' },
      { name: 'orderId', type: 'text' },
      { name: 'lastTransactionId', type: 'text' },
      { name: 'hasPaymentConsent', type: 'bool' },
      { name: 'nextChargeAt', type: 'date' },
      { name: 'rdpResponse', type: 'json' }
    ],
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: null
  });

  // 3. transactions
  const transactions = new Collection({
    name: 'transactions',
    type: 'base',
    schema: [
      { name: 'memberId', type: 'text' },
      { name: 'memberName', type: 'text' },
      { name: 'amount', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'tierName', type: 'text' },
      { name: 'type', type: 'select', options: { values: ['CIT', 'MIT'] } },
      { name: 'transactionId', type: 'text' },
      { name: 'rdpResponse', type: 'json' }
    ],
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: null,
    deleteRule: null
  });

  // 4. webhook_logs
  const webhookLogs = new Collection({
    name: 'webhook_logs',
    type: 'base',
    schema: [
      { name: 'payload', type: 'json' },
      { name: 'timestamp', type: 'date' }
    ],
    listRule: null,
    viewRule: null,
    createRule: '',
    updateRule: null,
    deleteRule: null
  });

  // 5. assets
  const assets = new Collection({
    name: 'assets',
    type: 'base',
    schema: [
      { name: 'file', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } }
    ],
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: null,
    deleteRule: null
  });

  // Use the universal save method
  db.save(siteConfig);
  db.save(members);
  db.save(transactions);
  db.save(webhookLogs);
  db.save(assets);
}, (db) => {
  // Down migration
  const collections = ['site_config', 'members', 'transactions', 'webhook_logs', 'assets'];
  collections.forEach(name => {
    try {
      const collection = db.findCollectionByNameOrId(name);
      if (collection) db.delete(collection);
    } catch (e) {}
  });
});
