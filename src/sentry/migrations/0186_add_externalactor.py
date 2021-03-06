# Generated by Django 1.11.29 on 2021-04-14 19:02

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models

import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey
import sentry.types.integrations


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    # You'll also usually want to set this to `False` if you're writing a data
    # migration, since we don't want the entire migration to run in one long-running
    # transaction.
    atomic = True

    dependencies = [
        ("sentry", "0185_rm_copied_useroptions"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExternalActor",
            fields=[
                (
                    "id",
                    sentry.db.models.fields.bounded.BoundedBigAutoField(
                        primary_key=True, serialize=False
                    ),
                ),
                ("date_updated", models.DateTimeField(default=django.utils.timezone.now)),
                ("date_added", models.DateTimeField(default=django.utils.timezone.now, null=True)),
                (
                    "provider",
                    sentry.db.models.fields.bounded.BoundedPositiveIntegerField(
                        choices=[
                            (sentry.types.integrations.ExternalProviders(100), "email"),
                            (sentry.types.integrations.ExternalProviders(110), "slack"),
                            (sentry.types.integrations.ExternalProviders(120), "msteams"),
                            (sentry.types.integrations.ExternalProviders(130), "pagerduty"),
                            (sentry.types.integrations.ExternalProviders(200), "github"),
                            (sentry.types.integrations.ExternalProviders(210), "gitlab"),
                        ]
                    ),
                ),
                ("external_name", models.TextField()),
                ("external_id", models.TextField(null=True)),
                (
                    "actor",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="sentry.Actor"
                    ),
                ),
                (
                    "integration",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="sentry.Integration",
                    ),
                ),
                (
                    "organization",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="sentry.Organization"
                    ),
                ),
            ],
            options={
                "db_table": "sentry_externalactor",
            },
        ),
        migrations.AlterUniqueTogether(
            name="externalactor",
            unique_together={("organization", "provider", "external_name", "actor")},
        ),
    ]
