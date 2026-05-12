migrate((db) => {
  try {
    const collection = db.findCollectionByNameOrId('site_config');
    collection.createRule = '@request.auth.id != ""';
    collection.updateRule = '@request.auth.id != ""';
    db.save(collection);
  } catch (e) {
    // collection not found — initial migration will apply correct rules
  }
}, (db) => {
  try {
    const collection = db.findCollectionByNameOrId('site_config');
    collection.createRule = null;
    collection.updateRule = null;
    db.save(collection);
  } catch (e) {}
});
