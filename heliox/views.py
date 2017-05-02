# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseForbidden
from .models import Users, Settings
from passlib.hash import sha256_crypt
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import json


def logged__in(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        if 'logged_in' in request.session.keys():
            return view_func(request, *args, **kwargs)
        else:
            return HttpResponseRedirect('/login')
    return _wrapped_view_func


def login(request):
    if request.method == 'POST':
        username = request.POST.get("username", "")
        password = request.POST.get("password", "")
        if Users.objects.filter(username=username).exists():
            user = Users.objects.get(username=username)
            if sha256_crypt.verify(password, user.password):
                request.session['logged_in'] = True
                request.session['username'] = username
                return HttpResponseRedirect('/')
            else:
                messages.add_message(request, messages.ERROR, 'Your password is incorrect')
        else:
            messages.add_message(request, messages.ERROR, 'Username does not exists')
        return HttpResponseRedirect('/login')
    return render(request, 'login.html', {})


def register(request):
    if request.method == 'POST':
        username = request.POST.get("username", "")
        email = request.POST.get("email", "")
        password = request.POST.get("password", "")
        confirm_password = request.POST.get("confirm_password", "")
        if password == confirm_password:
            if not Users.objects.filter(username=username).exists():
                if not Users.objects.filter(email=email).exists():
                    try:
                        validate_email(email)
                    except ValidationError:
                        messages.add_message(request, messages.ERROR, "Invalid Email Address")
                        return HttpResponseRedirect('/register')
                    hashed_password = sha256_crypt.encrypt(password)
                    Users(username=username, email=email, password=hashed_password).save()
                    messages.add_message(request, messages.SUCCESS, 'User %s successfully registred' % username)
                    return HttpResponseRedirect("/login")
                else:
                    messages.add_message(request, messages.ERROR, "Email already exists")
            else:
                messages.add_message(request, messages.ERROR, 'Username already taken')
        else:
            messages.add_message(request, messages.ERROR, 'Passwords do not match')
    return render(request, 'register.html', {})


def logout(request):
    request.session.flush()
    return HttpResponseRedirect('/login')


@logged__in
def index(request):
    return render(request, 'index.html', {})


@logged__in
def dashboard(request):
    return HttpResponse("Dashboard")


@logged__in
def settings(request):
    username = request.session['username']
    if request.method == 'POST':
        latitude = request.POST.get("latitude", "")
        longitude = request.POST.get("longitude", "")
        solar_panels = request.POST.get("solar_panels", "")
        power_of_panels = request.POST.get("power_of_panels", "")
        losses = request.POST.get("losses", "")
        battery = request.POST.get("battery", "")
        Settings.objects.filter(username=username).update(latitude=latitude, longitude=longitude,
                                                          solar_panels=solar_panels, power_of_panels=power_of_panels,
                                                          losses=losses, battery=battery)
        return HttpResponseRedirect('/settings')
    settings = Settings.objects.get(username=username)
    return HttpResponse("Settings")


@logged__in
def tasks(request):
    return render(request, 'tasks.html', {})