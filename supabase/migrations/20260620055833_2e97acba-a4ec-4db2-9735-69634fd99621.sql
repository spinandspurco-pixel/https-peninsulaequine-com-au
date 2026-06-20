
-- ============================================================
-- Client Preview Environment — schema + seed
-- Extends the is_demo / preview-select pattern from managed_projects
-- to inquiries, jobs, quotes, client_followups, equus_ridge_interest,
-- employee_tasks, announcements, staff_documents, managed_testimonials,
-- managed_services, managed_events. Then seeds realistic demo rows.
-- Writes remain blocked by block_preview_writes() trigger.
-- ============================================================

-- 1. Add is_demo flag to all operational tables ---------------
ALTER TABLE public.inquiries            ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.jobs                 ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.quotes               ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.client_followups     ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.equus_ridge_interest ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.employee_tasks       ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.announcements        ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.staff_documents      ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.managed_testimonials ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.managed_services     ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.managed_events       ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- 2. Preview SELECT policies (only demo rows visible) ---------
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo inquiries" ON public.inquiries';
  EXECUTE 'CREATE POLICY "Preview reads demo inquiries" ON public.inquiries FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo jobs" ON public.jobs';
  EXECUTE 'CREATE POLICY "Preview reads demo jobs" ON public.jobs FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo quotes" ON public.quotes';
  EXECUTE 'CREATE POLICY "Preview reads demo quotes" ON public.quotes FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo followups" ON public.client_followups';
  EXECUTE 'CREATE POLICY "Preview reads demo followups" ON public.client_followups FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo applications" ON public.equus_ridge_interest';
  EXECUTE 'CREATE POLICY "Preview reads demo applications" ON public.equus_ridge_interest FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo tasks" ON public.employee_tasks';
  EXECUTE 'CREATE POLICY "Preview reads demo tasks" ON public.employee_tasks FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo announcements" ON public.announcements';
  EXECUTE 'CREATE POLICY "Preview reads demo announcements" ON public.announcements FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';

  EXECUTE 'DROP POLICY IF EXISTS "Preview reads demo documents" ON public.staff_documents';
  EXECUTE 'CREATE POLICY "Preview reads demo documents" ON public.staff_documents FOR SELECT TO authenticated USING (has_role(auth.uid(), ''preview''::app_role) AND is_demo = true)';
END $$;

-- 3. Seed demo data ------------------------------------------
-- Wipe any prior demo rows so this is idempotent
DELETE FROM public.client_followups     WHERE is_demo = true;
DELETE FROM public.quote_line_items     WHERE quote_id IN (SELECT id FROM public.quotes WHERE is_demo = true);
DELETE FROM public.quotes               WHERE is_demo = true;
DELETE FROM public.inquiry_nurture      WHERE inquiry_id IN (SELECT id FROM public.inquiries WHERE is_demo = true);
DELETE FROM public.inquiries            WHERE is_demo = true;
DELETE FROM public.job_cost_entries     WHERE job_id IN (SELECT id FROM public.jobs WHERE is_demo = true);
DELETE FROM public.jobs                 WHERE is_demo = true;
DELETE FROM public.equus_ridge_interest WHERE is_demo = true;
DELETE FROM public.employee_tasks       WHERE is_demo = true;
DELETE FROM public.announcements        WHERE is_demo = true;
DELETE FROM public.staff_documents      WHERE is_demo = true;
DELETE FROM public.managed_testimonials WHERE is_demo = true;

-- 3a. Inquiries — full pipeline spread, Mornington Peninsula realism
INSERT INTO public.inquiries (name, email, phone, services, project_vision, budget_range, preferred_start, experience_level, status, deal_stage, deal_value, probability, lead_tier, lead_tags, is_demo, created_at) VALUES
('Eleanor Whitcombe',  'eleanor.w@example.com',     '0419 224 118', ARRAY['arena-construction','fencing'],                      'Covered dressage arena with shedrow and 4-stable barn, Red Hill ridge site.',                          '250k-plus',  'Q2 2026',  'experienced',   'new',         'new',               420000, 30, 'premium',  ARRAY['construction','priority:arenas'],            true, now() - interval '2 days'),
('James Holloway',     'j.holloway@example.com',    '0408 771 902', ARRAY['full-facility'],                                       '12-acre property, full build: 6 stables, lunge ring, hay storage, manager cottage.',                  '250k-plus',  'Q1 2027',  'professional',  'qualified',   'qualified',         780000, 55, 'premium',  ARRAY['full-build','pro-client'],                   true, now() - interval '6 days'),
('Margaux Devereux',   'margaux.d@example.com',     '0432 559 081', ARRAY['arena-construction'],                                  'Replace failing surface, add geotextile base. Existing arena 60x20.',                                  '50k-100k',   'asap',     'experienced',   'qualified',   'scope_review',       82000, 60, 'high',     ARRAY['construction'],                              true, now() - interval '11 days'),
('Hugo Pemberton',     'hugo.p@example.com',        '0414 308 442', ARRAY['barn-construction','infrastructure'],                  'American barn, 8 boxes, vet bay, wash bay. Power + water already on site.',                            '100k-250k',  'Q3 2026',  'experienced',   'in-progress', 'quote_in_progress', 215000, 65, 'premium',  ARRAY['construction','site-work'],                  true, now() - interval '18 days'),
('Annika Sørensen',    'annika.s@example.com',      '0457 612 339', ARRAY['arena-construction','renovations'],                    'Renovate existing covered arena. Kickboards, irrigation, lighting upgrade.',                            '50k-100k',   'Q2 2026',  'professional',  'in-progress', 'quote_sent',         96500, 75, 'high',     ARRAY['renovation','pro-client'],                   true, now() - interval '24 days'),
('Roderick Ashworth',  'r.ashworth@example.com',    '0402 891 776', ARRAY['fencing','round-pens'],                                'Post-and-rail boundary 1.2km plus two round pens. Main Ridge property.',                                '15k-50k',    'asap',     'intermediate',  'in-progress', 'quote_sent',         44800, 40, 'standard', ARRAY['site-work'],                                 true, now() - interval '31 days'),
('Catriona Mackelvie', 'catriona.m@example.com',    '0421 504 263', ARRAY['full-facility'],                                       'New build, ground-up. 25 acres, dual-discipline (jumping + dressage).',                                 '250k-plus',  'Q4 2026',  'professional',  'completed',   'won',              1140000, 100,'premium',  ARRAY['full-build','pro-client'],                   true, now() - interval '47 days'),
('Tobias Lindqvist',   'tobias.l@example.com',      '0438 117 925', ARRAY['arena-construction'],                                  'Indoor arena, 70x30, structural engineering already drafted.',                                          '100k-250k',  'Q2 2026',  'experienced',   'archived',    'closed',            175000, 0,  'high',     ARRAY['construction'],                              true, now() - interval '62 days');

-- 3b. Jobs — active build pipeline with realistic margins
INSERT INTO public.jobs (job_name, client_name, location, status, revenue, materials_cost, labour_cost, other_costs, estimated_cost, actual_cost, gross_profit, margin_percentage, profit_status, notes, is_demo, created_at) VALUES
('Whitcombe — Covered Arena & Barn',  'Eleanor Whitcombe',   'Red Hill',         'active',   420000, 168000, 92000, 14000, 270000, 274000, 146000, 34.76, 'on_track', 'Slab pour booked w/c 4 Aug. Steel order confirmed.',                              true, now() - interval '14 days'),
('Holloway — Full Facility Build',    'James Holloway',      'Flinders',         'active',   780000, 312000,180000, 28000, 510000, 520000, 260000, 33.33, 'on_track', 'Phase 1 (groundworks) complete. Phase 2 framing in progress.',                    true, now() - interval '38 days'),
('Pemberton — American Barn',         'Hugo Pemberton',      'Main Ridge',       'active',   215000,  92000, 48000,  8500, 140000, 148500,  66500, 30.93, 'on_track', 'Awaiting council sign-off on stormwater. Otherwise on schedule.',                 true, now() - interval '9 days'),
('Devereux — Arena Surface Renewal',  'Margaux Devereux',    'Merricks North',   'active',    82000,  31000, 18000,  3200,  50000,  52200,  29800, 36.34, 'on_track', 'Base prep underway. Surface delivery 2 wks.',                                     true, now() - interval '4 days'),
('Sørensen — Arena Renovation',       'Annika Sørensen',     'Balnarring',       'active',    96500,  38000, 22000,  4000,  62000,  64000,  32500, 33.68, 'on_track', 'Kickboards complete. Lighting install scheduled.',                                true, now() - interval '21 days'),
('Mackelvie — Estate (Phase 1)',      'Catriona Mackelvie',  'Arthurs Seat',     'active',   480000, 196000,112000, 18000, 320000, 326000, 154000, 32.08, 'on_track', 'Major earthworks 70% complete.',                                                  true, now() - interval '52 days'),
('Roberts — Round Pens & Fencing',    'David Roberts',       'Shoreham',         'completed',47200,  19000, 11500,  1800,  31000,  32300,  14900, 31.57, 'on_track', 'Handover complete. Final invoice paid.',                                          true, now() - interval '95 days');

-- 3c. Quotes
INSERT INTO public.quotes (quote_number, client_name, client_email, project_type, location, scope_summary, subtotal, gst, total, status, expiry_date, is_demo, sent_at) VALUES
('PE-Q-D001', 'Hugo Pemberton',     'hugo.p@example.com',    'Barn + Infrastructure',  'Main Ridge',     '8-box American barn, vet & wash bay, perimeter site drainage.', 195454,  19545, 215000, 'sent',     CURRENT_DATE + 14, true, now() - interval '4 days'),
('PE-Q-D002', 'Annika Sørensen',    'annika.s@example.com',  'Arena Renovation',        'Balnarring',     'Kickboard replacement, surface top-up, LED lighting upgrade.',   87727,   8773,  96500, 'sent',     CURRENT_DATE + 7,  true, now() - interval '8 days'),
('PE-Q-D003', 'Roderick Ashworth',  'r.ashworth@example.com','Fencing + Round Pens',    'Main Ridge',     '1.2km post-and-rail, two round pens with rubber sand mix.',      40727,   4073,  44800, 'sent',     CURRENT_DATE + 10, true, now() - interval '12 days'),
('PE-Q-D004', 'Margaux Devereux',   'margaux.d@example.com', 'Arena Surface Renewal',   'Merricks North', 'Geotextile base, fibre-blend surface, drainage correction.',     74545,   7455,  82000, 'draft',    CURRENT_DATE + 21, true, NULL);

-- 3d. Client followups
INSERT INTO public.client_followups (client_name, client_email, followup_type, due_date, status, notes, deal_stage, quote_status, deal_value, project_name, is_demo) VALUES
('Hugo Pemberton',    'hugo.p@example.com',    'call',      CURRENT_DATE - 1, 'overdue',  'Quote sent 4 days ago — viewed, no reply. Chase.',                  'quote_sent',     'sent',     215000, 'Pemberton Barn',          true),
('Annika Sørensen',   'annika.s@example.com',  'call',      CURRENT_DATE + 2, 'pending',  'Day-5 follow up. Confirm timeline.',                                 'quote_sent',     'sent',      96500, 'Sørensen Reno',          true),
('Roderick Ashworth', 'r.ashworth@example.com','email',     CURRENT_DATE + 5, 'pending',  'Day-10 final check before quote expires.',                          'quote_sent',     'sent',      44800, 'Ashworth Fencing',       true),
('James Holloway',    'j.holloway@example.com','meeting',   CURRENT_DATE + 3, 'pending',  'Site walk-through, Phase 2 sign-off.',                              'in_progress',    'accepted', 780000, 'Holloway Facility',      true),
('David Roberts',     'droberts@example.com',  'two_week',  CURRENT_DATE - 4, 'completed','Two-week post-handover check. All good.',                            'won',            'accepted',  47200, 'Roberts Round Pens',     true);

-- 3e. Applications (Equus Ridge interest)
INSERT INTO public.equus_ridge_interest (name, email, phone, interest_type, message, source_page, is_demo) VALUES
('Isabella Carrington', 'isabella.c@example.com', '0418 339 552', 'apply-to-build',  'Looking to build a 6-stable facility in Main Ridge. Approx 8 acres, existing access. Budget around $400k.',                                 'apply-to-build',  true),
('Marcus Whitley',      'marcus.w@example.com',   '0432 887 116', 'apply-to-build',  'Full estate masterplan, 22 acres in Red Hill South. Looking for end-to-end service.',                                                       'apply-to-build',  true),
('Elena Brookbank',     'elena.b@example.com',    '0407 224 880', 'site-assessment', 'Existing arena needs full assessment. Drainage issues + surface failing.',                                                                  'apply-to-build',  true),
('Sebastian Quayle',    'seb.q@example.com',      '0421 556 730', 'apply-to-build',  'Considering relocating from Sydney. Need land + build advice.',                                                                            'apply-to-build',  true),
('Penelope Hartwig',    'p.hartwig@example.com',  '0438 902 117', 'general',         'Interested in lessons + future build conversation.',                                                                                        'apply-to-build',  true),
('Oliver Brennan',      'o.brennan@example.com',  '0414 660 285', 'apply-to-build',  'Replacing aging round pens and adding new shedrow. Mid-range budget.',                                                                     'apply-to-build',  true);

-- 3f. Employee tasks
INSERT INTO public.employee_tasks (title, description, status, scheduled_date, scheduled_time, priority, is_demo) VALUES
('Site walk — Whitcombe',          'Confirm slab levels with engineer before pour.',                       'pending',     CURRENT_DATE,     '08:30', 'high',   true),
('Order steel — Pemberton Barn',   'Confirm member schedule with fabricator, submit PO.',                  'pending',     CURRENT_DATE,     '11:00', 'urgent', true),
('Surface delivery — Devereux',    'Coordinate delivery, gate access, machine on-site.',                   'in-progress', CURRENT_DATE + 1, '07:00', 'normal', true),
('Daily report — Holloway Phase 2','Frame progress + photo log.',                                          'pending',     CURRENT_DATE,     '16:00', 'normal', true),
('Council follow-up — Pemberton',  'Stormwater approval status from Mornington Peninsula Shire.',          'pending',     CURRENT_DATE + 2, '10:00', 'high',   true);

-- 3g. Announcements
INSERT INTO public.announcements (title, content, priority, active, is_demo) VALUES
('Weather hold — Tuesday', 'Forecast 35mm overnight. All non-critical earthworks paused. Whitcombe slab postponed to Thursday.', 'important', true, true),
('New PPE rollout',        'Updated hi-vis spec arrives Monday. Old kit returned for laundering.',                                'normal',    true, true),
('Q3 site review',         'Quarterly site review week of 18 Aug. All foremen submit progress packs by Friday.',                  'normal',    true, true);

-- 3h. Staff documents (placeholder user_id — read-only for preview)
INSERT INTO public.staff_documents (user_id, document_type, title, form_data, status, is_demo, submitted_at) VALUES
('00000000-0000-0000-0000-000000000001', 'swms',         'SWMS — Slab Pour, Whitcombe Site',          '{"hazards":["Falls from height","Concrete burn","Heavy plant"],"controls":["Edge protection","PPE","Spotter for trucks"]}'::jsonb,             'submitted', true, now() - interval '2 days'),
('00000000-0000-0000-0000-000000000001', 'daily_report', 'Daily Report — Holloway Phase 2, 16 Jul',   '{"crew":4,"hours":34,"progress":"Framing 60% complete","issues":"None"}'::jsonb,                                                                'submitted', true, now() - interval '1 day'),
('00000000-0000-0000-0000-000000000001', 'daily_report', 'Daily Report — Pemberton, 16 Jul',          '{"crew":3,"hours":24,"progress":"Footings excavated, awaiting inspection","issues":"Council inspector rescheduled"}'::jsonb,                'submitted', true, now() - interval '1 day'),
('00000000-0000-0000-0000-000000000001', 'swms',         'SWMS — Roof Sheeting, Pemberton Barn',      '{"hazards":["Falls from height","Sheet edges"],"controls":["Harness + line","Two-person lift"]}'::jsonb,                                       'draft',     true, NULL),
('00000000-0000-0000-0000-000000000001', 'incident',     'Near miss — Sørensen site, 14 Jul',         '{"description":"Loose kickboard during install, no injury","action":"Toolbox talk, fasteners checked"}'::jsonb,                                'submitted', true, now() - interval '3 days');

-- 3i. Testimonials (demo-flagged so HQ can distinguish from real)
INSERT INTO public.managed_testimonials (client_name, client_role, quote, rating, sort_order, active, pinned, service_tags, is_demo) VALUES
('Eleanor W.',      'Owner, Red Hill',       'They resolved drainage problems three other builders walked away from. The arena holds through any weather now.',                                              5, 1, true, true,  ARRAY['arena-construction'],         true),
('James H.',        'Owner, Flinders',       'End-to-end. Started with a paddock and ended with a working facility. Not a single chase-up email from our side.',                                              5, 2, true, false, ARRAY['full-facility'],              true),
('Catriona M.',     'Owner, Arthurs Seat',   'Phase 1 came in on budget and a week early. That tells you everything.',                                                                                       5, 3, true, false, ARRAY['arena-construction','fencing'],true);

-- 4. Mark existing seeded content as demo where appropriate ---
-- (managed_projects already uses is_demo — leave the existing ones)
-- Touch nothing real; only flag rows that obviously belong to seed sets.
