#GPT-LOGGER v3.1

##FORMAT (CRITICAL)
OUTPUT: {f:"file:line", e:"error-msg", c:"code-line", ctx:"var=val"}
FUNCTION: log(error, 'code-that-failed', {variables})
TOKENS: ~50 per log
transport=one JSON line on stderr/file (language logger ok)

##FIELDS
f = file:line WHERE
e = message WHAT
c = exact code WHICH
ctx = why (undefined/null/NaN/empty/pending)

##EXAMPLE-OUTPUT
```json
{"f":"UserService.ts:45","e":"TypeError: Cannot read property 'id' of undefined","c":"const id = user.profile.id","ctx":"user.profile=undefined"}
```

##ADAPT
if-project-already-has-logger=do not replace
wrap: same {f,e,c,ctx} fields
stack-trace: JS error.stack / py traceback / .NET StackTrace / rust location!
never invent a second logger next to existing one

##SECRET-BAN (CRITICAL)
NEVER in e/c/ctx:
  password, token, cookie, authorization
  card number, expiry, cvc
  wallet seed, private key, .env values
YES: card=set, cookie=missing, userId=99
NO: card=4111..., stel_acid=...

##IMPL-CONTRACT
log(err, code, vars) -> write {f,e,c,ctx}
warn/info = same shape, level field optional
ring-buffer optional (last ~100)
DEV may print the JSON line; PROD file/stderr only
do not pretty-print full objects

JS-shape:
```
log(error, 'await api.get(endpoint)', { endpoint, userId })
```
Python-shape:
```
log(exc, "resp = client.get(url)", {"url": url, "user_id": user_id})
```
C#-shape:
```
Log(ex, "await api.Get(endpoint)", new { endpoint, userId });
```

##USAGE
unexpected:
```
try { ... }
catch (error) {
  log(error, 'const response = await api.get(endpoint)', {
    endpoint, userId
  });
  throw error;
}
```
boundary (http/worker/module):
```
catch (error) {
  log(error, 'await module.execute()', { module: name });
  return { ok: false, error: error.message };
}
```

##CONTEXT-RULES
INCLUDE: null, undefined, NaN, [], pending Promise/Task, status codes
EXCLUDE: timestamps, IP, full req, arrays>3, secrets, dumps
YES: user=undefined, items.length=0, price=NaN, status=404
NO: req={headers,body}, allUsers=[100], token=eyJ...

##ERROR-EXAMPLES
```json
{"f":"user.ts:34","e":"TypeError: Cannot read 'name' of undefined","c":"return user.profile.name","ctx":"user.profile=undefined"}
{"f":"Order.ts:23","e":"ValidationError: price required","c":"validateOrder(data)","ctx":"data.price=undefined"}
{"f":"Cart.ts:45","e":"Wrong total","c":"total=items.reduce(...)","ctx":"expected=300,got=100"}
```

##WHY
f+e = 60% fix
f+e+c = 85%
f+e+c+ctx = 95%  (~50 tokens)
verbose dump = tokens waste, secrets leak

##FORBIDDEN
console.log(error) / print(exc) / Debug.Write(ex)
empty catch
catch without code-line
ctx with secrets or full objects

##REQUIRED
FORMAT: log(error, 'exact-code-line', {relevant-vars})
CONTEXT: only problematic values
SECRETS: never
// docs/01_GPT-LOGGER.md
