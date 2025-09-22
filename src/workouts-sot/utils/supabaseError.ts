// v111.9-feel-stored-in-notes — central error formatter
export function buildSupabaseErrorMessage(err: unknown, context?: string): string {
  try {
    // Supabase errors (PostgREST / RPC / Postgres) often come as objects with these fields
    const e = err as any;

    const parts: string[] = [];
    if (context) parts.push(`[${context}]`);

    if (e?.message) {
      let message = e.message;
      
      // Special handling for common auth/ownership errors
      if (message.includes('Unauthorized to modify this workout exercise')) {
        message = 'WORKOUT NOT FOUND: Either no active workout exists, or this workout doesn\'t belong to you. Please start a new workout first.';
      }
      
      parts.push(message);
    }
    
    if (e?.details) parts.push(`details: ${e.details}`);
    if (e?.hint) parts.push(`hint: ${e.hint}`);
    if (e?.code) parts.push(`code: ${e.code}`);
    if (e?.status) parts.push(`status: ${e.status}`);

    // Postgres exceptions sometimes bubble in e.error?.message or nested objects
    if (e?.error?.message && !parts.join(' ').includes(e.error.message)) {
      parts.push(`error: ${e.error.message}`);
    }

    // Fallback: serialize unknown object
    if (parts.length === 0) {
      parts.push(typeof err === 'string' ? err : JSON.stringify(err));
    }

    return parts.join(' | ');
  } catch {
    return typeof err === 'string' ? err : 'Unknown error';
  }
}