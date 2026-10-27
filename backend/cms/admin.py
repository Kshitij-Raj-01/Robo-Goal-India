from django.contrib import admin
from django import forms
from .models import SiteSettings, Event, GalleryPhoto, Fixture, Blog

@admin.register(SiteSettings)
class SettingsAdmin(admin.ModelAdmin):
    fieldsets = [("Public contact details", {"fields": ["email", "delhi_phone", "noida_phone", "delhi_address", "noida_address", "business_hours", "map_url"]}),
                 ("Homepage numbers (blank means Coming into play; zero is displayed as zero)", {"fields": ["cities", "campus_rounds", "student_innovators", "partner_institutions", "robots_built"]})]
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists() and super().has_add_permission(request)
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "city", "date", "status", "published"]
    list_filter = ["published", "status", "type"]
    search_fields = ["title", "city", "venue"]
    prepopulated_fields = {"slug": ["title"]}

@admin.register(GalleryPhoto)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ["alt", "category", "event", "published", "publication_consent_confirmed"]
    list_filter = ["published", "category"]
    search_fields = ["alt", "caption"]
    autocomplete_fields = ["event"]
    readonly_fields = ["width", "height"]

@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    list_display = ["city", "stage", "date", "status", "published"]
    list_filter = ["published", "status"]
    search_fields = ["city", "venue"]

class BlogForm(forms.ModelForm):
    class Meta:
        model = Blog
        fields = "__all__"
        widgets = {"body": forms.Textarea(attrs={"class": "rgi-markdown", "rows": 28, "spellcheck": "true"})}
    class Media:
        js = ["cms/markdown.js"]
        css = {"all": ["cms/markdown.css"]}

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    form = BlogForm
    list_display = ["title", "author", "published_at", "published"]
    list_filter = ["published"]
    search_fields = ["title", "body"]
    prepopulated_fields = {"slug": ["title"]}
    readonly_fields = ["updated_at"]
