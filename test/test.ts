
import { assert, expect } from 'chai';
import { TOTP, Base32ToHex, HexToBase32 } from '../lib/index';

const secret = 'Srt%43G6fd34GrU52@';
const id = 'd$%fjJr45:;gR+daa57';
const value = 'PKHEPF3N4EV3RPGLUQWNKZR6VYD7IZOF';

const buffervalue = Buffer.from([7, 198, 83, 196, 221, 62, 59, 176]);
const stringvalue = 'A7DFHRG5HY53';
let log: string;

describe('tests', () => {

    it('creates correct secret', () => {
        return TOTP.create(id, secret).then((result) => {
            expect(result).to.equal(value);
            expect(result.length).to.equal(32);
        }, (fail) => {
            assert.fail();
        }).catch(() => { assert.fail(); });
    });
    it('verify otp for 2018-12-21T21:43:02.192Z', () => {
        return TOTP.verify(value, '949493', new Date('2018-12-21T21:43:02.192Z')).then((result) => {
            expect(result.length).to.equal(6);
            expect(parseInt(result, 10)).to.not.equal(NaN);
            expect(result).to.equal('949493');
        }, (fail) => {
            assert.fail();
        }).catch(() => { assert.fail(); });
    });
    it('verify otp for now', () => {
        return TOTP.verify(value, 'qwerty').then((result) => {
            assert.fail();
        }, (fail) => {
            expect(fail.length).to.equal(6);
            expect(parseInt(fail, 10)).to.not.equal(NaN);
            log = '\tOTP value now: ' + fail;
        }).catch(() => { assert.fail(); });
    });
    it('converts base32 to hex', () => {
        const result = Base32ToHex(stringvalue);
        expect(result.toString()).to.equal(buffervalue.toString());
    });
    it('converts hex to base32', () => {
        const result = HexToBase32(buffervalue);
        expect(result).to.equal(stringvalue);
    });
    it('creates secret of specified length', () => {
        return TOTP.create(id, secret, 20).then((result) => {
            expect(result.length).to.equal(20);
        }, (fail) => {
            assert.fail();
        }).catch(() => { assert.fail(); });
    });
    it('length greater than 32', () => {
        return TOTP.create(id, secret, 33).then((result) => {
            assert.fail();
        }, (fail) => {
            assert.equal('', '');
        }).catch(() => { assert.fail(); });
    });
    it('chart qrcode', () => {
        const expected =
            'https://chart.googleapis.com/chart?chs=200x200&chld=M|' +
            '0&cht=qr&chl=otpauth://totp/weav:chris?secret=PKHEPF3N4EV3RPGLUQWNKZR6VYD7IZOF&issuer=weav';
        const result = TOTP.chart(value, 'chris', 'weav');
        expect(result).to.equal(expected);
    });
    it ('logs:', () => {});
    it ('complete', () => { console.log(log); });
});
