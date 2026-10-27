"""Isolated real Django -> production Next.js -> rendered HTML integration check."""
import io
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
from wsgiref.simple_server import make_server, WSGIRequestHandler

ROOT = Path(__file__).resolve().parents[1]

def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="rgi-cms-check-") as directory:
        os.environ.update({"DJANGO_DEBUG": "true", "DJANGO_SECRET_KEY": "isolated-local-test-not-a-production-secret-52JcKLg913", "DATABASE_URL": "",
                           "DJANGO_SQLITE_PATH": str(Path(directory) / "cms.sqlite3"), "DJANGO_MEDIA_ROOT": str(Path(directory) / "media")})
        sys.path.insert(0, str(ROOT / "backend"))
        os.environ["DJANGO_SETTINGS_MODULE"] = "config.settings"
        import django
        django.setup()
        from django.core.management import call_command
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.core.wsgi import get_wsgi_application
        from cms.models import SiteSettings, Event, GalleryPhoto, Fixture, Blog
        from PIL import Image
        call_command("migrate", verbosity=0)
        settings = SiteSettings.objects.create(cities=7, robots_built=111, email="cms-probe@example.com")
        event = Event.objects.create(title="RGI integration test round", slug="integration-round", city="Test City", venue="Synthetic QA arena", date="2026-11-01", type="Robo Soccer", status="Upcoming", published=True)
        stream = io.BytesIO()
        Image.new("RGB", (60,40), "orange").save(stream, "PNG")
        gallery = GalleryPhoto.objects.create(image=SimpleUploadedFile("probe.png", stream.getvalue()), alt="RGI synthetic integration image", category="Teams", event=event, published=True, publication_consent_confirmed=True)
        Fixture.objects.create(city="Test City", venue="Synthetic fixture venue", stage="Campus", status="Upcoming", registration_status="Closed", published=True)
        blog = Blog.objects.create(title="RGI engineering test article", slug="integration-blog", excerpt="A synthetic article for isolated QA", body="## Verified Markdown\n\n**RGI engineering**\n\n<script>bad()</script>", seo_description="Synthetic SEO description", published=True)
        class QuietHandler(WSGIRequestHandler):
            def log_message(self, *args):
                pass
        server = make_server("127.0.0.1", 0, get_wsgi_application(), handler_class=QuietHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        with socket.socket() as reserve:
            reserve.bind(("127.0.0.1", 0))
            port = reserve.getsockname()[1]
        origin = f"http://127.0.0.1:{port}"
        env = {**os.environ, "NODE_ENV":"production", "CMS_INTERNAL_URL":f"http://127.0.0.1:{server.server_port}", "CMS_REQUIRED":"true", "NEXT_PUBLIC_SITE_URL":origin, "ALLOW_LOCAL_DB":"true", "RGI_DATA_DIR":str(Path(directory)/"enquiries"), "SMTP_HOST":"", "TURNSTILE_SECRET_KEY":""}
        with open(Path(directory)/"next.log", "w+", encoding="utf8") as log:
            child = subprocess.Popen(["node", "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", str(port)], cwd=ROOT, env=env, stdout=log, stderr=log, creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
            def read(path):
                with urllib.request.urlopen(origin+path, timeout=20) as response:
                    return response.read().decode("utf8")
            try:
                for attempt in range(90):
                    try:
                        home = read("/")
                        break
                    except (OSError, urllib.error.URLError):
                        if child.poll() is not None:
                            raise RuntimeError("Next.js exited during startup")
                        time.sleep(0.5)
                else:
                    raise RuntimeError("Next.js did not become ready")
                assert "RGI integration test round" in home
                assert "cms-probe@example.com" in home
                assert 'data-value="7"' in home
                assert 'data-value="111"' in home
                assert "Synthetic fixture venue" in read("/fixtures")
                assert "RGI synthetic integration image" in read("/gallery")
                assert gallery.image.url in read("/gallery")
                # In production Nginx, not Next's optimizer, serves /media/.
                with urllib.request.urlopen(f"http://127.0.0.1:{server.server_port}"+gallery.image.url) as image:
                    assert image.headers["Content-Type"].startswith("image/webp")
                    assert image.read()[:4] == b"RIFF"
                assert "Synthetic QA arena" in read("/events/integration-round")
                assert "RGI engineering test article" in read("/blog")
                article = read("/blog/integration-blog")
                assert "<h2>Verified Markdown</h2>" in article
                assert "Synthetic SEO description" in article
                assert "<script>bad()" not in article
                assert "BlogPosting" in article
                sitemap = read("/sitemap.xml")
                assert "/blog/integration-blog" in sitemap and "/events/integration-round" in sitemap
                assert "/documents/refund" not in sitemap
                settings.cities = 11
                settings.save()
                assert 'data-value="11"' in read("/")
                event.published = blog.published = gallery.published = False
                event.save(); blog.save(); gallery.save()
                for path in ("/events/integration-round", "/blog/integration-blog"):
                    try:
                        missing = read(path)
                        # Next's streamed notFound response can be HTTP 200 but
                        # must contain no record and must be explicitly noindex.
                        assert 'noindex' in missing
                        assert ("RGI integration test round" if path.startswith("/events/") else "RGI engineering test article") not in missing
                    except urllib.error.HTTPError as error:
                        assert error.code == 404
                assert "RGI synthetic integration image" not in read("/gallery")
                print("PASS: real Django publishing -> Next SSR, contact/stats updates, event/gallery/fixture/blog, WebP media, SEO/sitemap, unpublish -> not-found/noindex")
            except Exception:
                log.flush(); log.seek(0)
                print(log.read()[-10000:])
                raise
            finally:
                child.terminate()
                try:
                    child.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    child.kill(); child.wait()
                server.shutdown()
                server.server_close()
                thread.join(timeout=5)
                from django.db import connections
                connections.close_all()
        from django.db import connections
        connections.close_all()

if __name__ == "__main__":
    main()
