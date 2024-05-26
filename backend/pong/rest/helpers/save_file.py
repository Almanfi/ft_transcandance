from typing import List
from django.core.files.uploadedfile import InMemoryUploadedFile
from ..models.user_model import users_images_path
from django.utils.crypto import get_random_string
import os

def save_uploaded_file(file: InMemoryUploadedFile, ext:List[str] = []):
    filename, extension = os.path.splitext(file.name)
    if len(ext) > 0 and extension not in ext:
        return (None, None)
    filename = f"{get_random_string(12)}{extension}"
    full_path = f"{users_images_path()}/{filename}"
    with open(full_path, 'wb') as dest:
        for chunk in file.chunks():
            dest.write(chunk)
    return (filename, full_path)