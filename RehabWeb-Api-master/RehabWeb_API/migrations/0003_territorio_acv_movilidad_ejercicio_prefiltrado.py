# Generated manually for RF pre-filtrado clínico

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('RehabWeb_API', '0002_ejercicio_creador_ejercicio_estado_publicacion_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='perfilclinico',
            name='territorio_acv',
            field=models.CharField(
                blank=True,
                choices=[
                    ('CUALQUIERA', 'Cualquiera / no específico'),
                    ('HEMISFERIO_DERECHO', 'Hemisferio derecho'),
                    ('HEMISFERIO_IZQUIERDO', 'Hemisferio izquierdo'),
                    ('BILATERAL', 'Bilateral'),
                ],
                help_text='Territorio afectado por ACV para filtrado de ejercicios',
                max_length=30,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='perfilclinico',
            name='nivel_movilidad',
            field=models.CharField(
                choices=[
                    ('1', 'Nivel 1 - Muy Limitado'),
                    ('2', 'Nivel 2 - Limitado'),
                    ('3', 'Nivel 3 - Moderado'),
                    ('4', 'Nivel 4 - Autónomo'),
                    ('5', 'Nivel 5 - Función óptima'),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='ejercicio',
            name='movilidad_paciente_max',
            field=models.CharField(
                choices=[
                    ('1', 'Nivel 1 - Muy Limitado'),
                    ('2', 'Nivel 2 - Limitado'),
                    ('3', 'Nivel 3 - Moderado'),
                    ('4', 'Nivel 4 - Autónomo'),
                    ('5', 'Nivel 5 - Función óptima'),
                ],
                default='5',
                help_text='Nivel máximo de movilidad del paciente (1–5) para el que el ejercicio es adecuado',
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name='ejercicio',
            name='movilidad_paciente_min',
            field=models.CharField(
                choices=[
                    ('1', 'Nivel 1 - Muy Limitado'),
                    ('2', 'Nivel 2 - Limitado'),
                    ('3', 'Nivel 3 - Moderado'),
                    ('4', 'Nivel 4 - Autónomo'),
                    ('5', 'Nivel 5 - Función óptima'),
                ],
                default='1',
                help_text='Nivel mínimo de movilidad del paciente (1–5) para el que el ejercicio es adecuado',
                max_length=2,
            ),
        ),
        migrations.AddField(
            model_name='ejercicio',
            name='territorios_acv_compatibles',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Lista de códigos TerritorioACV; vacío = compatible con cualquier territorio',
            ),
        ),
        migrations.AddField(
            model_name='evaluacionclinica',
            name='es_evaluacion_inicial',
            field=models.BooleanField(
                default=False,
                help_text='Si es True, se prioriza junto con el perfil para pre-filtrado (RF-CLIN-002)',
            ),
        ),
    ]
