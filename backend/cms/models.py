from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator, MaxLengthValidator
from django.db import models
from django.utils import timezone
from .images import WebPField, webp

class Published(models.Model):
    published = models.BooleanField(default=False, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

    def clean(self):
        super().clean()
        for field in self._meta.fields:
            if isinstance(field, WebPField):
                file = getattr(self, field.name)
                if file and not file._committed:
                    webp(file)  # Admin errors stay on the form, not a save-time 500.
                    file.seek(0)

class SiteSettings(models.Model):
    email = models.EmailField(default="ai@roboticsir.com")
    delhi_phone = models.CharField(max_length=30, default="+91-8294579554")
    noida_phone = models.CharField(max_length=30, default="+91-9267913431")
    delhi_address = models.TextField(max_length=1000, default="Robotic Sir, F-24, near Preet Vihar Metro, Preet Vihar, New Delhi, Delhi 110092")
    noida_address = models.TextField(max_length=1000, default="Spectrum Metro, BF-74, Tower B, First Floor, Phase 2, Sector 75, Noida, Uttar Pradesh 201316")
    business_hours = models.CharField(max_length=250, default="Monday–Sunday, 10:00 AM–10:00 PM. Please call before visiting.")
    map_url = models.URLField(default="https://maps.google.com/?q=Robotic+Sir+Preet+Vihar+New+Delhi")
    cities = models.PositiveIntegerField(null=True, blank=True)
    campus_rounds = models.PositiveIntegerField(null=True, blank=True)
    student_innovators = models.PositiveIntegerField(null=True, blank=True)
    partner_institutions = models.PositiveIntegerField(null=True, blank=True)
    robots_built = models.PositiveIntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        return super().save(*args, **kwargs)
    def __str__(self):
        return "Contact details and homepage numbers"
    class Meta:
        verbose_name_plural = "Site settings"

class Event(Published):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    city = models.CharField(max_length=100)
    venue = models.CharField(max_length=250)
    date = models.DateField(db_index=True)
    end_date = models.DateField(null=True, blank=True)
    type = models.CharField(max_length=30, choices=[(v,v) for v in ["Robo Soccer", "Robo Race", "Campus Round"]])
    status = models.CharField(max_length=20, choices=[("Completed", "Completed"), ("Upcoming", "Upcoming")])
    teams = models.PositiveIntegerField(null=True, blank=True)
    participants = models.PositiveIntegerField(null=True, blank=True)
    cover = WebPField(upload_to="events/", blank=True)
    results = models.TextField(max_length=15000, blank=True)
    highlights = models.TextField(max_length=15000, blank=True)
    winners = models.TextField(blank=True, help_text="One winner per line.")
    judges = models.TextField(blank=True, help_text="One judge per line.")
    sponsors = models.TextField(blank=True, help_text="One sponsor per line.")
    registration_url = models.URLField(blank=True)
    class Meta:
        ordering = ["-date", "-pk"]
    def clean(self):
        super().clean()
        if self.end_date and self.date and self.end_date < self.date:
            raise ValidationError({"end_date": "End date cannot be before the start date."})
    def __str__(self):
        return self.title

class GalleryPhoto(Published):
    image = WebPField(upload_to="gallery/")
    alt = models.CharField(max_length=250, help_text="Describe the image for accessibility.")
    caption = models.CharField(max_length=500, blank=True)
    category = models.CharField(max_length=40, choices=[(v,v) for v in ["Robo Soccer", "Robo Race", "Teams", "Awards", "Campus Rounds", "Judges and Guests", "Behind the Scenes", "Workshops"]])
    event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name="photos")
    publication_consent_confirmed = models.BooleanField(default=False, help_text="Confirm rights and necessary participant/parent permissions before publishing.")
    width = models.PositiveIntegerField(default=0, editable=False)
    height = models.PositiveIntegerField(default=0, editable=False)
    class Meta:
        ordering = ["-pk"]
    def clean(self):
        super().clean()
        if self.published and not self.publication_consent_confirmed:
            raise ValidationError({"publication_consent_confirmed": "Confirm publication permission first."})
    def __str__(self):
        return self.alt

class Fixture(Published):
    city = models.CharField(max_length=100)
    venue = models.CharField(max_length=250)
    date = models.DateField(null=True, blank=True, db_index=True)
    stage = models.CharField(max_length=100)
    status = models.CharField(max_length=30, choices=[(v,v) for v in ["Completed", "Current", "Upcoming", "To be announced"]])
    registration_status = models.CharField(max_length=30, choices=[(v,v) for v in ["Open", "Closed", "To be announced"]])
    registration_url = models.URLField(blank=True)
    directions_url = models.URLField(blank=True)
    x = models.FloatField(default=300, validators=[MinValueValidator(0), MaxValueValidator(600)], help_text="Map coordinate 0–600.")
    y = models.FloatField(default=295, validators=[MinValueValidator(0), MaxValueValidator(590)], help_text="Map coordinate 0–590.")
    class Meta:
        ordering = ["date", "pk"]
    def __str__(self):
        return f"{self.city} · {self.stage}"

class Blog(Published):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    excerpt = models.CharField(max_length=320)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    author = models.CharField(max_length=100, default="RGI Editorial")
    cover = WebPField(upload_to="blogs/", blank=True)
    body = models.TextField(validators=[MaxLengthValidator(100000)], help_text="Markdown: ## heading, **bold**, *italic*, [label](https://...), lists and fenced code. Raw HTML is sanitized.")
    published_at = models.DateTimeField(default=timezone.now, db_index=True)
    class Meta:
        ordering = ["-published_at", "-pk"]
    def __str__(self):
        return self.title
