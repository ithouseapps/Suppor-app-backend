from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default admin user if none exist'

    def handle(self, *args, **options):
        if User.objects.filter(username='admin').exists():
            u = User.objects.get(username='admin')
            if not u.is_superuser:
                u.is_superuser = True
                u.is_staff = True
                u.role = 'admin'
                u.set_password('admin123')
                u.save()
                self.stdout.write(self.style.SUCCESS('Admin upgraded: admin / admin123'))
            else:
                self.stdout.write('Admin already exists')
            return

        User.objects.create_superuser(
            username='admin',
            password='admin123',
            role='admin'
        )
        self.stdout.write(self.style.SUCCESS('Default admin created: admin / admin123'))
