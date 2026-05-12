migrate((app) => {
  // Skip if any users already exist (don't overwrite real credentials)
  const existing = app.findAllRecords("users");
  if (existing && existing.length > 0) return;

  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection, {
    email: "admin@admin.com",
    emailVisibility: true,
    verified: true,
  });
  record.setPassword("Admin1234!");
  app.save(record);
}, (app) => {
  try {
    const record = app.findFirstRecordByFilter("users", 'email = "admin@admin.com"');
    app.delete(record);
  } catch (_) {}
});
