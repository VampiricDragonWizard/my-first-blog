from urllib import request

from django import forms
from .models import MonsterType, Armor, SIZE_MODIFIERS

# Note SIZE_MODIFIERS_FOR_CHOICES and ABILITY_SCORES_FOR_CHOICES
class MonsterForm(forms.Form):
    """ Add a monster to the database """
    name = forms.CharField(max_length=50)
    monstertype = forms.ModelChoiceField(queryset=MonsterType.objects.all(), to_field_name='name')
    # Note that a monstertype added via admin wont't show up here, so the form will consider it invalid. ModelChoiceField
    #monstersubtype = forms.ModelMultipleChoiceField(queryset=MonsterType.objects.all(), to_field_name='name', required=False)
    size = forms.ChoiceField(choices=['fine', 'diminutive', 'tiny', 'small', 'medium',
                                      'large', 'huge', 'gargantuan', 'colossal'])
    reach = forms.IntegerField(min_value=0)
    hd_number = forms.IntegerField(min_value=1)
    hd_fraction = forms.BooleanField(required=False)
    # hd number must be positive
    bonus_hp = forms.IntegerField(min_value=0)

    # Speeds
    speed = forms.IntegerField(min_value=0)
    burrow_speed = forms.IntegerField(min_value=0, required=False)
    climb_speed = forms.IntegerField(min_value=0, required=False)
    fly_speed = forms.IntegerField(min_value=0, required=False)
    fly_maneuverability = forms.ChoiceField(choices=['perfect', 'good', 'average', 'poor', 'clumsy'], required=False)
    # fly_maneuverability is required if and only if fly_speed is higher than 0
    swim_speed = forms.IntegerField(min_value=0, required=False)

    # Ability Scores
    strength = forms.IntegerField(min_value=0)
    dexterity = forms.IntegerField(min_value=0)
    constitution = forms.IntegerField(min_value=0)
    intelligence = forms.IntegerField(min_value=0)
    wisdom = forms.IntegerField(min_value=0)
    charisma = forms.IntegerField(min_value=0)

    # Saving Throws
    fortitude = forms.ChoiceField(choices=['good', 'poor'])
    reflex = forms.ChoiceField(choices=['good', 'poor'])
    will = forms.ChoiceField(choices=['good', 'poor'])

    natural_armor = forms.IntegerField(min_value=0, required=False)
    manufactured_armor = forms.ModelChoiceField(queryset=Armor.objects.filter(weight__in=['light', 'medium', 'heavy']),
                                                to_field_name="name", required=False)
    deflection_bonus = forms.IntegerField(min_value=0, required=False)
    worn_shield = forms.ModelChoiceField(queryset=Armor.objects.filter(weight='shield'),
                                         to_field_name="name", required=False)

    skills = forms.JSONField(required=False)
    feats = forms.JSONField(required=False)
    attacks = forms.JSONField(required=False)
    special_abilities = forms.JSONField(required=False)

    spells_at_will = forms.JSONField(required=False)
    spells_once_per_day = forms.JSONField(required=False)
    spells_thrice_per_day = forms.JSONField(required=False)
    spells_once_per_week = forms.JSONField(required=False)
    psionic_powers = forms.JSONField(required=False)

    # Secondary statistics
    climate = forms.ChoiceField(choices=['cold', 'temperate', 'warm'], required=False)
    terrain = forms.ChoiceField(choices=['aquatic', 'deserts', 'forests', 'hills', 'marshes',
                              'mountains', 'plains', 'underground'], required=False)
    plane = forms.CharField(required=False)
    organization = forms.CharField(required=False)
    challenge_rating = forms.FloatField(min_value=0, required=False)
    treasure = forms.CharField(required=False)
    alignment = forms.CharField(required=False)
    advancement = forms.CharField(required=False)
    monster_appearance = forms.CharField(required=False)
    monster_description = forms.CharField(required=False)

    # TODO:
    def clean(self):
        cleaned_data = super().clean()

        # Hit Dice
        if cleaned_data.get("hd_fraction"):
            hd_number = float(1/cleaned_data.get("hd_number"))
        else:
            hd_number = float(cleaned_data.get("hd_number"))
        print("HD calculated")
        # Skills
        # skill name is not allowed to be longer than 30 char
        # Feats
        # split into feat from Feat model and feat detail
