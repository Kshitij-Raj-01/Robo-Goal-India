import io
import uuid
import warnings
from PIL import Image, ImageOps, UnidentifiedImageError
from pillow_heif import register_heif_opener
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db import models

register_heif_opener()
Image.MAX_IMAGE_PIXELS = 24_000_000

def webp(upload):
    if upload.size > 10 * 1024 * 1024:
        raise ValidationError("Photos must be 10 MB or smaller.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            upload.seek(0)
            with Image.open(upload) as source:
                if source.width * source.height > 24_000_000:
                    raise ValidationError("Photo exceeds 24 megapixels.")
                source.seek(0)  # Animated images become a single still frame.
                image = ImageOps.exif_transpose(source).convert("RGBA" if "A" in source.getbands() else "RGB")
                image.thumbnail((2560, 2560), Image.Resampling.LANCZOS)
                output = io.BytesIO()
                image.save(output, "WEBP", quality=85, method=4)
                return ContentFile(output.getvalue(), name=f"{uuid.uuid4().hex}.webp"), image.size
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise ValidationError("Upload a supported photo (JPEG, PNG, WebP, GIF, TIFF, BMP, AVIF or HEIC). SVG and non-image files are not accepted.") from error

class WebPField(models.FileField):
    """Decode all new uploads, discard metadata and store only re-encoded WebP."""
    def pre_save(self, instance, add):
        file = getattr(instance, self.attname)
        if file and not file._committed:
            converted, (width, height) = webp(file)
            setattr(instance, self.attname, converted)
            if hasattr(instance, "width"):
                instance.width, instance.height = width, height
        return super().pre_save(instance, add)
