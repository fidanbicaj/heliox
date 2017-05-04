# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
from datetime import datetime

# Create your models here.

device_categories = (
    ('p', 'Personal'),
    ('e', 'Electronic'),
    ('h', 'House')
)


class Users(models.Model):
    username = models.CharField(max_length=50)
    email = models.CharField(max_length=75)
    password = models.CharField(max_length=80)

    def __unicode__(self):
        return self.username


class Devices(models.Model):
    name = models.CharField(max_length=50)
    power = models.FloatField(default=10)
    category = models.CharField(max_length=1, choices=device_categories, default='p')

    def __unicode__(self):
        return self.name


class Tasks(models.Model):
    device = models.ForeignKey(Devices)
    start_time = models.DateTimeField(default=datetime.now)
    duration = models.FloatField(default=15)
    energy = models.FloatField(default=0.5)

    def __unicode__(self):
        return self.device

