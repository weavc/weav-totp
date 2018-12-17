
const assert = require('assert');
import { TOTP } from '../lib/index';

var secret = 'qwewrg3rvr4vqerv4tt5bervewetbe4rQERGERGWERFWEGEewefwefWEWEGEW';
var id = 'oeriqnjiowefioewiofweoinfioewfnioqwenfionefi3njofn3oqfnoqwnfoqewmf';
var otp = '123456';

function test() {
    TOTP.create(id, secret).then((value) => {
        assert.equal(value, 'ZZ3XJ6WEH5BEBWGJ44RFOEXUYPPZLZVI');
        TOTP.verify(value, otp).then((success: string) => {
            assert.equal(success.length, 6);
        }, (error: string) => {
            assert.equal(error.length, 6);
        })
    }, (error) => {
        assert.fail('Could not create secret');
        console.log(error);
    });
}

test();