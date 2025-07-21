from django.contrib import admin
from .models import Doctor, ExamCategory, ExamItem, ImagingRequest

admin.site.register(Doctor)
admin.site.register(ExamCategory)
admin.site.register(ExamItem)
admin.site.register(ImagingRequest)
