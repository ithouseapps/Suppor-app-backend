from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.timezone import localtime
from .models import (
    User, Room, Subject, AcademicSupport,
    SupportSchedule, Booking, Lesson, LessonRating, SupportBan
)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Login yoki parol notog'ri")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'password', 'secret_id']
        extra_kwargs = {'password': {'write_only': True}, 'secret_id': {'read_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'secret_id']


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class SubjectSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']


class SupportScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportSchedule
        fields = '__all__'
        read_only_fields = ['support']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['day_of_week_display'] = instance.get_day_of_week_display()
        data['room_name'] = instance.room.name if instance.room else None
        data['start_time'] = instance.start_time.strftime('%H:%M')
        data['end_time'] = instance.end_time.strftime('%H:%M')
        return data


class AcademicSupportSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    subjects = SubjectSimpleSerializer(many=True, read_only=True)
    subject_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    schedules = SupportScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = AcademicSupport
        fields = ['id', 'user', 'subjects', 'subject_ids', 'schedules', 'is_active', 'is_banned', 'created_at']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        subject_ids = validated_data.pop('subject_ids', [])
        user_serializer = UserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save(role='support')
        support = AcademicSupport.objects.create(user=user, **validated_data)
        if subject_ids:
            support.subjects.set(subject_ids)
        return support

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        subject_ids = validated_data.pop('subject_ids', None)
        if user_data:
            user_serializer = UserSerializer(instance.user, data=user_data, partial=True)
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()
        if subject_ids is not None:
            instance.subjects.set(subject_ids)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class AcademicSupportSimpleSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer()
    subjects = SubjectSimpleSerializer(many=True)
    schedules = SupportScheduleSerializer(many=True, read_only=True)
    is_busy = serializers.SerializerMethodField()

    class Meta:
        model = AcademicSupport
        fields = ['id', 'user', 'subjects', 'schedules', 'is_banned', 'is_busy']

    def get_is_busy(self, obj):
        return Lesson.objects.filter(support=obj, is_active=True).exists()


class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    support_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'support', 'student', 'subject', 'room',
            'date', 'start_time', 'end_time', 'status',
            'student_name', 'support_name', 'subject_name', 'room_name',
            'created_at'
        ]

    def get_student_name(self, obj):
        return obj.student.username

    def get_support_name(self, obj):
        return obj.support.user.username

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_room_name(self, obj):
        return obj.room.name if obj.room else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['start_time'] = instance.start_time.strftime('%H:%M')
        data['end_time'] = instance.end_time.strftime('%H:%M')
        data['date'] = instance.date.strftime('%Y-%m-%d')
        data['status_display'] = instance.get_status_display()
        return data


class LessonSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    support_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    delay_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'support', 'student', 'subject', 'room',
            'topic', 'comment', 'start_time', 'end_time', 'scheduled_start',
            'is_active', 'student_name', 'support_name',
            'subject_name', 'room_name', 'duration_minutes', 'rating', 'delay_minutes',
        ]

    def get_student_name(self, obj):
        return obj.student.username

    def get_support_name(self, obj):
        return obj.support.user.username

    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None

    def get_room_name(self, obj):
        return obj.room.name if obj.room else None

    def get_duration_minutes(self, obj):
        if obj.end_time:
            delta = obj.end_time - obj.start_time
            return int(delta.total_seconds() / 60)
        return None

    def get_rating(self, obj):
        try:
            r = obj.rating
            return {'score': r.score, 'comment': r.comment}
        except LessonRating.DoesNotExist:
            return None

    def get_delay_minutes(self, obj):
        if obj.scheduled_start and obj.start_time:
            delta = obj.start_time - obj.scheduled_start
            return int(delta.total_seconds() / 60)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        lt = localtime(instance.start_time)
        data['start_time'] = lt.strftime('%H:%M')
        data['end_time'] = localtime(instance.end_time).strftime('%H:%M') if instance.end_time else None
        if instance.scheduled_start:
            data['scheduled_start'] = localtime(instance.scheduled_start).strftime('%H:%M')
        else:
            data['scheduled_start'] = None
        data['date'] = lt.strftime('%Y-%m-%d')
        return data


class StartLessonSerializer(serializers.Serializer):
    student_name = serializers.CharField(max_length=200)
    subject_id = serializers.IntegerField(required=False, allow_null=True)
    topic = serializers.CharField(max_length=200)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    booking_id = serializers.IntegerField(required=False, allow_null=True)
    scheduled_start = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class EndLessonSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()


class LessonRatingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = LessonRating
        fields = ['id', 'lesson', 'student', 'score', 'comment', 'created_at', 'student_name']
        read_only_fields = ['student']

    def get_student_name(self, obj):
        return obj.student.username


class SupportBanSerializer(serializers.ModelSerializer):
    support_name = serializers.SerializerMethodField()
    banned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SupportBan
        fields = ['id', 'support', 'banned_by', 'reason', 'is_active', 'created_at', 'lifted_at', 'support_name', 'banned_by_name']
        read_only_fields = ['banned_by', 'created_at']

    def get_support_name(self, obj):
        return obj.support.user.username

    def get_banned_by_name(self, obj):
        return obj.banned_by.username if obj.banned_by else None


class DashboardStatsSerializer(serializers.Serializer):
    today_students = serializers.IntegerField()
    today_lessons = serializers.IntegerField()
    today_bookings = serializers.IntegerField()
    free_supports = serializers.IntegerField()
    busy_supports = serializers.IntegerField()


class SupportDashboardSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer()
    subjects = SubjectSimpleSerializer(many=True)
    current_lesson = serializers.SerializerMethodField()
    today_lessons_count = serializers.SerializerMethodField()
    today_students_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = AcademicSupport
        fields = [
            'id', 'user', 'subjects', 'is_active', 'is_banned',
            'current_lesson', 'today_lessons_count',
            'today_students_count', 'status'
        ]

    def get_current_lesson(self, obj):
        lesson = Lesson.objects.filter(support=obj, is_active=True).first()
        if lesson:
            return {
                'id': lesson.id,
                'student': lesson.student.username,
                'topic': lesson.topic,
                'start_time': localtime(lesson.start_time).strftime('%H:%M'),
                'room': lesson.room.name if lesson.room else None,
            }
        return None

    def get_today_lessons_count(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return Lesson.objects.filter(
            support=obj,
            start_time__date=today,
            end_time__isnull=False
        ).count()

    def get_today_students_count(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return Lesson.objects.filter(
            support=obj,
            start_time__date=today,
            end_time__isnull=False
        ).values('student').distinct().count()

    def get_status(self, obj):
        has_active = Lesson.objects.filter(support=obj, is_active=True).exists()
        return 'busy' if has_active else 'free'
