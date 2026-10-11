# Pokefeur

Repo for pokefeur server and web-client

## Requirements

- NodeJS > 20.19+ or 22.12+.

## Setup

Clone repo **with submodules** :

```bash
git clone git@github.com:LaCulotte/pokefeur-server.git --recursive
```

Initialize with `npm` or `bun` :

```bash
cd pokefeur-server
bun install
```

Run compiler to process tcgdex's database :

```bash
npm run compile
# or
bun run bcompile
```

## Launch

In two separate terminals, run the api server and vite
```bash 
# api server
npm run server
# or
bun run bserver

# vite
npm run dev
# or
bun run dev
```

Go to [localhost:5173](http://localhost:5173)

## Dependencies

[TcgDex's Cards database](https://github.com/tcgdex/cards-database) for card data + card illustrations \
[TcgDex energy asset](https://www.tcgdex.fr/assets/energies.png) + [Pokemon TCG Energy Types](https://www.deviantart.com/xtuart/art/Energy-Types-Pokemon-TCG-Outdated-v2-908706380) for energy icons \
[PokeAPI](https://pokeapi.co/) for Pokemon species data

## Repo architecture

```
pokefeur_server/
├── data/                       # User data folder
│   ├── deals/                      # Deal data
│   ├── inventories/                # User inventories
│   ├── sessions/                   # Sessions data
│   ├── tradeProposals.json         # Trades data
│   └── users.json                  # User 'profile' data
├── dependencies/               # Third party dependencies
│   ├── cards-database/             # TcgDex card data
│   └── pokeapi/                    # PokeAPI data
├── dist/                       # Location of generated code
├── doc/                        # Detailed documentation
├── resources/                  # Third party resources
│   ├── cards-data ->               # Explicit link to TcgDex card data
│   ├── dealership/                 # DEPRECATED; TODO : remove
│   ├── generated/                  # Compiled data
│   │   ├── backend/                    # Relational card data
│   │   ├── lang/                       # Langage card data
│   │   └── pokemons.json               # Pokemon species name
│   ├── interfaces.d.ts ->          # Link to TcgDex interfaces
│   └── pokemon_species_names.csv -># Link to pokeAPI data
├── src/                        # Source folder
│   ├── api/                        # Backend server
│   │   ├── controller/                 # Logic controllers
│   │   ├── endpoints/                  # HTTP endpoints
│   │   ├── model/                      # Data models
│   │   ├── staticData/                 # Loading + interfaces for card data
│   │   ├── common.ts                   # Common utils for backend
│   │   └── main.ts
│   ├── common/                     # Common utils for project
│   │   ├── checks.ts                   # Card/Set check and filters
│   │   ├── constants.ts                # Constants/Enums
│   │   └── utils.ts                    # Misc utils, included 'expected'
│   ├── compiler/                   # Card data compiler
│   │   ├── endpoints/                  # 'Controllers'; Name is missleading
│   │   ├── dataSingleton.ts            # Singletons for compiler
│   │   ├── interfaces.d.ts             # Compiler interfaces
│   │   ├── main.ts
│   │   └── utils.ts
│   └── ui/                         # Frontend
│       ├── components/                 # Vue components
│       ├── controller/                 # Static data controllers: Name is missleading
│       ├── data/                       # Static data 'storage'
│       ├── static ->                   # Link to static files
│       ├── test/                       # For api query tests; TODO: remove
│       ├── views/                      # Main pages
│       ├── App.vue
│       ├── index.html
│       ├── interfaces.d.ts
│       └── main.ts
├── static/                         # Static files
│   └── images/                         # Static images
├── README.md
├── eslint.config.ts                # Configuration files
├── package.json                    # ...
├── tsconfig*.json                  # ...
└── vite.config.ts                  # ...
```

## Known issues 

### Static data

- In LangStaticData loaded by frontend 
    - `data.sets["setid"].cards["cardid"]` and `data.cards["cardid"]` are exactly the same in memory in backend
    - **Not the case in frontend**
- No way to send a part of the static data from the backend for now
    - To be changed in the future (at the same time as adding the patch data feature ?)
- In type checks :
    - Works right now because staticData and staticLangData are compatible.
    - May cause issues in the future

### Data

- Lots of duplication of data when mostly not needed
    - ex: an item is completely duplicated in user tradeInventory and in trade proposal
- During a trade proposal, an item is both in the user inventory and in the trade proposal, making it unecessarally duplicated. This is especially 'annoying' because the item is actually loaded twice on startup