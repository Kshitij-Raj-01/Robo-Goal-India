import io
import tempfile
from datetime import timedelta
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from .models import Blog, Event, GalleryPhoto, SiteSettings, Fixture
from .views import safe_markdown

def upload(format="PNG"):
    stream = io.BytesIO()
    Image.new("RGB", (80, 40), "orange").save(stream, format)
    return SimpleUploadedFile("unsafe-original-name." + format.lower(), stream.getvalue())

class PublishingTests(TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.directory.name, SECURE_SSL_REDIRECT=False)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.addCleanup(self.directory.cleanup)

    def test_uploads_are_reencoded_not_renamed(self):
        for format in ("PNG", "JPEG", "BMP", "TIFF", "GIF", "WEBP", "AVIF", "HEIF"):
            entry = GalleryPhoto(image=upload(format), alt="A student robot", category="Teams")
            entry.full_clean()
            entry.save()
            entry.refresh_from_db()
            self.assertTrue(entry.image.name.endswith(".webp"))
            self.assertNotIn("unsafe-original-name", entry.image.name)
            with entry.image.open("rb") as file:
                with Image.open(file) as result:
                    self.assertEqual(result.format, "WEBP")
                    self.assertEqual(result.size, (80, 40))
                    self.assertFalse(result.getexif())
            self.assertEqual((entry.width, entry.height), (80, 40))

    def test_svg_corrupt_and_large_uploads_rejected(self):
        for data in (b"<svg onload='alert(1)'/>", b"not an image"):
            entry = GalleryPhoto(image=SimpleUploadedFile("test.png", data), alt="test", category="Teams")
            with self.assertRaises(ValidationError):
                entry.full_clean()
        entry = GalleryPhoto(image=SimpleUploadedFile("large.jpg", b"x" * (10*1024*1024+1)), alt="test", category="Teams")
        with self.assertRaises(ValidationError):
            entry.full_clean()

    def test_private_content_and_unconsented_photos_are_never_returned(self):
        event = Event.objects.create(title="Verified RGI round", slug="verified", city="Delhi", venue="Test arena", date="2026-11-01", type="Robo Soccer", status="Upcoming", published=True)
        Event.objects.create(title="Draft", slug="draft", city="Delhi", venue="Draft", date="2026-11-02", type="Robo Race", status="Upcoming")
        GalleryPhoto.objects.create(image=upload(), alt="Private", category="Teams", published=True, event=event)
        GalleryPhoto.objects.create(image=upload(), alt="Approved", category="Teams", published=True, publication_consent_confirmed=True, event=event)
        Fixture.objects.create(city="Delhi", venue="Test arena", stage="Campus", status="Upcoming", registration_status="Closed", published=True)
        SiteSettings.objects.create(cities=0, robots_built=100)
        data = self.client.get("/cms-api/content/").json()
        self.assertEqual([e["slug"] for e in data["events"]], ["verified"])
        self.assertEqual([p["alt"] for p in data["media"]], ["Approved"])
        self.assertEqual(len(data["events"][0]["galleryIds"]), 1)
        self.assertEqual(data["statistics"][0]["value"], 0)
        self.assertEqual(data["statistics"][-1]["value"], 100)
        self.assertEqual(len(data["fixtures"]), 1)
        self.assertEqual(self.client.post("/cms-api/content/").status_code, 405)

    def test_photo_requires_permission_to_publish(self):
        photo = GalleryPhoto(image=upload(), alt="test", category="Teams", published=True)
        with self.assertRaises(ValidationError):
            photo.full_clean()

    def test_markdown_and_publication_boundaries(self):
        body = "## Engineering\n\n**RGI**\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n<img src=x onerror=alert(1)>"
        result = safe_markdown(body)
        self.assertIn("<h2>Engineering</h2>", result)
        self.assertIn("<strong>RGI</strong>", result)
        self.assertNotIn("<script", result)
        self.assertNotIn("javascript:", result)
        self.assertNotIn("onerror", result)
        for slug, published, offset in [("draft", False, -1), ("scheduled", True, 1), ("live", True, -1)]:
            Blog.objects.create(title=slug, slug=slug, excerpt="Engineering story", body=body, published=published, published_at=timezone.now()+timedelta(days=offset))
        self.assertEqual([b["slug"] for b in self.client.get("/cms-api/blogs/").json()["blogs"]], ["live"])
        for slug in ("draft", "scheduled", "missing"):
            self.assertEqual(self.client.get(f"/cms-api/blogs/{slug}/").status_code, 404)
        self.assertIn("<h2>", self.client.get("/cms-api/blogs/live/").json()["html"])

    def test_admin_authentication_permissions_and_csrf(self):
        self.assertEqual(self.client.get("/cms-admin/").status_code, 302)
        staff = get_user_model().objects.create_user(username="restricted", password="strong-test-password-only", is_staff=True)
        self.client.force_login(staff)
        self.assertEqual(self.client.get("/cms-admin/cms/blog/add/").status_code, 403)
        from django.test import Client
        strict = Client(enforce_csrf_checks=True)
        self.assertEqual(strict.post("/cms-admin/login/", {"username":"restricted", "password":"strong-test-password-only"}).status_code, 403)

    def test_admin_forms_have_webp_validation_and_markdown_assets(self):
        from .admin import BlogForm
        self.assertIn("cms/markdown.js", str(BlogForm().media))
        self.assertIn("rgi-markdown", str(BlogForm()["body"]))

    def test_admin_login_attempts_are_limited(self):
        statuses = [self.client.post("/cms-admin/login/", {"username":"blocked-test-user", "password":"incorrect-password", "next":"/cms-admin/"}).status_code for _ in range(6)]
        self.assertIn(429, statuses)
