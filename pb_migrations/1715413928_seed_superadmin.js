migrate((app) => {
  try {
    // Skip if a superadmin already exists
    const existing = app.findAllRecords("_superusers");
    if (existing && existing.length > 0) return;

    const superusers = app.findCollectionByNameOrId("_superusers");
    const record = new Record(superusers, { email: "superadmin@admin.com" });
    record.setPassword("SuperAdmin1234!");
    app.save(record);
  } catch (_) {
    // Older PocketBase versions manage superadmins differently —
    // create one manually via: docker exec -it <container> /pocketbase superuser create email password
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByFilter("_superusers", 'email = "superadmin@admin.com"');
    app.delete(record);
  } catch (_) {}
});
