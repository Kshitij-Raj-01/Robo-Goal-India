from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from cms.views import content, blog_detail, blog_index, health

admin.site.site_header = "RGI · Robo Goal India"
admin.site.site_title = "RGI administration"
admin.site.index_title = "Publish verified RGI content"
urlpatterns = [
    path("cms-admin/", admin.site.urls),
    path("cms-api/content/", content),
    path("cms-api/blogs/", blog_index),
    path("cms-api/blogs/<slug:slug>/", blog_detail),
    path("health/", health),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
