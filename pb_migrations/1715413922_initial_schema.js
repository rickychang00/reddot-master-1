migrate((app) => {
  const collections = [
    {
      name: 'site_config',
      type: 'base',
      fields: [{ name: 'data', type: 'json' }],
      listRule: '', viewRule: '', createRule: '@request.auth.id != ""', updateRule: '@request.auth.id != ""', deleteRule: null
    },
    {
      name: 'members',
      type: 'base',
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'text' },
        { name: 'tierId', type: 'text' },
        { name: 'paymentStatus', type: 'select', maxSelect: 1, values: ['active', 'inactive', 'failed', 'completed'] },
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
      fields: [
        { name: 'memberId', type: 'text' },
        { name: 'memberName', type: 'text' },
        { name: 'amount', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'tierName', type: 'text' },
        { name: 'type', type: 'select', maxSelect: 1, values: ['CIT', 'MIT'] },
        { name: 'transactionId', type: 'text' },
        { name: 'rdpResponse', type: 'json' }
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'webhook_logs',
      type: 'base',
      fields: [
        { name: 'payload', type: 'json' },
        { name: 'timestamp', type: 'date' }
      ],
      listRule: null, viewRule: null, createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'assets',
      type: 'base',
      fields: [
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 5242880 }
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    }
  ];

  for (const config of collections) {
    try {
      app.findCollectionByNameOrId(config.name);
    } catch (e) {
      const collection = new Collection(config);
      app.save(collection);
    }
  }
}, (app) => {
  const names = ['site_config', 'members', 'transactions', 'webhook_logs', 'assets'];
  for (const name of names) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      if (collection) app.delete(collection);
    } catch (e) {}
  }
});
