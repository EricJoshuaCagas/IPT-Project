from django.contrib.auth.models import User

admin = User.objects.filter(username='admin').first()
if admin:
    admin.set_password('admin123')
    admin.save()
    print('✓ Admin password set to: admin123')
else:
    print('No admin user found. Creating new one...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✓ New admin created. Username: admin, Password: admin123')
