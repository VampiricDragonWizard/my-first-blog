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
        # TODO: 'MonsterForm' object has no attribute 'cleaned_data'
        if form.is_valid:
            print("Form is valid")
            # TODO:
            monster = Monster(
                name = form.cleaned_data["name"],
                hd_number = form.cleaned_data["hd_number"],
                bonus_hp = form.cleaned_data["bonus_hp"],
                monstertype = form.cleaned_data["monstertype"],
                size = form.cleaned_data["size"],
                reach = form.cleaned_data["reach"],
                strength = form.cleaned_data["strength"],
                dexterity = form.cleaned_data["dexterity"],
                consitution = form.cleaned_data["consitution"],
                intelligence = form.cleaned_data["intelligence"],
                wisdom = form.cleaned_data["wisdom"],
                charisma = form.cleaned_data["charisma"],
                fortitude = form.cleaned_data["fortitude"],
                reflex = form.cleaned_data["reflex"],
                will = form.cleaned_data["will"],
                speed = form.cleaned_data["speed"],
                speed_burrow = form.cleaned_data["burrow_speed"],
                speed_climb = form.cleaned_data["climb_speed"],
                speed_fly = form.cleaned_data["fly_speed"],
                speed_fly_maneuverability = form.cleaned_data["fly_maneuverability"],
                speed_swim = form.cleaned_data["swim_speed"],
                attacks = form.cleaned_data["attacks"],
                natural_armor = form.cleaned_data["natural_armor"],
                manufactured_armor = form.cleaned_data["manufactured_armor"],
                shield = form.cleaned_data["worn_shield"],
                deflection_bonus = form.cleaned_data["deflection_bonus"],
                special_abilities = form.cleaned_data["special_abilities"],
                spells_at_will = form.cleaned_data["spells_at_will"],
                spells_once_per_day = form.cleaned_data["spells_once_per_day"],
                spells_thrice_per_day = form.cleaned_data["spells_thrice_per_day"],
                spells_once_per_week = form.cleaned_data["spells_once_per_week"],
                psionic_powers = form.cleaned_data["psionic_powers"],
                climate = form.cleaned_data["climate"],
                terrain = form.cleaned_data["terrain"],
                plane = form.cleaned_data["plane"],
                organization = form.cleaned_data["organization"],
                challenge_rating = form.cleaned_data["challenge_rating"],
                treasure = form.cleaned_data["treasure"],
                alignment = form.cleaned_data["alignment"],
                advancement = form.cleaned_data["advancement"],
                monster_appearance = form.cleaned_data["monster_appearance"],
                monster_description = form.cleaned_data["monster_description"],
            )
            # subtypes
            # skills
                # for skill in skills:
                    # if skill not in Skill model, add it to model
                        # s1 = Skill(name=skill.skill_name, modifier=skill.modifier)
                        # s1.save()
                    # create through table entry
                    # skillranks1 = SkillRanks(monster=monster, skill=skill from Skill model, ranks=skill.ranks, racial_bonus=skill.racial_bonus)
                    # skillranks1.save()
            # feats
                # for feat in feats:
                    # featdetails1 = FealDetails(monster=monster, feat=feat from Feat model, detail=feat.detail)
                    # featdetails1.save()
            # monster.save()
            print("monster is saved")
            return HttpResponse("OK")
            if request.POST['action'] == 'show':
                print("showing monster")
                return render(request, 'monsterbuilder/alexandrian_stat.html', {'monster': monster})
            else:
                return HttpResponse("Invalid action")
            #print("failed to create monster")
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
    #if source == "d20srd":
    #    template = "monsterbuilder/d20srd_stat.html"
    #    # Following section only applies to d20srd
    #    monster.manufactured_attacks = list(filter(lambda attack: attack["nature"] == 'manufactured', monster.attacks))
    #    natural_attacks = list(filter(lambda attack: attack["nature"] == 'natural', monster.attacks))
    #    monster.primary_natural_attacks = list(filter(lambda attack: attack["group"] == 'primary', natural_attacks))
    #    monster.secondary_natural_attacks = list(filter(lambda attack: attack["group"] == 'secondary', natural_attacks))
    #elif source == "Alexandrian":
    template = "monsterbuilder/alexandrian_stat.html"
    monster.melee_attacks = list(filter(lambda attack: attack["form"]=="melee", monster.attacks))
    monster.ranged_attacks = list(filter(lambda attack: attack["form"]=="ranged" or attack["form"]=="thrown", monster.attacks))
   # else:
    #    return HttpResponse("404")
    # Ability Scores and Modifiers
    monster.strength = calculate_modifier(monster.strength)
    if monster.manufactured_armor:
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
    monster.display_size = monster.get_size_display()
    monster.hp_modifier = monster.constitution[1] * monster.hd_number + monster.bonus_hp
    monster.hp_average = floor(((monster.monstertype.hd_type/2)+monster.hp_modifier)*monster.hd_number)
    monster.ac_touch = 10 + monster.deflection_bonus + monster.dexterity[1] + monster.size
    monster.ac = monster.ac_touch + monster.natural_armor
    if monster.manufactured_armor:
        monster.ac += monster.manufactured_armor.armor_bonus
    if monster.shield:
        monster.ac += monster.shield.armor_bonus
    monster.ac_flat = monster.ac - monster.dexterity[1]
    monster.bab = floor(monster.hd_number * monster.monstertype.atk_as)
    monster.grapple = monster.bab + monster.strength[1] + monster.size * -4


    # monster.armor, monster.space, monster.casterlevelspells
    # TODO: filter qualities and attacks
    if monster.special_abilities:
        monster.senses = list(filter(lambda ability: ability["category"]=="sense", monster.special_abilities))
        monster.immunities = list(filter(lambda ability: ability["category"]=="immunity", monster.special_abilities))
        monster.resistance = list(filter(lambda ability: ability["category"] == "resistance", monster.special_abilities))
        monster.vulnerabilities = list(filter(lambda ability: ability["category"] == "vulnerability", monster.special_abilities))
        monster.special_attacks = list(filter(lambda ability: ability["category"]=="attack", monster.special_abilities))
        monster.environment = monster.get_climate_display() + ' ' + monster.get_terrain_display()
    return render(request, template, {'monster' : monster})


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