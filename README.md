# Realms of Aetheria

A full-featured mobile RPG built with Phaser 3 and Capacitor.

## Features

- **Character Creation** - Name, Race (6 races), Class (6 classes), Traits (15 traits), Avatar customization
- **Stats & Leveling** - HP, MP, ATK, DEF, SPD, LUK with XP-based leveling (50 levels)
- **Open World** - 9 zones with unique monsters, NPCs, and environments
- **Combat System** - Real-time combat with skills, potions, and fleeing
- **Inventory** - Equipment slots (weapon, armor, accessories) and item management
- **Skills** - Class-specific skill trees with upgrades
- **Quests** - Main story quests, side quests, and daily quests
- **NPCs** - 13 unique NPCs with dialogue, shops, and services
- **Shops** - Buy and sell items at various shops
- **Save/Load** - Auto-save and manual save system
- **Mobile Controls** - Virtual joystick and touch buttons
- **Audio** - Background music and sound effects

## Tech Stack

- **Phaser 3** - 2D game engine
- **Capacitor 7** - Mobile app packaging
- **Vanilla JS** - No build step required
- **GitHub Actions** - Automated APK building

## Getting Started

### Prerequisites
- Node.js 18+
- Android Studio (for local development)
- JDK 17

### Installation
```bash
npm install
npx cap add android
npx cap sync
```

### Development
```bash
npx serve . -p 8080
```

### Build APK
```bash
npx cap sync
cd android
./gradlew assembleDebug
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

The APK is automatically built when you push to `main` or `master`.
Download the APK from the Actions tab → Artifacts.

## Project Structure

```
├── src/
│   ├── main.js              # Game entry point
│   ├── config/
│   │   └── GameConfig.js    # Game configuration, races, classes, traits
│   ├── data/
│   │   ├── Items.js         # Item database
│   │   ├── Monsters.js      # Monster database
│   │   ├── Skills.js        # Skill database
│   │   ├── NPCs.js          # NPC database
│   │   └── Quests.js        # Quest database
│   ├── scenes/
│   │   ├── BootScene.js     # Boot sequence
│   │   ├── PreloadScene.js  # Asset loading
│   │   ├── MainMenuScene.js # Main menu
│   │   ├── CharacterCreationScene.js
│   │   ├── WorldScene.js    # Main gameplay
│   │   ├── BattleScene.js   # Combat
│   │   ├── InventoryScene.js
│   │   ├── SkillsScene.js
│   │   ├── QuestLogScene.js
│   │   ├── StatsScene.js
│   │   ├── ShopScene.js
│   │   └── SettingsScene.js
│   ├── systems/
│   │   ├── PlayerSystem.js  # Player stats, inventory
│   │   ├── CombatSystem.js  # Combat logic
│   │   ├── QuestSystem.js   # Quest tracking
│   │   ├── SaveSystem.js    # Save/load
│   │   └── AudioSystem.js   # Audio management
│   └── ui/
│       ├── UIComponents.js  # Reusable UI
│       ├── VirtualJoystick.js
│       └── DialogueBox.js
├── public/assets/           # Game assets (sprites, tiles, etc)
├── android/                 # Capacitor Android project
└── .github/workflows/       # CI/CD
```

## License

MIT
