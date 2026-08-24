-- Payout account extensions (V0.2)

-- method: eni_pagamentos | registered_account | prepaid_card
ALTER TABLE payout_registrations ADD COLUMN method TEXT;
ALTER TABLE payout_registrations ADD COLUMN grantor_provider_id TEXT;
ALTER TABLE payout_registrations ADD COLUMN delivery_email TEXT;
ALTER TABLE payout_registrations ADD COLUMN notes TEXT;

-- Operator seed (logical; may be applied as upsert in app code)
-- github_user_id=121771985 method=eni_pagamentos status=active
-- widget_url=https://calhegasmorais.pt/pagamentos
