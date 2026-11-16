#GPT-MODULAR v3.7 HYBRID

##PURPOSE
defines: folders, module contracts, registry, ignore-junk
NOT-defines: naming (00_GPT-RULES), log-format (01_GPT-LOGGER)
PRIORITY: 00_GPT-RULES > 02_GPT-MODULAR
existing-project=extend ITS layout, do not invent src/core if hub already exists

##PRINCIPLES (CRITICAL)
- one domain = one folder
- new thing = folder + card + ONE row in registry
- remove folder = hub still boots (skip missing row)
- modules talk via registry getters, not ../../other/client
- core/hub = STABLE (mount/start/deliver/pick)
- listing/catalog ≠ purchase/fulfillment (do not mix)

##GPT-IGNORE (CRITICAL)
new-project=create .cursorignore (and .gitignore)
do-NOT-ignore: .cursor/rules/, .cursor/skills/, AGENTS.md, DOCS.md

.CURSORIGNORE:
```
node_modules/
vendor/
dist/
build/
target/
.cache/
*.lock
*.png
*.jpg
*.ico
*.db
*.db-*
.env
logs/
```

.GITIGNORE-extra:
```
.env
.env.*
!.env.example
.cursor/*
!.cursor/rules/
!.cursor/rules/**
!.cursor/skills/
!.cursor/skills/**
```
NO: !backend/.env  (never un-ignore secrets)
NO: ignore entire .cursor/  (rules+skills must stay in repo)

ALWAYS-DO-NOT-READ:
  node_modules/, vendor/, target/, dist/, build/
  *.lock, binaries, *.db, .env, logs/*.log
  prod data, secrets

##STRUCTURE (greenfield map — adapt names to stack)
```
project/
├── .cursorignore
├── .cursor/rules/     # keep in git
├── .cursor/skills/    # keep in git; each skill: «менял X → тест»
├── AGENTS.md          # task → folder → skill
├── src/
│   ├── hub/           # registry only (marketplaces, suppliers, services)
│   ├── modules/{name}/  # or integrations/{name}/
│   │   ├── DOCS.md
│   │   ├── card (inbound/deliver/settings/dont)
│   │   └── entry (mount/start/buy/poll)
│   └── shared/
├── tests next to files
└── docs/00_GPT-RULES.md 01_GPT-LOGGER.md 02_GPT-MODULAR.md
```

##REGISTRY (CRITICAL)
hub exports:
  getX(id), pickX(input), mount(app), start(ctx)
new module = 1 folder + 1 row
NO: if (platform===) / if (kind===) inside ingest, purchase, Offers, server
cross-call = lazy getX('id').createClient(...) inside function
NO: top-level import of another module client (breaks agent + cycles)

card fields:
  inbound, deliver, settings, dont, docs
read card + DOCS.md before touching that client
URL only from DOCS.md

##FAILURE-BOUNDARIES
registry: duplicate id -> throw; init fail -> log + skip
module: runtime -> catch + log + Result; do not crash hub
main: bootstrap fail -> exit 1
RULE: errors stay in boundary

##STATES
INIT = create structure
STRUCTURE_LOCKED = hub frozen
MODULE_EXPANSION = add folders, hub only +1 row
REFACTOR = inside folder, contracts frozen

##SETTINGS / UI
keys live in module catalog/config, not copied into UI
one screen = one entry file
helpers stay beside entry, not core/ unless shared by many
empty test dirs: delete or one README «tests are src/**/*.test.*»

##SKILLS
frequent task = .cursor/skills/{name}/SKILL.md
must include: «менял X → этот тест»
do not send agent into foreign deliver/

##FORBIDDEN
- direct module-to-module import of clients
- if (name===) in shared hub
- mix lot-create/catalog with purchase/fulfill
- modify hub during MODULE_EXPANSION except +1 row
- circular deps
- rename public ids to look clean
- 30-line crumb splits; files >~400 = split by real steps
- ignore .cursor/rules and skills in git

##EDGE-CASES
circular:
  extract shared/, lazy getter, reverse dep, split folder
wrong place:
  supplier ≠ marketplace; service ≠ supplier
  deliver belongs on marketplace descriptor

##GPT-ROLE
IS: put code in the right folder, one registry row, tests beside
NOT: redesign product, rename working ids, extra files
// docs/02_GPT-MODULAR.md
