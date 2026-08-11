# cleanup-car-storage

Removes `car-images` objects and their `car_images` rows for sold or archived cars after 30 days. It never touches active, pending, draft, or rejected listings.

The function requires the `x-cleanup-secret` header to equal the trusted Edge Function secret `CLEANUP_CRON_SECRET`. Configure that secret with the Supabase CLI or Dashboard; never commit it. Schedule invocation through Supabase Cron using Vault to store the same secret.
