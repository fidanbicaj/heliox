# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseForbidden, JsonResponse
from .models import Users, Devices, Tasks
from passlib.hash import sha256_crypt
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


# Decorator to restrict user from opening a without being logged in
def logged__in(view_func):
    def _wrapped_view_func(request, *args, **kwargs):
        if 'logged_in' in request.session.keys():
            return view_func(request, *args, **kwargs)
        else:
            return HttpResponseRedirect('/login')
    return _wrapped_view_func



def login(request):
    if request.method == 'POST':
        request_type = request.POST.get("request_type", "")
        if request_type == 'login':
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
        elif request_type == 'register':
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
                            return HttpResponseRedirect('/login')
                        hashed_password = sha256_crypt.encrypt(password)
                        Users(username=username, email=email, password=hashed_password).save()
                        messages.add_message(request, messages.SUCCESS, 'User %s successfully registered' % username)
                        return HttpResponseRedirect("/login")
                    else:
                        messages.add_message(request, messages.ERROR, "Email already exists")
                else:
                    messages.add_message(request, messages.ERROR, 'Username already taken')
            else:
                messages.add_message(request, messages.ERROR, 'Passwords do not match')
        else:
            return HttpResponseForbidden()
    return render(request, 'login.html', {})


def logout(request):
    request.session.flush()
    return HttpResponseRedirect('/login')



@logged__in
def index(request):
    return render(request, 'index.html', {})



@logged__in
def tasks(request):
    return render(request, 'tasks.html', {})


@logged__in
def add_device(request):
    json_response = {}
    if request.method=='POST':
        name = request.POST.get("device_name", "")
        power = request.POST.get("device_power", "")
        category = request.POST.get("device_category", "")
        if not Devices.objects.filter(name=name).exists():
            if name and power and category:
                Devices(name=name, power=power, category=category[0]).save()
                json_response['Type'] = 'success'
                json_response['Title'] = 'Good job'
                json_response['Message'] = 'Device successfully added.'
                return JsonResponse(json_response)
            else:
                json_response['Type'] = 'error'
                json_response['Title'] = 'Try again'
                json_response['Message'] = 'Please fill all fields.'
                return JsonResponse({'message': messages})
        else:
            json_response['Type'] = 'error'
            json_response['Title'] = 'Try again'
            json_response['Message'] = 'Device already exists.'
            return JsonResponse({'message': messages})


@logged__in
def remove_device(request):
    if request.method == 'POST':
        name = request.POST.get("device_name", "")
        if not Devices.objects.filter(name=name).exists():
            Devices.objects.filter(name=name).delete()
            return JsonResponse({'Type': 'success', 'Title': 'Good job', 'Message': 'Device successfully removed.'})
        else:
            return JsonResponse({'Type': 'error', 'Title': 'Something went wrong', 'Message': 'Device does not exist.'})
