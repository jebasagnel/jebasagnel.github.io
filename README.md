# Jebas Agnel — Portfolio

Static portfolio website built with HTML, CSS, and JavaScript.

The homepage opens with an interactive animated introduction. Drag the scene,
use the category controls, or select **Enter portfolio** to continue to the
portfolio; the introduction and portfolio share the same typography, palette,
and saved light/dark theme.

## Rebuild the animated introduction

From the repository root, run `python assets/the-boring-blog/generate_standalone_hero.py`.
The generator writes `assets/the-boring-blog/standalone-hero/index.html` using
the 24 situations in `situations_clean.json` and their optimized WebP textures.

## Update the résumé

Replace `New Resume Box/Jebas-Agnel-Resume.pdf` with the new résumé and keep
that filename. Commit and push the change to GitHub; the Pages workflow
publishes the update automatically.

## Publish with GitHub Pages

1. Create a **public** repository named `jebasagnel.github.io` (or provide a
   different repository name if you prefer a project-site URL).
2. Push this project to the repository's `main` branch.
3. In the repository, open **Settings → Pages** and set the build and
   deployment source to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy-pages.yml` deploys the site after
   each push. For the `jebasagnel.github.io` repository, the site address is
   `https://jebasagnel.github.io/`.

The Pages workflow publishes the portfolio, the generated introduction and its
optimized character/sky images, local fonts, favicon, audio, and résumé. It
does not copy the downloaded reference-site archive into the published site.

## Music rights

The ambient sample is marked public domain on Wikimedia Commons. Source and
license notes are in `assets/audio/README.txt`.
