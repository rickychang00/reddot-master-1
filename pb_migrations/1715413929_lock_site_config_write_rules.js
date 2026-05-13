migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId('site_config');
    col.createRule = '@request.auth.id != ""';
    col.updateRule = '@request.auth.id != ""';
    app.save(col);
  } catch (_) {}
}, (app) => {
  try {
    const col = app.findCollectionByNameOrId('site_config');
    col.createRule = '';
    col.updateRule = '';
    app.save(col);
  } catch (_) {}
});
