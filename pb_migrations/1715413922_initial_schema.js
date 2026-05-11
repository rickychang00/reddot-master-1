migrate((db) => {
  const collections = [
    {
      name: 'site_config',
      type: 'base',
      schema: [{ name: 'data', type: 'json' }],
      listRule: '', viewRule: '', createRule: null, updateRule: null, deleteRule: null
    },
    {
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
      listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: null
    },
    {
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
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'webhook_logs',
      type: 'base',
      schema: [
        { name: 'payload', type: 'json' },
        { name: 'timestamp', type: 'date' }
      ],
      listRule: null, viewRule: null, createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'assets',
      type: 'base',
      schema: [
        { name: 'file', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } }
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    }
  ];

  for (const config of collections) {
    try {
      // Check if collection already exists
      db.findCollectionByNameOrId(config.name);
    } catch (e) {
      // If it doesn't exist, create it
      const collection = new Collection(config);
      db.save(collection);
    }
  }
}, (db) => {
  // Down migration (optional)
  const names = ['site_config', 'members', 'transactions', 'webhook_logs', 'assets'];
  for (const name of names) {
    try {
      const collection = db.findCollectionByNameOrId(name);
      if (collection) db.delete(collection);
    } catch (e) {}
  }
});