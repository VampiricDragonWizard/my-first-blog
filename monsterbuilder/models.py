from urllib.request import CacheFTPHandler
from xmlrpc.client import SafeTransport

from django.db import models
from django.conf import settings
from mysite import settings

# Sizes
SIZE_COLOSSAL = -8
SIZE_GARGANTUAN = -4
SIZE_HUGE = -2
SIZE_LARGE = -1
SIZE_MEDIUM = 0
SIZE_SMALL = 1
SIZE_TINY = 2
SIZE_DIMINUTIVE = 4
SIZE_FINE = 8

SIZE_MODIFIERS = [
    (SIZE_COLOSSAL, "colossal"),
    (SIZE_GARGANTUAN, "gargantuan"),
    (SIZE_HUGE, "huge"),
    (SIZE_LARGE, "large"),
    (SIZE_MEDIUM, "medium"),
    (SIZE_SMALL, "small"),
    (SIZE_TINY, "tiny"),
    (SIZE_DIMINUTIVE, "diminutive"),
    (SIZE_FINE, "fine"),
]
ABILITY_SCORES = [
    ("STR", "Strength"),
    ("DEX", "Dexterity"),
    ("CON", "Constitution"),
    ("INT", "Intelligence"),
    ("WIS", "Wisdom"),
    ("CHA", "Charisma"),
]
#FLY_MANEUVERABILITY = [
#    'perfect', 'good', 'average', 'poor', 'clumsy'
#]
ARMOR_WEIGHT = [
    ("light", "Light"),
    ("medium", "Medium"),
    ("heavy", "Heavy"),
    ("shield", "Shield")
]
SAVE_QUALITY = [
    ("good", "Good"),
    ("poor", "Poor"),
    ("open", "Undecided")
]
SAVING_THROWS = [
    ("FORT", "Fortitude"),
    ("REF", "Reflex"),
    ("WILL", "Will")
]
ATTACK_FORM = [
    ("melee", "Melee"),
    ("ranged", "Ranged"),
    ("thrown", "Thrown"),
]
SAVE_EFFECT = [
    ("negates", "Negates"),
    ("halves", "Halves"),
]
CATEGORY = [
    ("attack", "Attack"),
    ("immunity", "Immunity"),
    ("resistance", "Resistance"),
    ("vulnerability", "Vulnerability"),
    ("sense", "Sense"),
    ("quality", "Quality"),
]
TEMPERATURE = [
    ("any", "Any"),
    ("cold", "Cold"),
    ("temp", "Temperate"),
    ("warm", "Warm"),
]
TERRAIN = [
    ("any", "Any"),
    ("aquatic", "Aquatic"),
    ("deserts", "Deserts"),
    ("forests", "Forests"),
    ("hills", "Hills"),
    ("marshes", "Marshes"),
    ("mountains", "Mountains"),
    ("plains", "Plains"),
    ("underground", "Underground"),
]
# Model for the monster itself
class Monster(models.Model):
    name = models.CharField(max_length=50, blank=False, null=False)
    # hd_number should be positive
    hd_number = models.FloatField(blank=False, null=False)
    bonus_hp = models.IntegerField(blank=True, default=0)
    monstertype = models.ForeignKey('monsterbuilder.MonsterType', on_delete=models.PROTECT, related_name="+", blank=False, null=False)
    subtypes = models.ManyToManyField('monsterbuilder.MonsterSubType')
    size = models.IntegerField(choices=SIZE_MODIFIERS, default=0)
    reach = models.IntegerField(choices=SIZE_MODIFIERS, default=0)

    # Ability Scores
    # The modifier does not have to be stored in the model. It's easily calculated from the score.
    strength = models.IntegerField(default=10)
    dexterity = models.IntegerField(default=10)
    constitution = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)
    wisdom = models.IntegerField(default=10)
    charisma = models.IntegerField(default=10)
    # Saves
    # The monster's quality of saves can differ from what is common for its type.
    fortitude = models.CharField(max_length=4, blank=False, null=False, choices=SAVE_QUALITY)
    reflex = models.CharField(max_length=4, blank=False, null=False, choices=SAVE_QUALITY)
    will = models.CharField(max_length=4, blank=False, null=False, choices=SAVE_QUALITY)
    # Speeds
    speed = models.IntegerField(default=30)
    speed_burrow = models.IntegerField(default=0, blank=True)
    speed_climb = models.IntegerField(default=0, blank=True)
    speed_fly = models.IntegerField(default=0, blank=True)
    speed_fly_maneuverability = models.CharField(max_length=7, blank=True, null=False)
    speed_swim = models.IntegerField(default=0, blank=True)
    # with climb or swim speed: get +8 racial bonus in climb or swim

    # Attacks
    # natural, manufactured, special
    attacks = models.JSONField(null=True, blank=True)

    # Armor Class
    natural_armor = models.IntegerField(default=0)
    manufactured_armor = models.ForeignKey('monsterbuilder.Armor', on_delete=models.PROTECT,
                                           blank=True, null=True, related_name='monster_armor')
    shield = models.ForeignKey('monsterbuilder.Armor', on_delete=models.PROTECT,
                               blank=True, null=True, related_name='monster_shield')
    deflection_bonus = models.IntegerField(default=0)
    # natural, manufactured, deflection bonus

    skills = models.ManyToManyField('monsterbuilder.Skill', through="SkillRanks")
    feats = models.ManyToManyField('monsterbuilder.Feat', through="FeatDetails")
    special_abilities = models.JSONField(null=True, blank=True)

    climate = models.CharField(max_length=4, choices=TEMPERATURE, default="Any")
    terrain = models.CharField(max_length=11, choices=TERRAIN, default="Any")
    plane = models.TextField(null=True)
    organization = models.TextField(null=True)
    challenge_rating = models.FloatField(null=True)
    treasure = models.TextField(null=True)
    alignment = models.TextField(null=True)
    advancement = models.TextField(null=True)
    monster_appearance = models.TextField(null=True)
    monster_description = models.TextField(null=True)
    #author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    #created_at = models.DateTimeField(auto_now_add=True)
    #updated_at = models.DateTimeField(auto_now=True)

# Models containing data for the Monster Builder
class MonsterType(models.Model):
    name = models.CharField(max_length=18, unique=True)
    hd_type = models.IntegerField()
    atk_as = models.FloatField()
    # Fortitude, Reflex and Will saves can be good, poor or open
    fortitude = models.CharField(max_length=4, choices=SAVE_QUALITY)
    reflex = models.CharField(max_length=4, choices=SAVE_QUALITY)
    will = models.CharField(max_length=4, choices=SAVE_QUALITY)
    base_skill_points = models.IntegerField()
    # skill_points refers to the number for skill points per EHD above 1,
    skill_points = models.IntegerField()
    base_number_of_feats = models.IntegerField()
    # number of feats per 4 extra HD
    number_of_feats = models.IntegerField()
    # Through table for description?
    monster_special_abilities = models.JSONField(null=True, blank=True)

    def __str__(self):
        return (f"{self.name} ({self.hd_type}, {self.atk_as}, {self.fortitude}, {self.reflex}, {self.will},"
                 f"{self.base_skill_points}, {self.skill_points}, {self.base_number_of_feats}, {self.number_of_feats},"
                 f"{self.monster_special_abilities})")

class MonsterSubType(models.Model):
    name = models.CharField(max_length=18, unique=True)
    subtype_special_abilities = models.JSONField(null=True, blank=True)


class Skill(models.Model):
    name = models.CharField(max_length=20)
    modifier = models.CharField(max_length=3, choices=ABILITY_SCORES)
    # If you have 5+ ranks in this skill, you get a +2 synergy bonus in all its synergistic skills.
    # The synergy column contains the skills that receive a bonus if the entry's skill has 5 ranks.
    # TODO: add synergy for profession (herbalist) to table
    synergy = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="synergy_provider")

    def __str__(self):
         return f"{self.name} ({self.modifier}, {self.synergy})"

# Through table for Monster and Skill. Stores the number of ranks the monster has in each skill.
class SkillRanks(models.Model):
    monster = models.ForeignKey(Monster, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    ranks = models.IntegerField(default=0)
    racial_bonus = models.IntegerField(default=0)
    # Maybe a link with feats for bonuses on skills given by that feat?

# Feats
class Feat(models.Model):
    name = models.CharField(max_length=20)
    # Proficienies as feats or as separate thing?
    # prerequisites list of dicionaries {kind: feat/ability/base attack bonus/class,
    # which: feat/class/ability minimum: ability/spellcaster level/base attack bonus/character level}
    # if (kind == feat) { which? }
    # if (kind == ability) { which>=minimum? }
    # if (kind == class) { which (any) or which (spellcaster) or which (class) >= minimum? }
    # if (kind == BAB) { >minimum? }
    prerequisite = models.JSONField(null=True, blank=True)
    # has detail?
    has_detail = models.BooleanField(default=False)
    # what it does

    def __str__(self):
         return f"{self.name} ({self.prerequisite}, {self.has_detail})"

class FeatDetails(models.Model):
    monster = models.ForeignKey(Monster, on_delete=models.CASCADE)
    feat = models.ForeignKey(Feat, on_delete=models.CASCADE)
    details = models.TextField(default="")

class SpecialAbility(models.Model):
    # TODO: re-add saves
    name = models.CharField(max_length=30, unique=True)
    description = models.TextField(null=True, blank=True)
    shorthand = models.CharField(null=True, blank=True, max_length=30)
    save_type = models.CharField(max_length=4, null=True, blank=True, choices=SAVING_THROWS)
    save_effect = models.CharField(max_length=7, null=True, blank=True, choices=SAVE_EFFECT)
    save_ability = models.CharField(max_length=3, choices=ABILITY_SCORES, null=True, blank=True)
    category = models.CharField(max_length=15, choices=CATEGORY)

    def __str__(self):
         return (f"{self.name} ({self.description}, {self.shorthand}, {self.category}"
                 f"{self.save_type}, {self.save_effect}, {self.save_ability})")

#class SpecialAbilityDescription(models.Model):
    #monstertype = models.ForeignKey(MonsterType, on_delete=models.CASCADE)

# Manufactured weapons
class Weapon(models.Model):
    name = models.CharField(max_length=30, unique=True)
    size = models.IntegerField(choices=SIZE_MODIFIERS)
    damage = models.CharField(max_length=10)
    atk_form = models.CharField(max_length=6, choices=ATTACK_FORM)
    proficiency = models.CharField(max_length=7)
    # TODO: Add crit ranges and doubles
    # TODO: Reach/Range
    # Number of numbers on which a weapon threatens a crit
    crit_range = models.IntegerField(default=1)
    crit_double = models.CharField(max_length=5, default='✕2')
    range_increment = models.IntegerField(default=0)
    reach = models.BooleanField(default=False)
    double = models.BooleanField(default=False)


    def __str__(self):
         return f"{self.name} ({self.damage}, {self.size}, {self.atk_form}, {self.proficiency})"

class Armor(models.Model):
    name = models.CharField(max_length=30, unique=True)
    weight= models.CharField(max_length=6)
    armor_bonus = models.IntegerField()
    max_dex = models.IntegerField(null=True)
    armor_penalty = models.IntegerField()
    arcane_failure = models.IntegerField()

    def __str__(self):
        return (f"{self.name} ({self.weight}, {self.armor_bonus},"
                f"{self.max_dex}, {self.armor_penalty}, {self.arcane_failure})")