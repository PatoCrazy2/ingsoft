# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('RehabWeb_API', '0003_territorio_acv_movilidad_ejercicio_prefiltrado'),
    ]

    operations = [
        migrations.AddField(
            model_name='ejercicio',
            name='categoria',
            field=models.CharField(
                choices=[
                    ('GENERAL', 'General'),
                    ('FUERZA', 'Fuerza'),
                    ('MOVILIDAD', 'Movilidad'),
                    ('EQUILIBRIO', 'Equilibrio'),
                    ('POSTURAL', 'Higiene postural'),
                    ('CARDIO', 'Cardiorrespiratorio'),
                ],
                default='GENERAL',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='ejercicio',
            name='etiquetas_clinicas',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Etiquetas del tesauro clínico asociadas al ejercicio',
            ),
        ),
    ]
