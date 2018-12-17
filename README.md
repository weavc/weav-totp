## weav-totp

### Description

- Verify 6-digit time-based one time password authentication, as used in applications like google authenticator.
- Create Base32 secrets used by google authenticator to generated the 6 digit OTP.

### Usage
Install in your project:
```
npm i weav-totp
```

Creating secrets:
```
import { TOTP } from 'weav-totp';

TOTP.create('<unique string to user>', '<unique string to you>')
    .then((secret) => {
        // do stuff with secret
    }, (err) => { })
```

Verifying 6-digit OTP:
```
import { TOTP } from 'weav-totp';

TOTP.verify('<user secret>', OTP)
    .then((success) => {
        // verification successful
    }, (fail) => { 
        // verification failed
    })
```

### Disclaimer

This has not yet been fully tested. I have been getting the correct results everytime I have personally tested it though. You can use it, but do so with this caution in mind.

- MIT license