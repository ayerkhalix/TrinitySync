# accounts/management/commands/createsuperadmin.py

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile, UserRole, StaffProfile


class Command(BaseCommand):
    help = "Create a Super Admin user with UserProfile and StaffProfile"

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, help="Email address")
        parser.add_argument("--password", type=str, help="Password")

    def handle(self, *args, **options):
        email = options.get("email")
        password = options.get("password")

        if not email or not password:
            self.stderr.write("❌ Email and password are required")
            self.stderr.write("Usage: py manage.py createsuperadmin --email you@email.com --password secret123")
            return

        # 1️⃣ Create or get Django User
        user, created = User.objects.get_or_create(
            username=email,
            defaults={"email": email},
        )

        if created:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write("✅ Django User created")
        else:
            self.stdout.write("ℹ️ Django User already exists")

        # 2️⃣ Create or get UserProfile
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "email": email,
                "role": UserRole.SUPER_ADMIN,
                "supabase_uid": f"local_{user.id}",
                "is_active": True,
                "email_verified": True,
            },
        )

        if not profile_created:
            profile.role = UserRole.SUPER_ADMIN
            profile.save()

        self.stdout.write("✅ UserProfile ready")

        # 3️⃣ Create or get StaffProfile
        staff, staff_created = StaffProfile.objects.get_or_create(
            user=profile,
            defaults={
                "is_super_admin": True,
                "is_college_admin": True,
                "position": "System Administrator",
            },
        )

        if not staff_created:
            staff.is_super_admin = True
            staff.is_college_admin = True
            staff.save()

        self.stdout.write(self.style.SUCCESS("🎉 SUPER ADMIN READY"))
