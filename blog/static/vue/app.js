// MonsterBuilder Vue file
const app = Vue.createApp({
    data() {
      return {
        // Name
        monsterName: '',
        // Size
        monsterSize: 'medium',
        monsterReach: 5,
        bodyShape: 'tall',
        // TODO: finish this section
        // Show on Page
        showSkillsSection: true,
        
        // Speed
        climbSpeed: 0,
        flySpeed: 0,
        swimSpeed: 0,
        // Hit Dice
        hdFraction: false,
        hdNumber: 1,
        hdType: 8,
        // Saves
        fortitudeQuality: 'open',
        reflexQuality: 'open',
        willQuality: 'open',
        // Type
        monsterType: 'Type',
        typeBaseSkillPoints: null,
        typeSkillPoints: null,
        typeBaseNumberOfFeats: null,
        typeNumberOfFeats: null,
        atkAs: 1.00,
        // Ability Scores
        strengthScore: 10,
        dexterityScore: 10,
        constitutionScore: 10,
        intelligenceScore: 10,
        wisdomScore: 10,
        charismaScore: 10,
        // Skills
        skillName: null,
        skillRanks: null,
        skillRacialBonus: null,
        skillDetail: null,
        totalRanks: 0,
        skillList: [],
        // Feats
        newFeat: null,
        featList: [],
        featDetail: null,
        showFeatDetail: false,
        featPrerequisites: [],
        // Attacks
        presetWeapon: null,
        attackName: null,
        weaponNumber: 1,
        weaponSize: null,
        weaponReach: null,
        weaponRange: null,
        attackForm: null,
        // attackTwoHanded is for manufactured weapons wielded with more than one hand or strong natural weapons
        attackTwoHanded: false,
        weaponDamage: null,
        specialEffect: null,
        magicWeapon: 0,
        weaponMaterial: null,
        attackList: [
          { atk_name: 'flaming longspear', number: 1, weapon_size: 'large', atk_form: 'melee', atk_modifier: 'strength', atk_bonus: 1, weapon_damage: '1d8',
          two_handed: true, damage_str_modifier: 1.5, crit_range: 1, crit_double: 2, special_effect: '1d4 fire', magic: 1, feats: [], material: 'manufactured', list: 'primary'},
          { atk_name: 'sting', number: 2, weapon_size: 'natural', atk_form: 'melee', atk_modifier: 'dexterity', atk_bonus: 1, weapon_damage: '1',
          two_handed: false, damage_str_modifier: 0.5, crit_range: 1, crit_double: 2, special_effect: 'poison', magic: 0, feats: [], material: 'natural', list: 'secondary'}
        ],
        // Armor
        naturalArmor: 0,
        manufacturedArmor: 'none',
        deflectionBonus: 0,
        wornShield: 'none',
        armorBonus: 0,
        armorPenalty: 0,
        maxDexBonus: null,
        // Spells and Psionics
        spellName: '',
        spellLevel: null,
        casterLevel: null,
        spellsAtWill: [],
        spellsOncePerDay: [],
        spellsThricePerDay: [],
        spellsOncePerWeek: [],
        psionicPowers: [],
        // Special Abilities
        specialPreset: null,
        specialAbility: null,
        specialCategory: null,
        specialType: '',
        specialDescription: '',
        specialShorthand: '',
        specialSave: 'none',
        specialSaveHalfOrNegate: null,
        specialSaveAbility: 'none',
        specialAbilities: [{special_name: 'Test1', special_type: 'Supernatural', category: 'attack', description: 'Range', save: 'Fortitude', half_negate: 'negate', save_base: 'STR'}, {special_name: 'Test2', special_type: 'Spell-like', category: 'attack', description: 'Range', save: 'Reflex', half_negate: 'half', save_base: 'CON'}],
        monsterTypeSpecialAbilities: [],
      };
    },
    computed: {
      // HD to use in calculations
      hdCalc() {
        if(this.hdFraction){
            return 1/this.hdNumber;
          }
        else {
          return this.hdNumber;
        }
      },
      // HD and hp as shown to the user
      hitDice() {
        let modifier = Math.floor(this.constitutionModifier * this.hdCalc) + this.bonusHitPoints;
        if(this.hdFraction){
          return '1/' + this.hdNumber + 'd' + this.hdType + ' + ' + modifier;
        }
        else {
          return this.hdNumber + 'd' + this.hdType  + ' + ' + modifier;
        }
      },
      bonusHitPoints() {
        let hp = 0;
        // Oozes gain bonus hp depending on size
        if (this.monsterType=="ooze" && this.monsterSizeModifier<2) {
            if (this.monsterSize=='small') {
                hp += 5;
            }
            else if (this.monsterSize=='medium') {
                hp += 10;
            }
            else if (this.monsterSize=='large') {
                hp += 15;
            }
            else if (this.monsterSize=='huge') {
                hp += 20;
            }
            else if (this.monsterSize=='gargantuan') {
                hp += 30;
            }
            else if (this.monsterSize=='colossal') {
                hp += 40;
            }
        }
        if (this.featList.includes("Toughness")) {
            hp += 3;
        }
        return hp;
      },
      monsterSizeModifier() {
        return sizeModifier(this.monsterSize);
      },
      baseAtkBonus() {
        return Math.floor(this.hdCalc * this.atkAs);
      },
      initiativeModifier() {
        if (this.featList.includes("Improved Initiative")) {
          return this.dexterityModifier + 4;
        }
        else {
          return this.dexterityModifier;
        }
      },
      strengthModifier() {
        return calculateModifier(this.strengthScore);
      },
      dexterityModifier() {
        let modifier = calculateModifier(this.dexterityScore)
        if (this.maxDexBonus && modifier > this.maxDexBonus) {
          return this.maxDexBonus;
        }
        else {
          return modifier;
        }
      },
      constitutionModifier() {
        return calculateModifier(this.constitutionScore);
      },
      intelligenceModifier() {
        return calculateModifier(this.intelligenceScore);
      },
      wisdomModifier() {
        return calculateModifier(this.wisdomScore);
      },
      charismaModifier() {
        return calculateModifier(this.charismaScore);
      },
      fortitudeSave() {
        let save = calculateSave(this.constitutionModifier, this.fortitudeQuality, this.hdCalc)
        if (this.featList.includes("Great Fortitude")) {
          return save + 2;
        }
        return save;
      },
      reflexSave() {
        let save = calculateSave(this.dexterityModifier, this.reflexQuality, this.hdCalc);
        if (this.featList.includes("Lightning Reflexes")) {
          return save + 2;
        }
        return save;
      },
      willSave() {
        let save = calculateSave(this.wisdomModifier, this.willQuality, this.hdCalc);
        if (this.featList.includes("Iron Will")) {
          return save + 2;
        }
        return save;
      },
      skillPoints() {
        let basePoints = this.typeBaseSkillPoints;
        // Base Skill Points
        // Aberrations, Beasts, Elementals, Fey, Magical Beasts, Monstrous Humanoids, Shapechangers and Undead multiply their base skill points by their Intelligence score.
        if (['aberration', 'beast', 'elemental', 'fey', 'magical beast', 'monstrous humanoid', 'shapechanger', 'undead'].includes(this.monsterType)) {
          basePoints = basePoints * this.intelligenceScore;
        }
        // Dragons, Giants, Humanoids and Outsiders add their Intelligence modifier to their base skill points.
        else if(['dragon', 'giant', 'humanoid', 'outsider'].includes(this.monsterType)) {
          basePoints = basePoints + this.intelligenceModifier;
        }
        // Skill Points per HD
        // Instead of EHD, Dragons and Outsiders multiply their basePoints with their HD. 
        if(['dragon', 'outsider'].includes(this.monsterType)) {
          return Math.floor(basePoints * this.hdCalc);
        }
        else {
          let extraHD = this.hdCalc;
          // EHD is HD minus size penalty
          if(this.monsterSize==='large') {
            extraHD = extraHD-2;
          }
          else if(this.monsterSize==='huge') {
            extraHD = extraHD-4;
          }
          else if(this.monsterSize==='gargantuan') {
            extraHD = extraHD-16;
          }
          else if(this.monsterSize==='colossal') {
            extraHD = extraHD-32;
          }
          else {
            extraHD = extraHD-1;
          }
          // EHD isn't allowed to be negative
          if(extraHD < 0) {
            extraHD = 0;
          }
          return basePoints + this.typeSkillPoints * extraHD;
        }
      },
      numberOfFeats() {
        // TODO: EHD or HD?
        return this.typeBaseNumberOfFeats + (Math.floor((this.hdCalc-1)/4) * this.typeNumberOfFeats);
      },
      showSkillDetail() {
        return ['Craft,INT', 'Knowledge,INT', 'Profession,WIS', 'Perform,CHA'].includes(this.skillName);
      },
      armorClass() {
        return 10 + this.naturalArmor + this.armorBonus + this.dexterityModifier;
      },
      /*
      allSpecialAbilities() {
        return this.specialAbilities.concat(this.monsterTypeSpecialAbilities);
      }
      */
    },
    methods: {
       assignType() {
        const typeCharacteristics = monsterTypeCharacteristics(this.monsterType);
        this.hdType = typeCharacteristics.hdType;
        this.fortitudeQuality = typeCharacteristics.fortitudeQuality;
        this.reflexQuality = typeCharacteristics.reflexQuality;
        this.willQuality = typeCharacteristics.willQuality;
        this.typeBaseSkillPoints = typeCharacteristics.typeBaseSkillPoints;
        this.typeSkillPoints = typeCharacteristics.typeSkillPoints;
        this.typeBaseNumberOfFeats = typeCharacteristics.typeBaseNumberOfFeats;
        this.typeNumberOfFeats = typeCharacteristics.typeNumberOfFeats;
        this.atkAs = typeCharacteristics.atkAs;
        if (this.monsterType==='construct' || this.monsterType==='undead') {
          this.constitutionScore = 0;
        }
        else if (this.monsterType==='ooze') {
          this.intelligenceScore = 0;
          this.featList.push("Blindfight");
          // Bonus hp under bonusHitPoints
        }
        else if (this.monsterType==='vermin') {
          this.intelligenceScore = 0;
        }
        else if (this.monsterType==='animal' && this.intelligenceScore>2) {
          this.intelligenceScore = 2;
        }
        // Remove special abilities gained from previous monstertype
        this.monsterTypeSpecialAbilities = [];
        for (ability of typeCharacteristics.specialAbilities) {
          const newAbility = {
            special_name: ability.name,
            category: ability.category,
            description: ability.description,
            shorthand: ability.shorthand,
            special_type: '',
          };
          this.monsterTypeSpecialAbilities.push(newAbility);
        }
      },
      getModifier(modifier) {
        switch (modifier) {
          case 'STR':
            return this.strengthModifier;
          case 'DEX':
            return this.dexterityModifier;
          case 'CON':
            return this.constitutionModifier;
          case 'INT':
            return this.intelligenceModifier;
          case 'WIS':
            return this.wisdomModifier;
          case 'CHA':
            return this.charismaModifier;
        }
      },
      typicalReach() {
        if (this.monsterSizeModifier>1) {
            this.monsterReach = 0;
        }
        else if (this.monsterSizeModifier>=0 || (this.monsterSize=='large' && this.bodyShape=='long')) {
            this.monsterReach = 5;
        }
        else if ((this.monsterSize=='large' && this.bodyShape=='tall') || (this.monsterSize=='huge' && this.bodyShape=='long')) {
            this.monsterReach = 10;
        }
        else if ((this.monsterSize=='huge' && this.bodyShape=='tall') || (this.monsterSize=='gargantuan' && this.bodyShape=='long')) {
            this.monsterReach = 15;
        }
        else if ((this.monsterSize=='gargantuan' && this.bodyShape=='tall') || (this.monsterSize=='colossal' && this.bodyShape=='long')) {
            this.monsterReach = 20;
        }
        else {
            this.monsterReach = 30;
        }
      },
      addSkill() {
      //TODO: add bonuses from synergies
        // Split values from form
        const skillValue = this.skillName.split(",");
        if (!this.skillRanks) {
            this.skillRanks = 0;
        }
        if (!this.skillRacialBonus) {
            this.skillRacialBonus = 0;
        }
        // Create dictionary for list entry
        let skill = {
          skill_name: skillValue[0],
          modifier: skillValue[1],
          ranks: this.skillRanks,
          racial_bonus: this.skillRacialBonus,
          feat_bonus: 0,
          size_modifier: 0,
        };
        // If skill has variations, the specific variant must be added to the name
        if (this.skillDetail) {
            skill.skill_name = skill.skill_name + " (" + this.skillDetail + ")"
        }
        // Hide skill size modifiers
        if (skill.skill_name=='Hide') {
            skill.size_modifier = sizeModifier(this.monsterSize) * 4;
        }
        // Feats
        if (this.featList.includes('Alertness') && ['Listen', 'Spot'].includes(skill.skill_name)) {
            skill.feat_bonus += 2;
        }
        if (this.featList.includes('Combat Casting') && ['Concentration'].includes(skill.skill_name)) {
            skill.feat_bonus += 4;
        }
        /* template(var FEATNAME, LISTOFRELEVANTSKILLS, SKILLBONUS)
        //if (this.featList(includes(FEATNAME) && LISTOFRELEVANTSKILLS.includes(skill.skill_name)) {
            //skill.feat_bonus += SKILLBONUS;
        //}
        */
        if (this.featList.includes(`Skill Focus(${skill.skill_name})`)) {
            skill.feat_bonus += 2;
        }
        // TODO: skill synergies
        
        // Undead spellcasters use Charisma instead of Constitution for Concentration checks
        if (skill.skill_name=='Concentration' && this.monsterType=='undead') {
            skill.modifier = 'CHA';
        }
        // Deduct ranks from total skill ranks
          this.totalRanks = this.totalRanks + this.skillRanks;
        // Update document
        this.skillList.push(skill);
        
        // Reset form
        this.skillName = null;
        this.skillRanks = null;
        this.skillRacialBonus = null;
        this.skillDetail = null;
      },
      editSkill(item) {
        const skill = this.skillList[item];
        this.skillName = skill.skill_name + "," + skill.modifier;
        this.skillRanks = skill.ranks;
        this.skillRacialBonus = skill.racial_bonus;
        this.skillDetail = skill.detail;
      },
      deleteSkill(item) {
        this.totalRanks -= this.skillList[item].ranks;
        this.skillList.splice(item, 1);
      },
      skillModifier(skill) {
        return skill.ranks + skill.racial_bonus + skill.feat_bonus + skill.size_modifier + this.getModifier(skill.modifier);
      },
      selectFeat() {
        const featInfo = featInformation(this.newFeat);
        this.showFeatDetail = featInfo.has_detail;
        this.featPrerequisites = [];
        for (p of featInfo.prerequisites) {
          this.featPrerequisites.push(p);
        }
      },
      addFeat() {
        let feat = this.newFeat;
        if (this.featDetail) {
          feat += ' (' + this.featDetail + ')';
        }
        this.featList.push(feat);
        this.newFeat = null;
        this.featDetail = null;
      },
      deleteFeat(item) {
        this.featList.splice(item, 1);
      },
      presetAttack() {
        // Set properties used to create attack according to selected preset
        this.attackName = this.presetWeapon;
        const weaponInfo = weaponInformation(this.presetWeapon);
        this.weaponSize = weaponInfo.weaponSize;
        this.attackForm = weaponInfo.attackForm;
        this.weaponDamage = weaponInfo.weaponDamage;
        this.weaponMaterial = weaponInfo.weaponMaterial;
      },
      addAttack(e) {
      // TODO: only essential information in list: atk_name, number, weapon_size, atk_form, magic_bonus, weapon_damage, damage_modifier: strength bonus/penalty and how high, special_effect, two_handed?, material, list        
        if (this.weaponMaterial=='natural') {
          // Create natural attack entry
          let attack = {
            group: this.attackGroup, //TODO: create
            sole: this.attackTwoHanded,
            form: this.attackForm,
            atk_name: this.attackName,
            number: this.weaponNumber,
            reach: this.weaponReach,
            range: this.weaponRange,
            weapon_damage: this.weaponDamage,
            crit_range: //TODO: create,
            crit_double: //TODO: create,
            special_effect: this.specialEffect,
            magic: this.magicWeapon,
          };
          // Update List
          this.naturalAttackList.push(attack); //TODO: create
        }
        else {
          // Create manufactured attack entry
          let attack = {
            hand: this.weaponHand, //TODO: create
            form: this.attackForm,          
            weapon_size: this.weaponSize,
            atk_name: this.attackName,
            number: this.weaponNumber,
            reach: this.weaponReach,
            range: this.weaponRange,
            weapon_damage: this.weaponDamage,
            crit_range: ,//TODO: create,
            crit_double: ,//TODO: create,
            special_effect: this.specialEffect,
            magic: this.magicWeapon,
            }
          // Update List
          this.manufacturedAttackList.push(attack); //TODO: create
        };
        console.log(attack);
        // Reset form
        this.attackName = null;
        this.weaponNumber = 1;
        this.weaponSize = null;
        this.attackForm = null;
        this.weaponDamage = null;
        this.specialEffect = null;
        this.magicWeapon = 0;
        this.attackTwoHanded = false;
        this.weaponMaterial = null;
      },
      editAttack(item) {
        // Put values from list item into form
        const attack = this.attackList[item];
        this.weaponHand = attack.hand;
        this.attackGroup = attack.group;
        this.attackTwoHanded = attack.sole;
        this.attackForm = attack.form;
        this.weaponSize = attack.weapon_size;
        this.attackName = attack.atk_name;
        this.weaponNumber = attack.number;
        this.weaponReach = attack.reach;
        this.weaponRange = attack.range;
        this.weaponDamage = attack.weapon_damage;
        //TODO: create = attack.crit_range;
        //TODO: create = attack.crit_double;
        this.specialEffect = attack.special_effect;
        this.magicWeapon = parseInt(attack.magic);
      },
      deleteAttack(item) {
        this.attackList.splice(item, 1);
      },
      // TODO:  add extra attacks manufactured weapons
      calculateManufacturedAttackBonus(form, hand, multiple, size) {
        if (multiple) {
          let multiWeaponFightingPenalty = 2;
          if (sizeModifier(size)>=this.monsterSizeModifier) {
            multiWeaponFightingPenalty += 2;
          }
          if (!this.featList.includes('Multifighting') || !this.featList.includes('Two-Weaponfighting')) {
            multiWeaponFightingPenalty += 2;
          }
          let attackArray = [];
          attackArray.push(this.calculateManufacturedAttackBonus(form, 'one-handed', false, size) - multiWeaponFightingPenalty);
          for (let i=0; i<NUMBER_OF_ATTACKS, i++) {
            attackArray.push(this.calculateManufacturedAttackBonus(form, 'off-hand', false, size) - multiWeaponFightingPenalty);
          }
          return attackArray;
        }
        else {
          if (melee) {
            if (hand=='off-hand' && !(this.featList.includes('Ambidexterity') || this.featList.includes('Multidexterity'))) {
              this.strengthModifier-4;
            }
            else {
              this.strengthModifier;
            }
          }
          else {
            this.dexterityModifier;
          }
        }
      },
      calculateManufacturedDamageBonus(form, hand, multiple, name, size) {
        if (multiple) {
          let damageArray = [];
          damageArray.push(this.calculateManufacturedDamageBonus(form, 'one-handed', false, name, size));
          if (form=='melee') {
            if (this.strengthModifier<0) {
              damageArray.push(this.strengthModifier);
            }
            else {
              damageArray.push(this.strengthModifier*0.5);
            }
          }
          else if (form=='ranged' && this.strengthModifier<0 && ((name.includes('bow') && !name.includes('crossbow')) || name.includes('sling'))) {
            damageArray.push(this.strengthModifier);
          }
          else {
            damageArray.push(0);
          }
          return damageArray;
        }
        else {
          if (form=='ranged') {
            if((this.strengthModifier<0 && ((name.includes('bow') && !name.includes('crossbow')) || name.includes('sling'))) || (this.strengthModifier>0 && name.includes('composite'))) {
              return this.strengthModifier;
            }
            else {
              return 0;
            }
          }
          else if (this.strengthModifier>0 && hand=='off-hand') {
            return this.strengthModifier * 0.5;
          }
          else if (this.strengthModifier>0 && form=='melee' && hand=='two-handed' && sizeModifier(size)>=this.monsterSizeModifier) {
            return this.strengthModifier * 1.5;
          }
          else {
            return this.strengthModifier;
          }
        }
      },
      calculateNaturalAttackBonus(group, form, sole) {
        let penalty = 0;
	    if(group=='secondary') {
	      if(this.featList.includes('Multiattack')) {
	        penalty = 2;
	      }
	      else {
	        penalty = 5;
	      }
	    if (form=='melee') {
	      return this.strengthModifier - penalty;
	    }
	    else {
		  return this.dexterityModifier - penalty;
		}
	  },
	  calculateNaturalDamageBonus(group, form, sole){
	    if (form=='ranged') {
	     return 0
	    }
	    else {
	      if (this.strengthModifier>0) {
	        if (sole) {
	          return this.strengthModifier*1.5
	        }
	        else if(group=='secondary') {
	          return this.strengthModifier*0.5
	        }
	        else {
	          return this.strengthModifier
	        }
	      }
	      else {
	        return this.strengthModifier
	      }
	    }
	  },
      armorCalculations() {
        // TODO: this can probably be done more efficiently
        // Armor
        if (this.manufacturedArmor=='none') {
          this.armorBonus = 0;
          this.armorPenalty = 0;
          this.maxDexBonus = null;
        }
        else {
          const armorInfo = armorInformation(this.manufacturedArmor);
          this.armorBonus = armorInfo.armorBonus;
          this.armorPenalty = armorInfo.armorPenalty;
          this.maxDexBonus = armorInfo.maxDexBonus;
        }
        if (this.wornShield != 'none') {
          // Shield
          const shieldInfo = shieldInformation(this.wornShield);
          // Is shield penalty added, or use highest?
          this.armorBonus += shieldInfo.armorBonus;
          this.armorPenalty -= shieldInfo.armorPenalty;
        }
      },
      addSpell(list) {
        // TODO: spellLevel, casterLevel attacks saves
        if (list=='atWill') {
          this.spellsAtWill.push(this.spellName);
        }
        else if (list=='onceDay') {
          this.spellsOncePerDay.push(this.spellName);
        }
        else if (list=='thriceDay') {
          this.spellsThricePerDay.push(this.spellName);
        }
        else if (list=='onceWeek') {
          this.spellsOncePerWeek.push(this.spellName);
        }
        else if (list=='psionics') {
          this.psionicPowers.push(this.spellName);
        }
        this.spellName = '';
      },
      presetSpecialAbility() {
        this.specialAbility = this.specialPreset;
        let specialInfo = specialInformation(this.specialPreset, this.monsterName);
        this.specialDescription = specialInfo.description;
        this.specialShorthand = specialInfo.shorthand;
        this.specialCategory = specialInfo.category;
        this.specialSave = specialInfo.save_type;
        this.specialSaveHalfOrNegate = specialInfo.save_effect;
        this.specialSaveAbility = specialInfo.save_ability;
      },
      addSpecialAbility() {     
        const newAbility = {
          special_name: this.specialAbility,
          category: this.specialCategory,
          special_type: this.specialType,
          description: this.specialDescription,
          shorthand: this.specialShorthand,
          save: this.specialSave,
          half_negate: this.specialSaveHalfOrNegate,
          save_base: this.specialSaveAbility,
          };
          console.log(newAbility);
        this.specialAbilities.push(newAbility);
      },
      deleteSpecialAbility(item, list) {
        if (list=='fromType') {
          this.monsterTypeSpecialAbilities.splice(item, 1);
        }
        else {
          this.specialAbilities.splice(item, 1);
        }
      },
      editSpecialAbility(item, list) {
        let ability = {};
        if (list=='fromType') {
          ability = this.monsterTypeSpecialAbilities[item];
        }
        else {
          ability = this.specialAbilities[item];
        }
        this.specialAbility = ability.special_name;
        this.specialCategory = ability.category;
        this.specialDescription = ability.description;
        this.specialSave = ability.save;
        this.specialSaveHalfOrNegate = ability.half_negate;
        this.specialSaveAbility = ability.save_base;
      },
      saveDC(modifier, ability) {
        // Vermin gain a Venom DC bonus depending on size
        if (ability=='Venom' && this.monsterType=='vermin' && this.monsterSizeModifier<1) {
            if (this.monsterSize=='medium') {
                return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier) +2;
            }
            else if (this.monsterSize=='large') {
                return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier) +4;
            }
            else if (this.monsterSize=='huge') {
                return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier) +6;
            }
            else if (this.monsterSize=='gargantuan') {
                return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier) +8;
            }
            else if (this.monsterSize=='colossal') {
                return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier) +10;
            }
        }
        else {
            return Math.floor(10 + (0.5 * this.hdCalc)) + this.getModifier(modifier);
        }
      }
    },
    watch: {
      monsterType(newType, oldType) {
        if (oldType=='ooze') {
          this.featList.splice(this.featList.indexOf("Blindfight"), 1);
        }
      },
    },
  });
