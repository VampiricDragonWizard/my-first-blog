from math import ceil, floor
from urllib import request
from django.http import HttpResponse, JsonResponse
from django.views.generic.list import ListView
from django.shortcuts import render, get_object_or_404
from rest_framework.parsers import JSONParser
from .forms import MonsterForm
from .models import Monster, MonsterType, Skill, Feat, Weapon, Armor, SpecialAbility
from .serializers import (MonsterTypeSerializer, SkillSerializer, FeatSerializer,
                          WeaponSerializer, ArmorSerializer, SpecialAbilitySerializer)

# Views for the Monster Builder
def calculate_modifier(score):
    """
    Return tuple of ability score in the form (score, modifier).
    """
    # If the monster does not have this ability score, it doesn't have a modifier.
    # However, the modifier must be set to zero to be able to calculate with it.
    # In the template, however, a score of - shouldn't be accompanied by a modifier at all.
    # Those who do not live, do not have constitution scores
    if score == 0:
        ability = ("-", 0)
    else:
        modifier = floor((score - 10) / 2)
        ability = (score, modifier)
    return ability

def calculate_save(quality, hd, feat):
    if quality == "good":
        save = round(((hd+3)/2), ndigits=None)
    elif quality == "poor":
        save = floor((hd-1)/3)
        if save < 0:
            save = 0
    else:
        save = 0
    if feat:
        save += 2
    return save

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
    special = SpecialAbility.objects.all().order_by('name')
    return render(request, 'blog/monsterbuilderV4.html', {
            'monstertypes': monstertypes, 'melee_weapons': melee_weapons, 'ranged_weapons': ranged_weapons,
            'skills': skills, 'light_armor': light_armor, 'medium_armor': medium_armor, 'heavy_armor': heavy_armor,
            'shields': shields, 'feats' : feats, 'special': special, 'form': form})

class MonsterList(ListView):
    model = Monster
    template_name = 'monsterbuilder/monsterlist.html'
    context_object_name = "monsters"

def monster_statblock(request, pk):
    monster = get_object_or_404(Monster, pk=pk)
    # Ability Scores and Modifiers
    monster.strength = calculate_modifier(monster.strength)
    if monster.manufactured_armor.max_dex & monster.dexterity>monster.manufactured_armor.max_dex:
        monster.dexterity = calculate_modifier(monster.manufactured_armor.max_dex)
    else:
        monster.dexterity = calculate_modifier(monster.dexterity)
    monster.constitution = calculate_modifier(monster.constitution)
    monster.intelligence = calculate_modifier(monster.intelligence)
    monster.wisdom = calculate_modifier(monster.wisdom)
    monster.charisma = calculate_modifier(monster.charisma)
    # TODO: how to check if ManyToManyField has relationship with specific entry?
    monster.fortitude_save = calculate_save(monster.fortitude, monster.hd_number, False)
    monster.reflex_save = calculate_save(monster.reflex, monster.hd_number, False)
    monster.will_save = calculate_save(monster.will, monster.hd_number, False)
    # if feats include Improved Initative
    # monster.initiative = monster.dexterity[1] + 4
    # else
    monster.initiative = monster.dexterity[1]
    monster.bab = floor(monster.hd_number * monster.monstertype.atk_as)
    # TODO: filter qualities and attacks
    monster.special_qualities = monster.special_abilities
    monster.special_attacks = monster.special_abilities 
    return render(request, 'monsterbuilder/d20srd_stat.html', {'monster' : monster})


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