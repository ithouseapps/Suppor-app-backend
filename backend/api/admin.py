from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Room, Subject, AcademicSupport, SupportSchedule, Booking, Lesson, BotConfig


class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'phone', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Qoshimcha malumotlar', {'fields': ('role', 'phone')}),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Room)
admin.site.register(Subject)
admin.site.register(AcademicSupport)
admin.site.register(SupportSchedule)
admin.site.register(Booking)
admin.site.register(Lesson)
admin.site.register(BotConfig)
