from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('scheduling', '0001_initial'),
        ('colleges', '0001_initial'),
    ]

    operations = [
        # 🔥 STEP 1: DROP the old column
        migrations.RemoveField(
            model_name='scheduleitem',
            name='instructor',
        ),

        # 🔥 STEP 2: ADD the new UUID-based FK
        migrations.AddField(
            model_name='scheduleitem',
            name='instructor',
            field=models.ForeignKey(
                to='colleges.instructor',
                on_delete=django.db.models.deletion.SET_NULL,
                null=True,
                blank=True,
                related_name='schedule_items',
            ),
        ),
    ]
