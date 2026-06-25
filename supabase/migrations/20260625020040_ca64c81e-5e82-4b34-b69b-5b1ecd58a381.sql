DELETE FROM public.hq_graph_edges
WHERE (from_type = 'media' AND from_id IN (SELECT id FROM public.media_assets WHERE title = 'mr-demo-unassigned-main-ridge.jpg' AND is_demo = true))
   OR (to_type = 'media' AND to_id IN (SELECT id FROM public.media_assets WHERE title = 'mr-demo-unassigned-main-ridge.jpg' AND is_demo = true));

DELETE FROM public.media_assets
WHERE title = 'mr-demo-unassigned-main-ridge.jpg' AND is_demo = true;