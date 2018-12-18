
const crypto = require('crypto');

interface ITOTP {
    /**
     * @description
     * verifies OTP is valid for given user
     * @param Secret
     * Unique string given to user, used by 2fa services to generate OTP
     * @param OTP
     * 6-digit, one time password provided by user
     */
    verify(Secret: string, OTP: string): Promise<string>;
    /**
     * @description
     * Create a unique secret per user.
     * This can be stored against the user or generated on demand via this function with the same values.
     * this is the secret given to authentication applications like google authenticator.
     * @param Identifier
     * Something unique for that user, this can be used again to create the same OTP secret.
     * @param Secret
     * Sonething unique and secret to you, should stay constant whenever creating new secrets.
     */
    create(Identifier: string, Secret: string): Promise<string>;
    create(Identifier: string, Secret: string, Length: number): Promise<string>;
    /**
     * @description
     * Returns link to charted QR code using google's chart API.
     * You can use this inside a img tag on a webpage or something
     * @param Secret
     * User's unique secret
     * @param User
     * Username/Email of user
     * @param Issuer
     * A string identifying your website
     * @param h
     * Height of generated QRCode (px)
     * @default 200
     * @param w
     * Width of generated QRCode (px)
     * @default 200
     */
    chart(Secret: string, User: string, Issuer: string, h?: number, w?: number): string;
}

export const TOTP: ITOTP = {

    verify(Secret: string, OTP: string): Promise<string> {
        return new Promise<string> ((resolve, reject) => {
            const K = Base32ToHex(Secret);
            const T = PadLeft(DecimalToHex(Math.floor((Math.round(((new Date()).getTime() / 1000.0))) / 30)), 16, '0');
            const totp = crypto
                .createHmac('sha1', K)
                .update(T, 'hex')
                .digest('hex');

            const offset = HexToDecimal(totp.substring(totp.length - 1));

            let gOTP = (HexToDecimal(totp.substr(offset * 2, 8)) & HexToDecimal('7fffffff')) + '';
            gOTP = (gOTP).substr(gOTP.length - 6, 6);

            if (gOTP === OTP) {
                return resolve(gOTP);
            } else {
                return reject(gOTP);
            }
        });
    },

    create(Identifier: string, Secret: string, Length = 32): Promise<string> {
        return new Promise<string> ((resolve, reject) => {
            try {
                if (Length > 32 || Length <= 0) { return reject('Length must be between or equal to 1 and 32'); }
                const cipher = crypto
                    .createHmac('sha1', Secret)
                    .update(Identifier)
                    .digest('hex');
                const bytes = Buffer.from(cipher, 'hex');
                resolve(HexToBase32(bytes).substr(0, Length));
            } catch (err) {
                reject(err);
            }
        });
    },

    chart(Secret: string, User: string, Issuer: string, h = 200, w = 200): string {
        return `https://chart.googleapis.com/chart?chs=${h}x${w}&chld=M|` +
                    `0&cht=qr&chl=otpauth://totp/${Issuer}:${User}?secret=${Secret}&issuer=${Issuer}`;
    }
};

export default TOTP;


function DecimalToHex(decimal: number): string {
    return (decimal < 15.5 ? '0' : '') + Math.round(decimal).toString(16);
}

function HexToDecimal(hex: string): number {
    return parseInt(hex, 16);
}

function PadLeft(string: string, length: number, padwith: string): string {
    if (length + 1 >= string.length) {
        string = Array(length + 1 - string.length).join(padwith) + string;
    }
    return string;
}

export function Base32ToHex(base32: string): Buffer {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let hex = '';

    for (let i = 0; i < base32.length; i++) {
        let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += PadLeft(val.toString(2), 5, '0');
    }

    let eo = 0;
    for (let i = 0; i + 4 <= bits.length; i += 4) {
        let substr = bits.substr(i, 4);
        hex = hex + parseInt(substr, 2).toString(16);
        eo = i;
    }

    let chunk = PadLeft(bits.substr(eo, bits.length), 4, '0');
    hex = hex + parseInt(chunk, 2).toString(16);

    const h = Buffer.from(hex, 'hex');
    return h;
}

export function HexToBase32(hex: Buffer): string {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let base32 = '';
    let bits = 0;
    let value = 0;

    for (let i = 0; i < hex.byteLength; i++) {
        value = (value << 8) | hex[i];
        bits += 8;

        while (bits >= 5) {
            base32 += base32chars[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    // if (bits > 0) {
    //     base32 += base32chars[(value << (5 - bits)) & 31]
    // }

    return base32;
}
