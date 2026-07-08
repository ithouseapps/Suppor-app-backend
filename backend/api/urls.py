from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'supports', views.AcademicSupportViewSet)
router.register(r'schedules', views.SupportScheduleViewSet)
router.register(r'bookings', views.BookingViewSet)
router.register(r'lessons', views.LessonViewSet)

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.me_view, name='me'),
    path('lessons/start/', views.start_lesson, name='start-lesson'),
    path('lessons/end/', views.end_lesson, name='end-lesson'),
    path('bookings/create/', views.create_booking, name='create-booking'),
    path('bookings/<int:booking_id>/confirm/', views.confirm_booking, name='confirm-booking'),
    path('bookings/<int:booking_id>/cancel/', views.cancel_booking, name='cancel-booking'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/supports/', views.dashboard_supports, name='dashboard-supports'),
    path('dashboard/rooms/', views.dashboard_rooms, name='dashboard-rooms'),
    path('support/profile/', views.support_profile_view, name='support-profile'),
    path('student/profile/', views.student_profile_view, name='student-profile'),
    path('support/students/', views.student_status_list, name='student-status'),
    path('supports/<int:support_id>/slots/', views.available_slots, name='available-slots'),
    path('student/supports/', views.support_list_for_student, name='student-supports'),
    path('lessons/rate/', views.rate_lesson, name='rate-lesson'),
    path('supports/<int:support_id>/ban/', views.ban_support, name='ban-support'),
    path('supports/<int:support_id>/unban/', views.unban_support, name='unban-support'),
    path('admin/delays/', views.support_delays, name='support-delays'),
    path('student/supports/schedules/', views.support_schedules_for_student, name='student-supports-schedules'),
    path('admin/supports/<int:support_id>/profile/', views.admin_support_profile_view, name='admin-support-profile'),
    path('students/<int:student_id>/generate-secret/', views.generate_student_secret_id, name='generate-secret'),
    path('admin/excel/monthly/', views.admin_monthly_excel, name='admin-monthly-excel'),
    path('admin/bot-config/', views.bot_config_view, name='bot-config'),
    path('setup/', views.setup_view, name='setup'),
]

urlpatterns += router.urls
