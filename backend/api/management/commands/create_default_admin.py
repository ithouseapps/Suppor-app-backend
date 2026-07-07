from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default admin user if none exist'

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write('Admin user already exists')
            return

        User.objects.create_superuser(
            username='admin',
            password='admin123',
            role='admin'
        )
        self.stdout.write(self.style.SUCCESS('Default admin created: admin / admin123'))
