/**
 * Eski test ma'lumotlarini tozalaydi va seed savollarini bazaga bittalab tekshirib qo'shadi.
 * Ishga tushirish: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run db:sync
 */
import { supabaseAdmin } from "../src/integrations/supabase/client.server";
import { runSync } from "../src/lib/seed/sync.server";

const stats = await runSync(supabaseAdmin);
console.log("Sinxronlandi:", stats);
