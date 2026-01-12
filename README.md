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

[TcgDex's Cards database](https://github.com/tcgdex/cards-database) via git submodules