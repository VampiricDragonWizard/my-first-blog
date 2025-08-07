// MonsterBuilder Vue file
const app = Vue.createApp({
    data() {
      return {
        // Name
        monsterName: '',
        // Size
        monsterSize: 'medium',
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
        attackForm: null,
        // attackTwoHanded is for manufactured weapons wielded with more than one hand or strong natural weapons
        attackTwoHanded: false,
        weaponDamage: null,
        specialEffect: null,
        magicWeapon: 0,
        weaponMaterial: null,
        attackId: 2, // TODO: index vue
        attackList: [
          { atk_name: 'flaming longspear', number: 1, weapon_size: 'large', atk_form: 'melee', atk_modifier: 'strength', atk_bonus: 1, weapon_damage: '1d8',
          damage_bonus: 3, special_effect: '1d4 fire', magic: 1, two_handed: true, material: 'manufactured', list: 'primary'},
          { atk_name: 'sting', number: 2, weapon_size: 'natural', atk_form: 'melee', atk_modifier: 'dexterity', atk_bonus: 1, weapon_damage: '1',
          damage_bonus: 2, special_effect: 'poison', magic: 0, two_handed: false, material: 'natural', list: 'secondary'}
        ],
        // Armor
        naturalArmor: 0,
        manufacturedArmor: 'none',
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
        specialDescription: '',
        specialShorthand: '',
        specialSave: 'none',
        specialSaveHalfOrNegate: null,
        specialSaveAbility: 'none',
        specialAbilities: [{name: 'Name', category: 'Supernatural', description: 'Range', save: 'Fortitude', half_negate: 'negate', save_base: 'STR'}, {name: 'Name', category: 'Spell-like', description: 'Range', save: 'Reflex', half_negate: 'half', save_base: 'CON'}],
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
         return this.typeBaseNumberOfFeats + (Math.floor(this.hdCalc-1/4) * this.typeNumberOfFeats);
      },
      showSkillDetail() {
        return ['Craft,INT', 'Knowledge,INT', 'Profession,WIS', 'Perform,CHA'].includes(this.skillName);
      },
      armorClass() {
        return 10 + this.naturalArmor + this.armorBonus + this.dexterityModifier;
      },
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
        // Add the items of the monster type special abilities list to the monster special abilities list
        // TODO: add other monsterType characteristics here
        if (this.monsterType==='construct' || this.monsterType==='undead') {
          this.constitutionScore = 0;
        }
        else if (this.monsterType==='ooze') {
          this.intelligenceScore = 0;
          this.featList.push("Blindfight");
          // Bonus hp
        }
        else if (this.monsterType==='vermin') {
          this.intelligenceScore = 0;
        }
        else if (this.monsterType==='animal' && this.intelligenceScore>2) {
          this.intelligenceScore = 2;
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
      addSkill() {
      //TODO: add bonuses from feats and synergies
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
        };
        // If skill has variations, the specific variant must be added to the name
        if (this.skillDetail) {
            skill.skill_name = skill.skill_name + " (" + this.skillDetail + ")"
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
            skill.feat_bonus += 3;
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
        return skill.ranks + skill.racial_bonus + skill.feat_bonus + this.getModifier(skill.modifier);
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
        //TODO: attack_modifier is strength or dexterity, damageBonus, two-handed?
       // Initialize values
        let attackBonus = null;
        let damageBonus = 0;
        let attackDamage = null;
        let attackForm = null;
        let attackList = null;
        
        // Primary Attacks get full BAB, whereas Secondary Attacks have a penalty
        if (e.target.parentElement.id==="primary") {
          attackBonus = this.baseAtkBonus;
          attackList = "primary";
        }
        else if (e.target.parentElement.id==="secondary") {
          // TODO: dual-wielding
          // TODO: Multiattack feat (-2 instead of -5)
          if (this.featList.includes("multiattack")) {
            attackBonus = this.baseAtkBonus-2;
          }
          else {
            attackBonus = this.baseAtkBonus-5;
          }
          attackList = "secondary";
        }
        let sizeOfWeapon = sizeModifier(this.weaponSize);
        // Attack Bonus and Attack Damage depend on Attack Form
        if (this.attackForm==='melee') {
          attackBonus += this.strengthModifier + this.monsterSizeModifier;//this.sizeModifier(this.monsterSize);
          /*
          DAMAGE: Half extra strength bonus if manufactured weapon wielded with two hands, or a strong natural weapon.
          Check if strengthModifier is positive to prevent adding a strength penalty.
          Manufactured weapon cannot be light (smaller than monster).
          If a monster has only one natural weapon it is usually strong, but it can have more than one strong natural weapon (see dragons).
          this.sizeModifier(this.weaponSize)
          this.sizeModifier(this.monsterSize)
          or sole natural weapon
          */
          if (this.strengthModifier > 0 && (this.attackTwoHanded && (sizeOfWeapon >= this.monsterSizeModifier))) {
            damageBonus = this.strengthModifier*1.5;
          }
          else {
            damageBonus = this.strengthModifier;
          }
        }
        else if (this.attackForm==='ranged') {
          attackBonus += this.dexterityModifier + this.monsterSizeModifier;//this.sizeModifier(this.monsterSize);
          // Add strength penalty, unless using a crossbow. If using composite bow, add strength bonus.
          if ((this.strengthModifier < 0 && !this.attackName.includes('crossbow')) || (this.strengthModifier > 0 && this.attackName.includes('composite'))) {
            damageBonus = this.strengthModifier;
          }
        }
        else if (this.attackForm=='thrown') {
          attackBonus += this.dexterityModifier + this.monsterSizeModifier;
          damageBonus = this.strengthModifier;
        }
        // Magical Bonuses
        attackBonus += this.magicWeapon;
        damageBonus += this.magicWeapon;
        
        // Create attack entry
        let attack = {
          atk_name: this.attackName,
          number: this.weaponNumber,
          weapon_size: this.weaponSize,
          atk_form: this.attackForm,
          atk_bonus: attackBonus,
          weapon_damage: this.weaponDamage,
          damage_bonus: damageBonus,
          special_effect: this.specialEffect,
          magic: this.magicWeapon,
          two_handed: this.attackTwoHanded,
          material: this.weaponMaterial,
          list: attackList,
        };
        // Update List
        this.attackList.push(attack);
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
        this.attackName = attack.atk_name;
        this.weaponNumber = attack.number;
        this.weaponSize = attack.weapon_size;
        this.attackForm = attack.atk_form;      
        this.weaponDamage = attack.weapon_damage;
        this.specialEffect = attack.special_effect;
        this.magicWeapon = parseInt(attack.magic);
        this.attackTwoHanded = attack.two_handed;
        this.weaponMaterial = attack.material;
      },
      deleteAttack(item) {
        this.attackList.splice(item, 1);
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
        // spellLevel, casterLevel attacks saves
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
        let description = specialInformation(this.specialPreset, this.monsterName);
        this.specialDescription = description;
        //preset saves
        if (this.specialPreset=='breath weapon') {
            this.specialSave = 'Reflex';
            this.specialSaveHalfOrNegate = 'negates';
            this.specialSaveAbility = 'CON';
        }
      },
      addSpecialAbility() {     
        const newAbility = {
          special_name: this.specialAbility,
          category: this.specialCategory,
          description: this.specialDescription,
          shorthand: this.specialShorthand,
          save: this.specialSave,
          half_negate: this.specialSaveHalfOrNegate,
          save_base: this.specialSaveAbility,
          };
          console.log(newAbility);
        this.specialAbilities.push(newAbility);
      },
      deleteSpecialAbility(item) {
        this.specialAbilities.splice(item, 1);
      },
      editSpecialAbility(item) {
        console.log("running editSpecialAbilities...");
        const ability = this.specialAbilities[item];
        this.specialAbility = ability.special_name;
        console.log(ability.category);
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
    }
  });
