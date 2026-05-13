migrate((app) => {
  // PocketBase v0.23+ requires autodate fields to be explicitly declared.
  // Rules must be set as properties on the Collection object, not in the constructor config.
  const AUTODATE = [
    { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
    { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
  ];

  const collections = [
    {
      name: 'site_config',
      fields: [{ name: 'data', type: 'json' }, ...AUTODATE],
      listRule: '', viewRule: '', createRule: '@request.auth.id != ""', updateRule: '@request.auth.id != ""', deleteRule: null
    },
    {
      name: 'members',
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
        { name: 'rdpResponse', type: 'json' },
        ...AUTODATE
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: '', deleteRule: null
    },
    {
      name: 'transactions',
      fields: [
        { name: 'memberId', type: 'text' },
        { name: 'memberName', type: 'text' },
        { name: 'amount', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'tierName', type: 'text' },
        { name: 'type', type: 'select', maxSelect: 1, values: ['CIT', 'MIT'] },
        { name: 'transactionId', type: 'text' },
        { name: 'rdpResponse', type: 'json' },
        ...AUTODATE
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'webhook_logs',
      fields: [
        { name: 'payload', type: 'json' },
        { name: 'timestamp', type: 'date' },
        ...AUTODATE
      ],
      listRule: null, viewRule: null, createRule: '', updateRule: null, deleteRule: null
    },
    {
      name: 'assets',
      fields: [
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 10485760 },
        ...AUTODATE
      ],
      listRule: '', viewRule: '', createRule: '', updateRule: null, deleteRule: null
    }
  ];

  for (const config of collections) {
    try {
      app.findCollectionByNameOrId(config.name);
    } catch (e) {
      const collection = new Collection({ name: config.name, type: 'base', fields: config.fields });
      collection.listRule   = config.listRule;
      collection.viewRule   = config.viewRule;
      collection.createRule = config.createRule;
      collection.updateRule = config.updateRule;
      collection.deleteRule = config.deleteRule;
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
