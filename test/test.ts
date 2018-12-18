

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
            expect(result.length).to.equal(32);
        }, (fail) => {
            assert.fail();
        }).catch(()=> { assert.fail(); });
    });
    it('creates otp', () => {
        return TOTP.verify(value, 'qwerty').then((result) => {
            assert.fail();
        }, (fail) => {
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
    it('creates secret of specified length', () => {
        return TOTP.create(id, secret, 20).then((result) => {
            expect(result.length).to.equal(20);
        }, (fail) => {
            assert.fail();
        }).catch(()=> { assert.fail(); });
    });
    it('length greater than 32', () => {
        return TOTP.create(id, secret, 33).then((result) => {
            assert.fail();
        }, (fail) => {
            assert.equal('','');
        }).catch(()=> { assert.fail(); });
    });
    it('chart qrcode', () => {
        var expected = 'https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/weav:chris?secret=PKHEPF3N4EV3RPGLUQWNKZR6VYD7IZOF&issuer=weav'
        var result = TOTP.chart(value, 'chris', 'weav');
        expect(result).to.equal(expected)
    });
})