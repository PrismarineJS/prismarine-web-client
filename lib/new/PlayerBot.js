export default class PlayerBot {
  constructor(bot) {
    this.bot = bot;

    this.health = this.bot.hp;
    this.maxHealth = 20;
    this.foodLevel = this.bot.food;
    this.foodSaturationLevel = this.bot.foodSaturation;
    this.experience = 1;
    this.experienceLevel = 0;

    this.bot.on('health', () => {
      this.health = this.bot.hp
      this.foodLevel = this.bot.food
      this.foodSaturationLevel = this.bot.foodSaturation
      this.experience = 1;
    })
  }

  getMaxHealth() {
    return this.maxHealth;
  }

  setHealth(value) {
    this.health = value;
  }

  setFoodLevel(value) {
    this.foodLevel = value;
  }

  getFoodLevel() {
    return this.foodLevel;
 }

  getSaturationLevel() {
    return this.foodSaturationLevel;
  }

  getHealth() {
    return this.health;
  }
}