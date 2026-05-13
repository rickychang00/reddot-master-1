migrate((app) => {
  try {
    const existing = app.findAllRecords("_superusers");
    if (existing && existing.length > 0) return;

    const superusers = app.findCollectionByNameOrId("_superusers");
    const record = new Record(superusers, {
      email: "superadmin@admin.com",
      password: "SuperAdmin1234!",
      passwordConfirm: "SuperAdmin1234!",
    });
    app.save(record);
  } catch (_) {
    // If seeding fails, create manually via:
    // docker exec <container> /usr/local/bin/pocketbase superuser create email password --dir=/pb_data
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByFilter("_superusers", 'email = "superadmin@admin.com"');
    app.delete(record);
  } catch (_) {}
});
