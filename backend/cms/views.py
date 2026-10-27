import bleach
import markdown
from django.db import connection
from django.http import JsonResponse, Http404
from django.utils import timezone
from django.views.decorators.http import require_GET
from .models import SiteSettings, Event, GalleryPhoto, Fixture, Blog

def photo(file):
    return file.url if file else ""

def lines(text):
    return [line.strip() for line in text.splitlines() if line.strip()]

def event_data(event):
    return {"slug": event.slug, "title": event.title, "city": event.city, "venue": event.venue,
        "date": event.date.isoformat(), "endDate": event.end_date.isoformat() if event.end_date else None,
        "type": event.type, "status": event.status, "teams": event.teams, "participants": event.participants,
        "cover": photo(event.cover), "results": event.results, "highlights": event.highlights,
        "winners": lines(event.winners), "judges": lines(event.judges), "sponsors": lines(event.sponsors),
        "galleryIds": [str(p.pk) for p in event.photos.all() if p.published and p.publication_consent_confirmed],
        "registrationUrl": event.registration_url}

@require_GET
def content(request):
    settings = SiteSettings.objects.filter(pk=1).first()
    contacts = {} if not settings else {
        "email": settings.email, "phone": settings.delhi_phone,
        "phones": [{"label": "Delhi", "number": settings.delhi_phone}, {"label": "Noida", "number": settings.noida_phone}],
        "addresses": [f"Delhi: {settings.delhi_address}", f"Noida: {settings.noida_address}"],
        "businessHours": settings.business_hours, "mapUrl": settings.map_url}
    stat_fields = ["cities", "campus_rounds", "student_innovators", "partner_institutions", "robots_built"]
    stat_labels = ["Cities", "Campus Rounds", "Student Innovators", "Partner Institutions", "Robots Built"]
    result = {"site": contacts, "statistics": [{"label": label, "value": getattr(settings, field) if settings else None} for field, label in zip(stat_fields, stat_labels)],
        "events": [event_data(e) for e in Event.objects.filter(published=True).prefetch_related("photos")[:1000]],
        "media": [{"id": str(p.pk), "src": photo(p.image), "width": p.width, "height": p.height, "alt": p.alt,
                  "caption": p.caption, "category": p.category, "type": "image"} for p in GalleryPhoto.objects.filter(published=True, publication_consent_confirmed=True)[:2000]],
        "fixtures": [{"id": str(f.pk), "city": f.city, "venue": f.venue, "date": f.date.isoformat() if f.date else None,
                      "stage": f.stage, "status": f.status, "registrationStatus": f.registration_status,
                      "registrationUrl": f.registration_url, "directionsUrl": f.directions_url, "x": f.x, "y": f.y} for f in Fixture.objects.filter(published=True)[:1000]]}
    response = JsonResponse(result)
    response["Cache-Control"] = "public, max-age=15"
    return response

def published_blogs():
    return Blog.objects.filter(published=True, published_at__lte=timezone.now())

def blog_data(blog):
    return {"slug": blog.slug, "title": blog.title, "excerpt": blog.excerpt, "author": blog.author,
            "cover": photo(blog.cover), "seoTitle": blog.seo_title, "seoDescription": blog.seo_description,
            "publishedAt": blog.published_at.isoformat(), "updatedAt": blog.updated_at.isoformat()}

def safe_markdown(body):
    return bleach.clean(markdown.markdown(body, extensions=["fenced_code", "tables"]),
        tags=["p", "h2", "h3", "h4", "strong", "em", "a", "ul", "ol", "li", "blockquote", "pre", "code", "hr", "br", "table", "thead", "tbody", "tr", "th", "td"],
        attributes={"a": ["href", "title"]}, protocols=["http", "https", "mailto"], strip=True)

@require_GET
def blog_index(request):
    return JsonResponse({"blogs": [blog_data(b) for b in published_blogs()[:1000]]})

@require_GET
def blog_detail(request, slug):
    blog = published_blogs().filter(slug=slug).first()
    if not blog:
        raise Http404
    return JsonResponse({**blog_data(blog), "html": safe_markdown(blog.body)})

@require_GET
def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok"})
    except Exception:
        return JsonResponse({"status": "unavailable"}, status=503)
