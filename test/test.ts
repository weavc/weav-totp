

import { expect, assert } from 'chai';
import { TOTP, Base32ToHex, HexToBase32 } from '../lib/index';

var secret = 'Srt%43G6fd34GrU52@';
var id = 'd$%fjJr45:;gR+daa57';
var value = 'PKHEPF3N4EV3RPGLUQWNKZR6VYD7IZOF';

var buffervalue = Buffer.from([7, 198, 83, 196, 221, 62, 59, 176]);
var stringvalue = 'A7DFHRG5HY53';

describe('tests', () => {
    it('creates correct secret', () => {
        return TOTP.create(id, secret).then((result) => {
            expect(result).to.equal(value);
        }, (fail) => {
            assert.fail();
        }).catch(()=> { assert.fail(); });
    });
    it('creates otp', () => {
        return TOTP.verify(value, 'qwerty').then((result) => {
            assert.fail();
        }, (fail) => {
            console.log(fail);
            expect(fail.length).to.equal(6);
            expect(parseInt(fail)).to.not.equal(NaN);
        }).catch(()=> { assert.fail(); });
    });
    it('converts base32 to hex', () => {
        var result = Base32ToHex(stringvalue);
        expect(result.toString()).to.equal(buffervalue.toString());
    });
    it('converts hex to base32', () => {
        var result = HexToBase32(buffervalue);
        expect(result).to.equal(stringvalue);
    });
})