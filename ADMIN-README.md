# Juta River Admin Dashboard

Open `/admin/` to add, edit and delete events, upload posters, and set the exact event date/time.

This first version uses browser localStorage, so it works with the current static GitHub Pages setup. It is a prototype: changes are saved only in the browser/device where the dashboard is used.

For the real launch, connect this dashboard to a central backend such as Supabase so the owner can manage events from any device and every visitor sees the same events. The ticketing, QR generation and scanner system can then use the same backend.
