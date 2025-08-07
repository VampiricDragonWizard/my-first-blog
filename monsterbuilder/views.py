from math import ceil, floor
from urllib import request
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.parsers import JSONParser
from .forms import MonsterForm
from .models import Monster, MonsterType, Skill, Feat, Weapon, Armor, SpecialAbility
from .serializers import (MonsterTypeSerializer, SkillSerializer, FeatSerializer,
                          WeaponSerializer, ArmorSerializer, SpecialAbilitySerializer)

# Views for the Monster Builder
def calculate_modifier(score, name):
    """
    Return tuple of ability score in the form (score, modifier).
    TODO: Can I return a dictionary in the form {'ability name': (score, modifier)}?
    """
    # If the monster does not have this ability score, it doesn't have a modifier.
    # However, the modifier must be set to zero to be able to calculate with it.
    # In the template, however, a score of - shouldn't be accompanied by a modifier at all.
    # Those who do not live, do not have constitution scores
    if score == "-" or score == 0:
        ability = {name: ("-", 0)}
    else:
        # If ability scores don't exist because they haven't been entered yet (or entered incorrectly), set score to 10
        try:
            score = int(score)
            if score < 0:
                score = 10
            modifier = floor((score - 10) / 2)
            ability = {name: (score, modifier)}
        # Do not specify type of error
        except:
            # This will work for now. TODO: see if it can be done more elegantly later
            ability = {name: ("", 0)}
    return ability

def calculate_save(quality, hd):
    if quality == "good":
        save = round(((hd+3)/2), ndigits=None)
    elif quality == "poor":
        save = floor((hd-1)/3)
        if save < 0:
            save = 0
    else:
        save = 0
    return save

"""def validate_speed(speed):
    if speed:
        speed = int(speed)
    else:
        speed = 0
    return speed"""

def monster_builder(request):
    ''''''
    if request.method == "POST":
        """
            Save: Add a monster to the database
            Show: Show the selected monster stat block
        """
        print("Validating form")
        form = MonsterForm(request.POST)
        if form.is_valid:
            # TODO: form is valid when it shouldn't be (monstertype)
            print("Form is valid")
            try:
                # Can probably just create monster as form, its a dictionary
                monster = form.save(commit=False)
                # Calculate Hit Dice Number
                if form.cleaned_data["hd_fraction"]:
                    monster.hd_number = float(1/form.cleaned_data["hd_number"])
                else:
                    monster.hd_number = float(form.cleaned_data["hd_number"])
                if request.POST['action'] == 'save':
                    monster.save()
                    return HttpResponse("OK")
                elif request.POST['action'] == 'show':
                    return render(request, 'monsterbuilder/alexandrian_stat.html', {'monster': monster})
                else:
                    return HttpResponse("Invalid action")
            except:
                print("failed to create monster")
        else:
            print(form.errors)
            return HttpResponse(form.errors)
    elif request.method == "GET":
        ''' Create an empty form instance '''
        form = MonsterForm()
    monstertypes = MonsterType.objects.all().values()
                        #("name", "hd_type", "atk_as", "fortitude", "reflex", "will", "skill_points", "number_of_feats"))
    melee_weapons = Weapon.objects.filter(atk_form='melee').order_by('name')
    ranged_weapons = Weapon.objects.filter(atk_form='ranged').order_by('name')
    for weapon in melee_weapons:
        weapon.display_size = weapon.get_size_display()
    for weapon in ranged_weapons:
        weapon.display_size = weapon.get_size_display()
    skills = Skill.objects.all().order_by('name')
    feats = Feat.objects.all().order_by('name')
    light_armor = Armor.objects.filter(weight='light').order_by('armor_bonus')
    medium_armor = Armor.objects.filter(weight='medium').order_by('armor_bonus')
    heavy_armor = Armor.objects.filter(weight='heavy').order_by('armor_bonus')
    shields = Armor.objects.filter(weight='shield').order_by('armor_bonus')
    special = SpecialAbility.objects.all()
    return render(request, 'blog/monsterbuilderV4.html', {
            'monstertypes': monstertypes, 'melee_weapons': melee_weapons, 'ranged_weapons': ranged_weapons,
            'skills': skills, 'light_armor': light_armor, 'medium_armor': medium_armor, 'heavy_armor': heavy_armor,
            'shields': shields, 'feats' : feats, 'special': special, 'form': form})

def monster_builder_api_monstertype(request):
    if request.method == "GET":
        monstertypes = MonsterType.objects.all()
        serializer = MonsterTypeSerializer(monstertypes, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")
def monster_builder_api_skill(request):
    if request.method == "GET":
        skills = Skill.objects.all()
        serializer = SkillSerializer(skills, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")
def monster_builder_api_feat(request):
    if request.method == "GET":
        feats = Feat.objects.all()
        serializer = FeatSerializer(feats, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")
def monster_builder_api_weapon(request):
    if request.method == "GET":
        weapons = Weapon.objects.all()
        serializer = WeaponSerializer(weapons, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")
def monster_builder_api_armor(request):
    if request.method == "GET":
        armor = Armor.objects.all()
        serializer = ArmorSerializer(armor, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")
def monster_builder_api_special(request):
    if request.method == "GET":
        abilities = SpecialAbility.objects.all()
        serializer = SpecialAbilitySerializer(abilities, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return HttpResponse("Method not allowed")