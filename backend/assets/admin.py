from django.contrib import admin
from .models import Asset

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_id', 'asset_type', 'status', 'connectivity', 'antivirus_enabled')
    list_filter = ('asset_type', 'status', 'connectivity', 'antivirus_enabled')
    search_fields = ('name', 'asset_id', 'description', 'location')
    ordering = ['name']