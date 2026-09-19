-- =============================================================================
-- Migration: 006_seed_data.sql
-- Purpose:   Populate the database with development seed data.
--            NOT intended for production — run only in local / staging.
-- Source of truth: task-breakdown.md § 2.9
--
-- Seeds:
--   1. 6 categories (4 builder slots + 2 regular)
--   2. 3–5 sample products per category (24 total)
--
-- Note on the Admin user:
--   The admin account is NOT created here — it requires a Supabase Auth
--   signup first (which generates the auth.users row + triggers
--   handle_new_user → profiles). After signup, the role is manually set:
--     UPDATE public.profiles SET role = 'admin' WHERE id = '<admin-uuid>';
--   See the comment block at the end of this file.
--
-- Images:
--   All image_url / images[] point to real files in the product-images
--   Storage bucket. One image per category is reused across its products
--   until per-product photos are uploaded.
--
-- Depends on: 001–005 (all tables, triggers, functions, RLS, storage)
-- =============================================================================

-- =============================================================================
-- 1. Categories — task-breakdown § 2.9
-- =============================================================================
insert into public.categories (name, slug, description, is_builder_slot, display_order, icon_name) values
  ('Screens',      'screens',      'Monitors and displays for every setup — from ultrawide productivity panels to high-refresh gaming screens.',
    true,  1, 'monitor'),
  ('Keyboards',    'keyboards',    'Mechanical and membrane keyboards — full-size, TKL, and 75% layouts with a range of switch types.',
    true,  2, 'keyboard'),
  ('Mice',         'mice',         'Ergonomic and gaming mice with precision sensors and customizable buttons.',
    true,  3, 'mouse'),
  ('Lighting',     'lighting',     'Desk lamps, LED strips, and monitor light bars to reduce eye strain and set the mood.',
    true,  4, 'lamp-desk'),
  ('Desks',        'desks',        'Standing desks, sit-stand frames, and classic workstation desks built for long sessions.',
    false, 5, 'table'),
  ('Accessories',  'accessories',  'Desk mats, monitor arms, cable management, headphone stands, and everything else your setup needs.',
    false, 6, 'box');

-- =============================================================================
-- 2. Products — task-breakdown § 2.9
-- =============================================================================

-- ── Screens ──────────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'ProVision 27" 4K IPS',
  'provision-27-4k-ips',
  'A 27-inch 4K IPS monitor with factory-calibrated colours, USB-C Power Delivery, and a fully adjustable ergonomic stand. Perfect for developers who need crisp text and accurate colour.',
  12499.00,
  (select id from public.categories where slug = 'screens'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg'],
  '{"panel":"IPS","resolution":"3840x2160","refresh_rate":"60 Hz","ports":"HDMI 2.0, DP 1.4, USB-C (90W PD)","size":"27 inch"}'::jsonb
),
(
  'CurveMax 34" Ultrawide',
  'curvemax-34-ultrawide',
  'A 34-inch UWQHD curved monitor built for multitasking — replace your dual-monitor setup with a single immersive panel. 1500R curvature, 100 Hz, and built-in KVM.',
  18999.00,
  (select id from public.categories where slug = 'screens'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg'],
  '{"panel":"VA","resolution":"3440x1440","refresh_rate":"100 Hz","curvature":"1500R","size":"34 inch"}'::jsonb
),
(
  'SwiftPanel 27" 165 Hz',
  'swiftpanel-27-165hz',
  'A fast 27-inch QHD gaming monitor with a 165 Hz refresh rate, 1 ms response time, and G-Sync / FreeSync support. Great for competitive gamers who also code.',
  9499.00,
  (select id from public.categories where slug = 'screens'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg'],
  '{"panel":"IPS","resolution":"2560x1440","refresh_rate":"165 Hz","response_time":"1 ms","size":"27 inch"}'::jsonb
),
(
  'CompactView 24" FHD',
  'compactview-24-fhd',
  'A no-nonsense 24-inch Full HD IPS panel — affordable, colour-accurate, and VESA-mountable. Ideal as a secondary display or a budget primary.',
  4999.00,
  (select id from public.categories where slug = 'screens'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/monitor.jpg'],
  '{"panel":"IPS","resolution":"1920x1080","refresh_rate":"75 Hz","size":"24 inch"}'::jsonb
);

-- ── Keyboards ────────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'TypeForce 75% Mechanical',
  'typeforce-75-mechanical',
  'A compact 75% layout mechanical keyboard with hot-swappable Cherry MX Brown switches, PBT keycaps, and per-key RGB. Gasket-mounted for a softer, thockier feel.',
  3299.00,
  (select id from public.categories where slug = 'keyboards'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg'],
  '{"layout":"75%","switch":"Cherry MX Brown","keycaps":"PBT","backlight":"Per-key RGB","connectivity":"USB-C / Bluetooth"}'::jsonb
),
(
  'SilentBoard TKL',
  'silentboard-tkl',
  'A tenkeyless membrane keyboard designed for quiet offices — soft, cushioned key travel and a built-in wrist rest. Plug-and-play USB.',
  1199.00,
  (select id from public.categories where slug = 'keyboards'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg'],
  '{"layout":"TKL","switch":"Membrane (silent)","keycaps":"ABS","backlight":"White LED","connectivity":"USB-A"}'::jsonb
),
(
  'DevPro Full-Size',
  'devpro-full-size',
  'A full-size mechanical keyboard with Cherry MX Red linear switches, dedicated media keys, and a USB passthrough. Built for developers who need the numpad.',
  2799.00,
  (select id from public.categories where slug = 'keyboards'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg'],
  '{"layout":"Full-size (104 keys)","switch":"Cherry MX Red","keycaps":"PBT","backlight":"RGB","connectivity":"USB-C"}'::jsonb
),
(
  'MiniClack 60%',
  'miniclack-60',
  'An ultra-compact 60% mechanical keyboard with Gateron Yellow switches and a programmable layer system. Carry it in your backpack.',
  1899.00,
  (select id from public.categories where slug = 'keyboards'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/keboard.jpg'],
  '{"layout":"60%","switch":"Gateron Yellow","keycaps":"PBT","backlight":"RGB","connectivity":"USB-C / Bluetooth"}'::jsonb
);

-- ── Mice ─────────────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'PrecisionGlide Wireless',
  'precisionglide-wireless',
  'A lightweight wireless mouse with a 26K DPI optical sensor, 70-hour battery, and a glass-compatible skate system. Equally at home on a mousepad or a wooden desk.',
  2499.00,
  (select id from public.categories where slug = 'mice'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg'],
  '{"sensor":"26000 DPI Optical","weight":"68 g","battery":"70 hours","connectivity":"2.4 GHz / Bluetooth","buttons":"6"}'::jsonb
),
(
  'ErgoRest Vertical',
  'ergorest-vertical',
  'A vertical ergonomic mouse that keeps your wrist in a natural handshake position. Wired, 4000 DPI, with a thumb rest and forward/back buttons.',
  899.00,
  (select id from public.categories where slug = 'mice'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg'],
  '{"sensor":"4000 DPI Optical","weight":"120 g","connectivity":"USB-A (wired)","buttons":"6","orientation":"Vertical"}'::jsonb
),
(
  'SwiftStrike Pro',
  'swiftstrike-pro',
  'A tournament-grade wired gaming mouse — 8K Hz polling, 30K DPI, and only 58 g. Built for FPS players who need every millisecond.',
  3199.00,
  (select id from public.categories where slug = 'mice'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/mouse.jpg'],
  '{"sensor":"30000 DPI Optical","polling_rate":"8000 Hz","weight":"58 g","connectivity":"USB-C (wired)","buttons":"5"}'::jsonb
);

-- ── Lighting ─────────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'GlowBar Monitor Light',
  'glowbar-monitor-light',
  'A screen-mounted LED light bar that illuminates your desk without adding glare to the monitor. Adjustable colour temperature (2700K–6500K) and brightness via touch controls.',
  1599.00,
  (select id from public.categories where slug = 'lighting'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg'],
  '{"type":"Monitor Light Bar","color_temp":"2700K–6500K","power":"USB-C","length":"45 cm"}'::jsonb
),
(
  'AmbientStrip RGB LED',
  'ambientstrip-rgb-led',
  'A 2-metre USB-powered RGB LED strip with adhesive backing. 16 million colours, music-reactive mode, and app control via Bluetooth.',
  699.00,
  (select id from public.categories where slug = 'lighting'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg'],
  '{"type":"LED Strip","length":"2 m","colors":"16M RGB","power":"USB-A","control":"Bluetooth App"}'::jsonb
),
(
  'DeskLamp Architect',
  'desklamp-architect',
  'A clamp-mounted architect desk lamp with a long adjustable arm, flicker-free LED panel, and five brightness levels. Frees up desk space compared to a base-mounted lamp.',
  1299.00,
  (select id from public.categories where slug = 'lighting'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg'],
  '{"type":"Desk Lamp (Clamp)","color_temp":"3000K–5000K","brightness_levels":5,"power":"AC adapter"}'::jsonb
),
(
  'NightOwl Bias Light',
  'nightowl-bias-light',
  'A warm-white LED strip designed to sit behind your monitor, reducing eye strain during late-night coding sessions. Plug-and-play USB with dimmer wheel.',
  399.00,
  (select id from public.categories where slug = 'lighting'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/lighting.jpg'],
  '{"type":"Bias Light","color_temp":"3000K (warm white)","length":"50 cm","power":"USB-A"}'::jsonb
);

-- ── Desks ────────────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'StandUp Pro Electric',
  'standup-pro-electric',
  'A dual-motor electric standing desk with memory presets, anti-collision detection, and a cable management tray. Height range covers sitting through standing for most people.',
  11999.00,
  (select id from public.categories where slug = 'desks'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg'],
  '{"type":"Electric Sit-Stand","width":"140 cm","depth":"70 cm","height_range":"62–127 cm","max_load":"120 kg","motors":"Dual"}'::jsonb
),
(
  'ClassicDesk 120',
  'classicdesk-120',
  'A sturdy 120 cm fixed-height desk with a minimalist steel frame and a scratch-resistant melamine top. Simple, affordable, and rock-solid.',
  3499.00,
  (select id from public.categories where slug = 'desks'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg'],
  '{"type":"Fixed Height","width":"120 cm","depth":"60 cm","height":"75 cm","material":"Steel frame + Melamine top"}'::jsonb
),
(
  'CornerMax L-Shape',
  'cornermax-l-shape',
  'An L-shaped corner desk that maximises workspace in smaller rooms. Reversible layout (left or right return), built-in cable grommets, and a monitor shelf.',
  5999.00,
  (select id from public.categories where slug = 'desks'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/desk.jpg'],
  '{"type":"L-Shape Corner","width":"160 cm + 120 cm","depth":"60 cm","height":"75 cm","material":"Steel frame + MDF top"}'::jsonb
);

-- ── Accessories ──────────────────────────────────────────────────────────
insert into public.products (name, slug, description, price, category_id, image_url, images, specs) values
(
  'DeskPad XL Felt',
  'deskpad-xl-felt',
  'A 90×40 cm premium felt desk mat — soft, quiet, and machine-washable. Protects the desk surface and gives the mouse a consistent glide.',
  599.00,
  (select id from public.categories where slug = 'accessories'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg'],
  '{"material":"Recycled Felt","size":"90 × 40 cm","thickness":"3 mm","washable":true}'::jsonb
),
(
  'ArmFlex Dual Monitor Arm',
  'armflex-dual-monitor-arm',
  'A gas-spring dual monitor arm that clamps to the desk edge. Holds two screens up to 32 inches each, with full tilt/swivel/rotate and integrated cable routing.',
  2999.00,
  (select id from public.categories where slug = 'accessories'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg'],
  '{"type":"Gas-Spring Dual Arm","max_screen":"32 inch","max_weight":"9 kg per arm","mount":"Desk Clamp / Grommet","vesa":"75×75 / 100×100"}'::jsonb
),
(
  'CableKit Under-Desk Tray',
  'cablekit-under-desk-tray',
  'A steel mesh cable management tray that mounts under the desk with screws or adhesive. Keeps power strips and cable clutter out of sight.',
  349.00,
  (select id from public.categories where slug = 'accessories'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg'],
  '{"material":"Steel Mesh","length":"40 cm","width":"16 cm","mount":"Screws / Adhesive"}'::jsonb
),
(
  'HeadRest Pro Stand',
  'headrest-pro-stand',
  'An aluminium headphone stand with a weighted non-slip base and a built-in USB-A/USB-C charging hub. Looks clean, works as a charger.',
  799.00,
  (select id from public.categories where slug = 'accessories'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg'],
  '{"material":"Aluminium","hub":"2× USB-A, 1× USB-C","base":"Weighted non-slip"}'::jsonb
),
(
  'WristCloud Keyboard Rest',
  'wristcloud-keyboard-rest',
  'A memory-foam wrist rest with a cooling gel layer and a non-slip rubber base. Sized for full-size keyboards (44 cm).',
  449.00,
  (select id from public.categories where slug = 'accessories'),
  'https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg',
  array['https://qcaqapriyssybmdotxdo.supabase.co/storage/v1/object/public/product-images/holder.jpg'],
  '{"material":"Memory Foam + Cooling Gel","length":"44 cm","width":"8 cm","cover":"Washable Lycra"}'::jsonb
);

-- =============================================================================
-- Admin User — task-breakdown § 2.9
-- =============================================================================
-- The admin account CANNOT be seeded via SQL alone because auth.users is
-- managed by Supabase Auth (passwords are hashed by GoTrue, sessions are
-- created, etc.). The process is:
--
--   1. Sign up through the app's /register page (or use the Supabase
--      Dashboard → Authentication → Add User) with the email/password
--      you want for the admin account.
--
--   2. The on_auth_user_created trigger automatically creates the
--      matching profiles row with role = 'customer'.
--
--   3. Promote that profile to admin with a single SQL statement
--      (run in the Supabase SQL Editor → New Query):
--
--        update public.profiles
--           set role = 'admin'
--         where id = (
--           select id from auth.users
--           where email = 'admin@devspace.com'   -- ← your admin email
--         );
--
--   4. Done. The next request with that user's session will see
--      role = 'admin' and pass the is_admin() check in every RLS policy.
--
-- =============================================================================

-- =============================================================================
-- End of 006_seed_data.sql
-- =============================================================================