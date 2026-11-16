#GPT-RULES v2.4 HYBRID

##STRUCT
first=read existing tree (README, AGENTS.md, docs/)
greenfield-only:
  src/core=stable-hub (registry, mount, start)
  src/modules|integrations/{name}=independent
  src/shared=common
  src/config=settings
  tests=next-to-code (foo.js + foo.test.js)
  docs=one DOCS.md per module
  logs=gpt-compact {f,e,c,ctx}
existing-project=FOLLOW its folders, do not migrate to src/modules

##NAMING
detect-lang-first (see LANG-ADAPT)
bool=is/has/should + lang-style
YES: isLoading, has_access, ShouldUpdate
NO: loading, flag1, tmp
const=language-const-style (JS MAX_ITEMS, py MAX_ITEMS, rust MAX_ITEMS)
public-ids=NEVER-rename (api paths, db columns, env keys, settings keys)

##FUNC
func-max-lines=~80
file-max-lines=~400
split-by=real steps or test-cases (search→bot→gift)
NO: 30-line crumb files, drive-by refactors
params>4=object/struct
1-func=1-task
name=describes-action

GOOD:
```
calculateDiscount(price, percent)
processOrder({ orderId, userId, items })
```
BAD:
```
calc(p,d,x,y,z)  // 200 lines, 10 jobs, magic numbers
```

##ERR (CRITICAL)
unexpected: try + catch + log() + throw
boundary (http/job/module): log() + Result/error-return, do not crash process
NEVER: empty catch, console.log(error), logger without {f,e,c,ctx}
secrets: NEVER in logs (pwd, token, cookie, card, cvc, seed)

GOOD:
```
catch (error) {
  log(error, 'await api.get(endpoint)', { endpoint, userId });
  throw error;
}
```
BAD:
```
catch (e) {}
catch (e) { console.log(e); }
catch (e) { log(e, 'code', {}); } // no throw at unexpected
```

##LOG-FORMAT
OUTPUT: {f:"file:line", e:"msg", c:"code", ctx:"var=val"}
FN: log(error, 'code-that-failed', {vars})
impl=01_GPT-LOGGER.md
if-project-has-logger=wrap it, do not replace silently

##CONST
extract magic numbers
YES: const TIMEOUT_MS = 5000
NO: setTimeout(fn, 5000)

##COMMENTS
WHY not WHAT
KEEP existing file-end comments (// path/file.ext)
NO: delete comments, commented-out dumps (git)

##DOCS
create-file-not-chat if >50 lines
URL=only from that module DOCS.md, never invent
structure: docs/00_GPT-RULES.md, 01_GPT-LOGGER.md, 02_GPT-MODULAR.md

##MD-FORMAT
pattern: XX_NAME.md (00 first)
NO: emojis, md-tables, long paragraphs
YES: key=value, YES/NO, compact lists
code-blocks: code/config only
wrap ~80 chars

##FRONTEND
only-if-stack-is-ui
CSS: clamp(), min(), rem, mobile-first
one-screen=one entry file ({id}.jsx / Page.cshtml / view.py)
helpers stay next to entry, do not dump into core/
keys: catalog/config file, do not duplicate in JSX/XML
changed UI: verify in browser (or closest test/curl)

##BACKEND
validate before save
secrets=.env only, never commit
do not touch .env, prod db, historical column names
API-shape=follow existing project (do not force {success,data})

##DB
ALWAYS: explicit fields, limit
NO: unbounded find/select *
INDEX: frequent filters
NO: rename legacy columns because names look ugly

##FORBIDDEN
console.log(error) -> log()
var -> const/let (JS)
eval -> NEVER
magic-numbers -> const
secrets-in-code -> .env
empty-catch -> log + throw-or-Result
md-in-chat -> file
if (platform===) in shared hub -> registry
direct module-to-module import -> registry getter (lazy)
invent URL / invent folder that already exists under other name

##REQUIRED
do-only-what-user-asked
do-not-break-working-behavior
log(error, code, vars)
tests next to change: «менял X → этот тест»
IF-conflict = ASK user

##TEST
next-to-file, same language runner
JS: node --test path/foo.test.js
py: pytest path/test_foo.py
rs: cargo test foo
split large tests by case (pricing.floor, parse.title)
NO: empty tests/ leftover after move

##PRIORITY
1.security > 2.do-not-break > 3.readability > 4.modularity > 5.perf

##LANG-ADAPT
JS/TS: PascalCase type/component, camelCase func
Python: snake_case func, PascalCase class
Java/C#: PascalCase type, camelCase method
Go/Rust: package/snake func, PascalCase exported type
LOG {f,e,c,ctx} = all languages
folders=match ecosystem (cmd/, internal/, src/, app/, lib/)

##GPT-EXEC
1.read this file
2.read 01_GPT-LOGGER.md
3.read 02_GPT-MODULAR.md
4.detect stack + existing registries
5.follow all rules
6.use project logger or wrap to {f,e,c,ctx}
7.modular via registry, not if-else hubs
IF-conflict = ASK user
// docs/00_GPT-RULES.md
