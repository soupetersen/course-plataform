-- This migration removes payment gateway fee settings from platform_settings
-- and ensures courses can be free (price = 0)
-- Remove gateway fee settings that should not be configurable
DELETE FROM "platform_settings"
WHERE "key" = 'STRIPE_FEE_PERCENTAGE';
-- Add new setting for balance hold period
INSERT INTO "platform_settings" (
    "id",
    "key",
    "value",
    "type",
    "description",
    "updatedBy",
    "createdAt",
    "updatedAt"
  )
SELECT 'balance_hold_days_setting',
  'BALANCE_HOLD_DAYS',
  '30',
  'NUMBER',
  'Dias para reter saldo do instrutor (proteção contra chargeback)',
  "id",
  NOW(),
  NOW()
FROM "users"
WHERE "role" = 'ADMIN'
LIMIT 1;
-- Update platform fee description to be clearer
UPDATE "platform_settings"
SET "description" = 'Porcentagem da taxa da plataforma sobre vendas de cursos (após taxas do gateway)'
WHERE "key" = 'PLATFORM_FEE_PERCENTAGE';
-- No changes needed for Course.price as it already allows 0 values
-- No changes needed for PayoutRequest as unique constraint already exists