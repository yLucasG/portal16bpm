import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    'https://byqvyhfbxvzmvehwarws.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cXZ5aGZieHZ6bXZlaHdhcndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMTI2MjYsImV4cCI6MjA5Njc4ODYyNn0.c8DVYushP8XCTCKeak9FvwBMNhcEtB8RySUDaCpSlhI'
  );
}
