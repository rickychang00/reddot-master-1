migrate((db) => {
  try {
    const collection = db.findCollectionByNameOrId('site_config');
    collection.createRule = '';
    collection.updateRule = '';
    db.save(collection);
  } catch (e) {
    // will be created with open rules by initial migration on fresh deployments
  }
}, (db) => {
  try {
    const collection = db.findCollectionByNameOrId('site_config');
    collection.createRule = '@request.auth.id != ""';
    collection.updateRule = '@request.auth.id != ""';
    db.save(collection);
  } catch (e) {}
});
