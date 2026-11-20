-- Demo and seed users had addresses on vitros.app, a domain VitrOS does not
-- own. Move them to addresses under vitroslabs.com. Idempotent: rows already
-- moved no longer match.
UPDATE "User" SET email = 'demo@vitroslabs.com' WHERE email = 'demo@vitros.app';
UPDATE "User" SET email = regexp_replace(email, '\.vitros\.app$', '.demo.vitroslabs.com') WHERE email LIKE '%.vitros.app';
