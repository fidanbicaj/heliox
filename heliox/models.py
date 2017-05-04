# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models

# Create your models here.

class Users(models.Model):
    username = models.CharField(max_length=50)
    email = models.CharField(max_length=75)
    password = models.CharField(max_length=80)

    def __unicode__(self):
        return self.username
