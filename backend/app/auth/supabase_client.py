# backend/app/auth/supabase_client.py

import os
from supabase import Client, create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in environment variables"
    )

supabase_client: Client = create_client(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
)
