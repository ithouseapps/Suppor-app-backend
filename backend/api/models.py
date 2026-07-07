from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('support', 'Academic Support'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    secret_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='api_user_groups',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='api_user_permissions',
        blank=True,
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AcademicSupport(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='support_profile')
    subjects = models.ManyToManyField(Subject, related_name='supports')
    is_active = models.BooleanField(default=True)
    is_banned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class SupportSchedule(models.Model):
    support = models.ForeignKey(AcademicSupport, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=[
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ])
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('support', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.support.user.username} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Kutilmoqda'),
        ('confirmed', 'Tasdiqlangan'),
        ('completed', 'Yakunlangan'),
        ('cancelled', 'Bekor qilingan'),
    )
    support = models.ForeignKey(AcademicSupport, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.support.user.username} {self.date} {self.start_time}"


class Lesson(models.Model):
    support = models.ForeignKey(AcademicSupport, on_delete=models.CASCADE, related_name='lessons')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lessons')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.CharField(max_length=200)
    comment = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    scheduled_start = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    student_count = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.support.user.username} -> {self.student.username} ({self.topic})"


class LessonRating(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='rating')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    score = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.lesson.id}: {self.score}"


class BotConfig(models.Model):
    chat_id = models.CharField(max_length=100, default='8541380592')
    bot_token = models.CharField(max_length=200, blank=True, null=True, default='8806446478:AAGlP8I-wfrA8qbCpFRafXZ83sur2RKKfV0')

    class Meta:
        verbose_name = 'Bot Configuration'


class SupportBan(models.Model):
    support = models.ForeignKey(AcademicSupport, on_delete=models.CASCADE, related_name='bans')
    banned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='issued_bans')
    reason = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    lifted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.support.user.username} banned by {self.banned_by.username if self.banned_by else 'unknown'}"
