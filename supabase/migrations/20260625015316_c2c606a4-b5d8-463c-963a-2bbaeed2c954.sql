
CREATE OR REPLACE FUNCTION public._hq_graph_eval_media_row(_asset public.media_assets)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj record;
  filename_haystack text;
  tag_slugs text[];
  text_haystack text;
  needle text;
  needle_slug text;
  has_filename boolean;
  has_tag boolean;
  has_text boolean;
  matched text[];
  score int;
BEGIN
  IF _asset.project_id IS NOT NULL THEN
    INSERT INTO public.hq_graph_edges
      (from_type, from_id, to_type, to_id, relation, status, matched_rules)
    VALUES
      ('project', _asset.project_id, 'media', _asset.id, 'belongs_to', 'system_linked', ARRAY['legacy_column'])
    ON CONFLICT (from_type, from_id, to_type, to_id, relation) DO NOTHING;
  END IF;

  filename_haystack := '-' || regexp_replace(lower(coalesce(_asset.title, '')), '[^a-z0-9]+', '-', 'g') || '-';
  filename_haystack := regexp_replace(filename_haystack, '-+', '-', 'g');

  SELECT array_agg(
           regexp_replace(
             regexp_replace(lower(t), '[^a-z0-9]+', '-', 'g'),
             '^-+|-+$', '', 'g'
           )
         )
    INTO tag_slugs
    FROM unnest(coalesce(_asset.tags, ARRAY[]::text[])) AS t;

  text_haystack := ' ' || regexp_replace(lower(coalesce(_asset.description, '')), '\s+', ' ', 'g') || ' ';

  FOR proj IN
    SELECT id, code, name, coalesce(aliases, ARRAY[]::text[]) AS aliases
      FROM public.managed_projects
  LOOP
    has_filename := false;
    has_tag := false;
    has_text := false;

    FOREACH needle IN ARRAY (ARRAY[proj.code, proj.name] || proj.aliases) LOOP
      needle_slug := regexp_replace(lower(coalesce(needle, '')), '[^a-z0-9]+', '-', 'g');
      needle_slug := regexp_replace(needle_slug, '^-+|-+$', '', 'g');
      IF needle_slug = '' THEN CONTINUE; END IF;

      IF NOT has_filename AND position('-' || needle_slug || '-' in filename_haystack) > 0 THEN
        has_filename := true;
      END IF;
      IF NOT has_tag AND tag_slugs IS NOT NULL AND needle_slug = ANY(tag_slugs) THEN
        has_tag := true;
      END IF;
    END LOOP;

    FOREACH needle IN ARRAY (ARRAY[proj.name] || proj.aliases) LOOP
      needle := lower(trim(regexp_replace(coalesce(needle, ''), '\s+', ' ', 'g')));
      IF needle = '' OR length(needle) < 3 THEN CONTINUE; END IF;
      IF position(' ' || needle || ' ' in text_haystack) > 0 THEN
        has_text := true;
        EXIT;
      END IF;
    END LOOP;

    matched := ARRAY[]::text[];
    score := 0;
    IF has_filename THEN matched := array_append(matched, 'filename_alias'); score := score + 40; END IF;
    IF has_tag      THEN matched := array_append(matched, 'project_tag');    score := score + 35; END IF;
    IF has_text     THEN matched := array_append(matched, 'text_mention');   score := score + 25; END IF;

    IF score >= 35 AND (_asset.project_id IS NULL OR _asset.project_id <> proj.id) THEN
      INSERT INTO public.hq_graph_edges
        (from_type, from_id, to_type, to_id, relation, status, matched_rules)
      VALUES
        ('project', proj.id, 'media', _asset.id, 'belongs_to', 'suggested', matched)
      ON CONFLICT (from_type, from_id, to_type, to_id, relation) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
