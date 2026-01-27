-- pgTAP test skeleton for RBAC
BEGIN;
SELECT plan(3);

-- Test 1: Check if profiles table exists
SELECT has_table('public', 'profiles', 'Profiles table should exist');

-- Test 2: Check if authorize function exists
SELECT has_function('public', 'authorize', ARRAY['text'], 'Authorize function should exist');

-- Test 3: Check initial seed data (super_admin role)
SELECT results_eq(
    'SELECT name FROM public.roles WHERE name = ''super_admin''',
    'ARRAY[''super_admin'']::text[]',
    'Super admin role should be seeded'
);

SELECT * FROM finish();
ROLLBACK;
