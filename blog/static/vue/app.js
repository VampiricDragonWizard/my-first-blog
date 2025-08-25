function calculateSave(modifier, quality, hd) {
  if (quality==='good') {
    let save = Math.floor(hd/2)+2;
    return save + modifier;
  }
  else if (quality==='poor') {
    let save = Math.floor(hd/3);
    if (save<0) {
      save = 0;
    }
    return save + modifier;
  }
  else {
    return '';
  }
}
function calculateModifier(score) {
  if (typeof(score==='number') && score>0) {
    let modifier = Math.floor((score - 10)/2);
    return modifier;
  }
  else {
    return 0;
  }
}
  function sizeModifier(size) {
    switch(size) {
      case 'fine':
        return 8;
        break;
      case 'diminutive':
        return 4;
        break;
      case 'tiny':
        return 2;
        break;
      case 'small':
        return 1;
        break;
      case 'medium':
        return 0;
        break;
      case 'large':
        return -1;
        break;
      case 'huge':
        return -2;
        break;
      case 'gargantuan':
        return -4;
        break;
      case 'colossal':
        return -8;
        break;
      /*
      Actually natural attacks are 2 size categories smaller than the monster,
      but because this method is only used for attacks to check if they're smaller than the monster,
      this should work.
      */
      case 'natural':
        return 10;
        break;
    }
  }
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
        skillRanks: 0,
        skillRacialBonus: 0,
        skillDetail: null,
        synergyBonus: 0,
        totalRanks: 0,
        skillList: [],
        // Feats
        newFeat: null,
        featList: [],
        featDetail: null,
        showFeatDetail: false,
        totalFeats: 0,
        featPrerequisites: [],
        // Attacks
        attackNature: null,
        attackName: null,
        attackNickName: null,
        weaponNumber: 1,
        attackForm: null,
        weaponReach: 5,
        weaponRange: 10,
        weaponDamage: null,
        critRange: 20,
        critDouble: '✕2',
        specialEffect: null,
        magicWeapon: 0,
          // natural
          attackGroup: null,
          soleNatural: false,
          //manufactured
          presetWeapon: null,
          weaponSize: null,
          attackHand: null,
        attackList: [
          // Natural: nature: 'natural', group, sole, form, atk_name, number, reach, range, weapon_damage, crit_range, crit_double, special_effect, magic
          // Manufactured: nature: 'manufactured', hand, form, atk_name, number, weapon_size, reach, range, weapon_damage, crit_range, crit_double, special_effect, magic
          { nature: 'manufactured', hand: 'two-handed', form: 'melee', atk_name: 'flaming longspear', number: 1, weapon_size: 'large', reach: 10, range: 30,
          weapon_damage: '1d8', crit_range: 2, crit_double: '✕2', special_effect: '1d4 fire', magic: 0},
          { nature: 'natural', group: 'secondary', sole: false, form: 'melee', atk_name: 'sting', number: 2, reach: 5, range: null, weapon_damage: '1',
          crit_range: 1, crit_double: '✕2', special_effect: 'poison', magic: 0}
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
        spellSchool: null,
        spellAttack: [],
        spellRange: null,
        customSpellRange: 0,
        casterLevel: null,
        casterAbility: null,
        spellDetail: null,
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
        specialAbilities: [],
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
          return '1/' + this.hdNumber + 'd' + this.hdType + this.addModifierSign(modifier);
        }
        else {
          return this.hdNumber + 'd' + this.hdType  + this.addModifierSign(modifier);
        }
      },
      extraHD() {
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
        return extraHD;
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
      grappleModifier() {
        if (this.featList.includes("grapple")) {
          return this.baseAtkBonus + this.strengthModifier + (this.monsterSizeModifier * -4) + 1;
        }
        return this.baseAtkBonus + this.strengthModifier + (this.monsterSizeModifier * -4);
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
        // Base Skill Points
        let basePoints = this.typeBaseSkillPoints;
        if (['aberration', 'beast', 'elemental', 'fey', 'magical beast', 'monstrous humanoid', 'shapechanger', 'undead'].includes(this.monsterType)) {
          basePoints = basePoints * this.intelligenceScore;
        }
        else if(['dragon', 'giant', 'humanoid', 'outsider'].includes(this.monsterType)) {
          basePoints = basePoints + this.intelligenceModifier;
        }
        // Skill Points per HD
        if(['dragon', 'outsider'].includes(this.monsterType)) {
          return Math.floor(basePoints * this.hdCalc);
        }
        return basePoints + this.typeSkillPoints * this.extraHD;
      },
      numberOfFeats() {
        let baseNumber = this.typeBaseNumberOfFeats;
        if (['abberation', 'elemental', 'fey', 'monstrous humanoid', 'shapechanger', 'undead'].includes(this.monsterType) && this.intelligenceModifier>0) {
          baseNumber += this.intelligenceModifier;
        }
        else if(['dragon', 'outsider'].includes(this.monsterType)) {
          return basePoints + (Math.floor((this.hdCalc-1)/4) * this.typeNumberOfFeats) - this.totalFeats;
        }
        return this.typeBaseNumberOfFeats + (Math.floor((this.extraHD)/4) * this.typeNumberOfFeats) - this.totalFeats;
      },
      showSkillDetail() {
        return ['Craft,INT', 'Knowledge,INT', 'Profession,WIS', 'Perform,CHA'].includes(this.skillName);
      },
      displayAttackList() {
        let displayList = [];
        for (x in this.attackList) {
          attack = this.attackList[x];
          let display = " "
          let attackBonus = 0;
          let offAttackBonus = null;
          let weaponDamage = attack.weapon_damage.split("/");
          let critDouble = attack.crit_double.split("/");
          if (attack.nature=='manufactured') {
            if (weaponDamage.length>1) {
              // The monster wields a double weapon
              //calculateManufacturedAttackBonus(form, hand, name, size, multiple)
              attackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                            this.calculateManufacturedAttackBonus(attack.form, 'one-handed', attack.atk_name, attack.weapon_size, 'double');
              offAttackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                               this.calculateManufacturedAttackBonus(attack.form, 'off-hand', attack.atk_name, attack.weapon_size, 'double');
            }
            // TODO: Two-Weapon Fighting (separate weapons)
            /*else if () {
              // The monster wields two or more separate weapons              
              if (off-hand weapons are all light) {
                attackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                              this.calculateManufacturedAttackBonus(attack.form, 'one-handed', attack.atk_name, attack.weapon_size, 'off-light');
                offAttackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                                 this.calculateManufacturedAttackBonus(attack.form, 'off-hand', attack.atk_name, attack.weapon_size, 'off-light');
              }
              else {
                attackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                              this.calculateManufacturedAttackBonus(attack.form, 'one-handed', attack.atk_name, attack.weapon_size, 'equal-size');
                offAttackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                                 this.calculateManufacturedAttackBonus(attack.form, 'off-hand', attack.atk_name, attack.weapon_size, 'equal-size');
              }
            }*/
            else {
              // The monster wields only one weapon, which is not a double weapon
              attackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                          this.calculateManufacturedAttackBonus(attack.form, attack.hand, attack.atk_name, attack.weapon_size, false);
            }
            for (let i=0; i<Math.ceil(this.baseAtkBonus/5); i++) {
              if (i!=0) {
                display += "/"
              }
              display += this.addModifierSign(attackBonus-(i*5));
            }
            if (offAttackBonus) {
              display += " and " + this.addModifierSign(offAttackBonus);
              if (this.featList.includes('Improved Two-Weapon Fighting') && this.baseAtkBonus>=9) {
                display += "/" + this.addModifierSign(offAttackBonus-5);
              }
            }
          }
          else {
            // It is a natural weapon
            attackBonus = this.baseAtkBonus + this.monsterSizeModifier + attack.magic +
                          this.calculateNaturalAttackBonus(attack.group, attack.form, attack.atk_name);
            display += this.addModifierSign(attackBonus);
          }         
          if (attack.reach!=this.monsterReach) {
            display += " " + attack.reach + "ft. reach";
          }
          if (attack.form!='melee') {
            display += " " + attack.range + "ft. range";
          }
          if (weaponDamage.length>2 || attack.number>1) {
            let primaryDamageBonus = this.calculateManufacturedDamageBonus(attack.form, 'one-handed', attack.atk_name, attack.weapon_size, false) + attack.magic;
            let secondaryDamageBonus = this.calculateManufacturedDamageBonus(attack.form, 'off-hand', attack.atk_name, attack.weapon_size, true) + attack.magic;
            display += " (" + weaponDamage[0] + this.addModifierSign(primaryDamageBonus);
            if (attack.crit_range<20) {
              display += "/" + attack.crit_range + "‒20";
            }
            if (attack.crit_double!='✕2') {
              display += "/" + critDouble[0];
            }
            for (let i=1; i<weaponDamage.length; i++) {
              display += ", " + weaponDamage[i] + this.addModifierSign(secondaryDamageBonus);
            if (attack.crit_range<20) {
              display += "/" + attack.crit_range + "‒20";
            }
              if (attack.crit_double!='✕2') {
                display += "/" + critDouble[i];
              }
            }
            for (let i=1; i<attack.number; i++) {
              display += ", " + weaponDamage[i] + this.addModifierSign(secondaryDamageBonus);
            if (attack.crit_range<20) {
              display += "/" + attack.crit_range + "‒20";
            }
              if (attack.crit_double!='✕2') {
                display += "/" + critDouble[i];
              }
            }
            // Special Effect
            if (attack.special_effect) {
              display += " plus " + attack.special_effect;
            } 
            display += ")";
          }
          else if (weaponDamage.length==1) {
            display += " (" + attack.weapon_damage
            // start damageBonus
            let damageBonus = 0;
            if (attack.form=='manufactured') {
              // Check if multiple
                damageBonus = this.calculateManufacturedDamageBonus(attack.form, attack.hand, attack.atk_name, attack.weapon_size, false) + attack.magic;
            }
            else {
              damageBonus = this.calculateNaturalDamageBonus(attack.group, attack.form) + attack.magic;
            }
            if (this.featList.includes(`Weapon Specialization (${attack.atk_name})`)) {
              damageBonus += 2;
            }
            display += this.addModifierSign(damageBonus);
            // Critical
            let threatRange = 21 - attack.crit_range;
            if (this.featList.includes('Improved Critical')) {
              threatRange *= 2;
              // TODO: keen weapon : threatRange += attack.crit_range
            }
            if (threatRange>1) {
              display += "/" + (21-threatRange) + "‒20";
            }
            if (attack.crit_double!='✕2') {
              display += "/" + attack.crit_double;
            }
            // Special Effect
            if (attack.special_effect) {
              display += " plus " + attack.special_effect;
            }            
            display += ")";
          }
          else if (attack.special_effect) {
           display += " (" + attack.special_effect + ")";
          }
          displayList.push(display);
        }
        return displayList;
      },
      armorClass() {
        return 10 + this.naturalArmor + this.armorBonus + this.dexterityModifier + this.monsterSizeModifier;
      },
      allSpecialAbilities() {
        return this.specialAbilities.concat(this.monsterTypeSpecialAbilities);
      }
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
          this.naturalArmor = 0;
          // Bonus hp handled under bonusHitPoints()
        }
        else if (this.monsterType==='vermin') {
          this.intelligenceScore = 0;
          // DC Bonus venom handled under saveDC()
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
      addModifierSign(value) {
        // Add plus sign if value is positive or 0
          if (value<0 || typeof value != 'number') {
            return value;
          }
          else {
            return "+" + value;
          }
      },
      typicalReach() {
      // TODO: datalist monsterFace
        if (this.monsterSizeModifier>1) {
            this.monsterReach = 0;
            if (this.monsterSize=='Fine') {
              this.monsterFace = "0.5 ft. ✕ 0.5 ft.";
            }
            else if (this.monsterSize=='Diminutive') {
              this.monsterFace = "1 ft. ✕ 1 ft.";
            }
            else {
              this.monsterFace = "2.5 ft. ✕ 2.5 ft.";
            }
        }
        else if (this.monsterSizeModifier>=0 || (this.monsterSize=='large' && this.bodyShape=='long')) {
            this.monsterReach = 5;
            if (this.monsterSize=='large') {
              this.monsterFace = "5 ft. ✕ 10 ft.";
            }
            else {
              this.monsterFace = "5 ft. ✕ 5 ft.";
            }
        }
        else if ((this.monsterSize=='large' && this.bodyShape=='tall') || (this.monsterSize=='huge' && this.bodyShape=='long')) {
            this.monsterReach = 10;
            if (this.monsterSize=='large') {
              this.monsterFace = "5 ft. ✕ 5 ft.";
            }
            else {
              this.monsterFace = "15 ft. ✕ 15 ft."; // or this.monsterFace = "10 ft. ✕ 20 ft.";
            }
        }
        else if ((this.monsterSize=='huge' && this.bodyShape=='tall') || (
                 (this.monsterSize=='gargantuan' || this.monsterSize=='colossal') && this.bodyShape=='long')
                ) {
            this.monsterReach = 15;
        }
        else if (this.monsterSize=='gargantuan' && this.bodyShape=='tall') {
            this.monsterReach = 20;
        }
        else {
            this.monsterReach = 25;
        }
      },
      addSkill() {
        // Split values from form into name and modifier
        const skillValue = this.skillName.split(",");
        // If skillRanks or skillRacialBonus is null, set its value to 0 to prevent problems with math later.
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
          synergy_bonus: this.synergyBonus,
        };
        // If skill has variations (like Craft, Knowledge, Profession and Perform), the specific variant must be added to the name
        if (this.skillDetail) {
            skill.skill_name = skill.skill_name + " (" + this.skillDetail + ")"
        }
        // The Hide skill includes a size modifier
        if (skill.skill_name=='Hide') {
            skill.size_modifier = sizeModifier(this.monsterSize) * 4;
        }
        // Undead spellcasters use Charisma instead of Constitution for Concentration checks
        if (skill.skill_name=='Concentration' && this.monsterType=='undead') {
            skill.modifier = 'CHA';
        }
        // Some feats add a skill bonus
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
        if (this.featList.includes(`Skill Focus (${skill.skill_name})`)) {
            skill.feat_bonus += 2;
        }
        // Deduct ranks from total skill ranks
        this.totalRanks = this.totalRanks + this.skillRanks;
        // Update document
        this.skillList.push(skill);
        // Reset form
        this.skillName = null;
        this.skillRanks = 0;
        this.skillRacialBonus = 0;
        this.skillDetail = null;
        
        // If the skill has 5+ ranks, other skills may gain a synergy bonus
        if (skill.ranks>=5) {
          let synergies = skillSynergyInformation(skill.skill_name);
          if (synergies) {
            for (synergy of synergies) {
              // If skill already exists in the skillList, add the bonus to its entry
              let skillThatGetsBonus = this.skillList.find(x => x.skill_name === synergy.name);
              if (skillThatGetsBonus) {
                skillThatGetsBonus.synergy_bonus += 2;
              }
              // If it doesn't, add the skill to the list
              else {
                this.skillName = synergy.name + ',' + synergy.modifier;
                this.synergyBonus = 2;
                this.addSkill();
                this.synergyBonus = 0;
              }
            }
          }
        }
      },
      editSkill(item) {
        const skill = this.skillList[item];
        this.skillName = skill.skill_name + "," + skill.modifier;
        this.skillRanks = skill.ranks;
        this.skillRacialBonus = skill.racial_bonus;
        this.skillDetail = skill.detail;
        this.deleteSkill(item);
      },
      deleteSkill(item) {
        this.totalRanks -= this.skillList[item].ranks;
        this.skillList.splice(item, 1);
      },
      updateSkill(item) {
        this.editSkill(item);
        this.addSkill();
      },
      skillModifier(skill) {
        return skill.ranks + skill.racial_bonus + skill.feat_bonus + skill.synergy_bonus + skill.size_modifier + this.getModifier(skill.modifier);
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
          feat += ' (' + this.featDetail.toLowerCase() + ')';
        }
        this.featList.push(feat);
        this.totalFeats++;
        this.newFeat = null;
        this.featDetail = null;
      },
      deleteFeat(item) {
        this.featList.splice(item, 1);
        this.totalFeats--;
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
      addAttack() {
        // Natural: group, sole, form, atk_name, number, reach, range, weapon_damage, crit_range, crit_double, special_effect, magic
        // Manufactured: hand, form, atk_name, number, weapon_size, reach, range, weapon_damage, crit_range, crit_double, special_effect, magic
        // Create attack entry
        let attack = {
          nature: this.attackNature,
          form: this.attackForm,
          atk_name: this.attackName.toLowerCase(),
          nick_name: this.attackNickName,
          number: this.weaponNumber,
          reach: this.weaponReach,
          range: this.weaponRange,
          weapon_damage: this.weaponDamage,
          crit_range: this.critRange,
          crit_double: this.critDouble,
          special_effect: this.specialEffect,
          magic: this.magicWeapon,
        };
        if (this.attackNature=='natural') {
          // Add natural attack variables
          attack.group = this.attackGroup;
          attack.sole = this.soleNatural;
          // Reset natural variables
          this.attackGroup = null;
          this.soleNatural = false;
        }
        else {
          // Add manufactured attack variables
          attack.hand = this.attackHand;
          attack.form = this.attackForm;
          // Reset manufactured variables
          this.presetWeapon = null;
          this.weaponSize = null;
          this.attackHand = null;
        }
        this.attackList.push(attack);
        // Reset rest of form
        this.attackNature = null;
        this.attackName = null;
        this.weaponNumber = 1;
        this.attackForm = null;
        this.weaponReach = this.monsterReach;
        this.weaponRange = null;
        this.weaponDamage = null;
        this.critRange = 20;
        this.critDouble = '✕2';
        this.specialEffect = null;
        this.magicWeapon = 0;     
      },
      editAttack(item) {
        // Put values from list item into form
        const attack = this.attackList[item];
        this.attackNature = attack.nature;
        this.attackName = attack.atk_name;
        this.weaponNumber = attack.number;
        this.attackForm = attack.form;
        this.weaponReach = attack.reach;
        this.weaponRange = attack.range;
        this.weaponDamage = attack.weapon_damage;
        this.critRange = attack.crit_range;
        this.critDouble = attack.crit_double;
        this.specialEffect = attack.special_effect;
        this.magicWeapon = parseInt(attack.magic);
        if (this.attackNature=='natural') {
            this.attackGroup = attack.group;
            this.soleNatural = attack.sole;
        }
        else {
        this.weaponSize = attack.weapon_size;
        this.weaponHand = attack.hand;       
        }      
      },
      deleteAttack(item) {
        this.attackList.splice(item, 1);
      },
      calculateManufacturedAttackBonus(form, hand, name, size, multiple) {
      // Takes arguments attack form (melee, ranged or thrown), hand(s) used, weapon's name, weapon's size, and whether the attack uses multiple weapons
      // and returns the attack bonus (not including magical bonuses or base attack bonus)
        let bonus = 0;
        let multiWeaponFightingPenalty = 0;
        if (this.featList.includes(`Weapon Focus (${attack.atk_name})`)) {
            bonus += 1;
        }
        if (multiple) { //'double' || 'off-light', 'equal-size'
          multiWeaponFightingPenalty += 2;
          if (multiple=='equal-size') { //sizeModifier(size)>=this.monsterSizeModifier
            multiWeaponFightingPenalty += 2;
          }
          if (!this.featList.includes('Multifighting') || !this.featList.includes('Two-Weapon Fighting')) {
            multiWeaponFightingPenalty += 2;
          }
        }
        // If monster has Weapon Finesse applied to this attack, and its Dexterity modifier is higher, use the Dexterity modifier.
        if (form=='melee' && !(this.featList.includes(`Weapon Finesse (${name})`) && this.dexterityModifier > this.strengthModifier)) {
          if (hand=='off-hand' && !(this.featList.includes('Ambidexterity') || this.featList.includes('Multidexterity'))) {
            return this.strengthModifier - 4 + bonus - multiWeaponFightingPenalty;
          }
          else {
            return this.strengthModifier + bonus - multiWeaponFightingPenalty;
          }
        }
        else {
          return this.dexterityModifier + bonus - multiWeaponFightingPenalty;
        }
      },
      calculateManufacturedDamageBonus(form, hand, name, size, multiple) {
      // Takes arguments attack form (melee, ranged or thrown), hand(s) used, weapon's name, weapon's size, and whether the attack uses multiple weapons
      // and returns the damage bonus (not including magical bonuses or feats)
        if (form=='ranged') {
          if ((this.strengthModifier<0 && (
               (name.includes('bow') && !name.includes('crossbow')) || name.includes('sling')
              )) ||
              (this.strengthModifier>0 && name.includes('composite') && !multiple) //why?
             ) {
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
      },
      calculateNaturalAttackBonus(group, form, name) {
        let penalty = 0;
        let bonus = 0;
        if (this.featList.includes(`Weapon Focus (${attack.atk_name})`)) {
            bonus += 1;
        }
	    if(group=='secondary') {
	      if(this.featList.includes('Multiattack')) {
	        penalty = 2;
	      }
	      else {
	        penalty = 5;
	      }
	    }
	    if (form=='melee' && !(this.featList.includes(`Weapon Finesse (${name})`) && this.dexterityModifier > this.strengthModifier)) {
	      return this.strengthModifier + bonus - penalty;
	    }
	    else {
		  return this.dexterityModifier + bonus - penalty;
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
        let newSpell = {name: this.spellName};
        switch (this.spellRange) {
          case "personal":
            newSpell.range = "(self only)";
          case "close":
            newSpell.range = 25 + 5 * Math.floor(this.casterLevel/2);
            break;
          case "medium":
            newSpell.range = 100 + 10 * this.casterLevel;
            break;
          case "long":
            newSpell.range = 400 + 40 * this.casterLevel;
            break;
          case "custom":
            newSpell.range = this.customSpellRange;
            break;
        }
        if (this.spellAttack.includes('melee')) {
          newSpell.melee = this.baseAtkBonus + this.strengthModifier + this.monsterSizeModifier;
        }
        if (this.spellAttack.includes('ranged')) {
          if (this.featList.includes('Weapon Focus (ray)')) {
            newSpell.ranged = this.baseAtkBonus + this.dexterityModifier + this.monsterSizeModifier + 1;
          }
          else {
            newSpell.ranged = this.baseAtkBonus + this.dexterityModifier + this.monsterSizeModifier;
          }
        }
        if (this.spellAttack.includes('saving throw')) {
          newSpell.saving_throw = this.saveDC('spell', this.specialSaveAbility);
        }
        newSpell.detail = this.spellDetail
        if (list=='atWill') {
          this.spellsAtWill.push(newSpell);
        }
        else if (list=='onceDay') {
          this.spellsOncePerDay.push(newSpell);
        }
        else if (list=='thriceDay') {
          this.spellsThricePerDay.push(newSpell);
        }
        else if (list=='onceWeek') {
          this.spellsOncePerWeek.push(newSpell);
        }
        else if (list=='psionics') {
          this.psionicPowers.push(newSpell);
        }
        // Reset Form
        this.spellName = '';
        this.spellAttack = null;
        this.spellRange = null;
        this.customSpellRange = 0;
        this.spellSchool = null;
        this.spellLeveL = null;
        this.spellDetail = null;
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
                return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +2;
            }
            else if (this.monsterSize=='large') {
                return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +4;
            }
            else if (this.monsterSize=='huge') {
                return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +6;
            }
            else if (this.monsterSize=='gargantuan') {
                return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +8;
            }
            else if (this.monsterSize=='colossal') {
                return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +10;
            }
        }
        else if (ability=='spell') {
          if (this.featList.includes(`Spell Focus (${this.spellSchool})`)) {
            return 10 + this.spellLevel + this.getModifier(modifier) +2;
          }
          else {
            return 10 + this.spellLevel + this.getModifier(modifier);
          }
        }
        else {
          if (this.featList.includes(`Ability Focus (${this.ability})`)) {
            return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier) +2;
          }
          else {
            return 10 + Math.floor(0.5 * this.hdCalc) + this.getModifier(modifier);
          }
        }
      }
    },
    watch: {
      monsterReach(value) {
        this.weaponReach = value;
      }
    },
  });
