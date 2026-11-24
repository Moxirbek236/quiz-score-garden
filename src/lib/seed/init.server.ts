import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ensureSeeded } from "./sync.server";

/**
 * Modul yuklanishi bilan (server ishga tushganda: har yangi deploy / push'dan keyin) eski test
 * ma'lumotlarini tozalaydi va seed savollarini bazaga sinxronlaydi. Xato bo'lsa server yiqilmaydi:
 * `getDb()` birinchi so'rovda sinxronni qayta urinadi.
 */
void ensureSeeded(supabaseAdmin);
