
var crypto = require('crypto');

interface ITOTP {
    /**
     * @description
     * verifies OTP is valid for given user
     * @param Secret
     * Unique string given to user, used by 2fa services to generate OTP
     * @param OTP
     * 6-digit, one time password provided by user
     */
    verify(Secret: string, OTP: string) : Promise<string>;
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
    create(Identifier: string, Secret: string) : Promise<string>;
}

export var TOTP: ITOTP = {

    verify(Secret: string, OTP: string) : Promise<string> {
        return new Promise<string> ((resolve, reject) => {
            var K = Base32ToHex(Secret);
			var T = PadLeft(DecimalToHex(Math.floor((Math.round(((new Date()).getTime()/1000.0))) / 30)), 16, '0');
			var totp = crypto
				.createHmac('sha1', K)
				.update(T, 'hex')
				.digest('hex')

			var offset = HexToDecimal(totp.substring(totp.length - 1));

			var gOTP = (HexToDecimal(totp.substr(offset * 2, 8)) & HexToDecimal('7fffffff')) + '';
        	gOTP = (gOTP).substr(gOTP.length - 6, 6);

			if (gOTP === OTP) {
				return resolve(gOTP);
			}
			else {
				return reject(gOTP);
			}
		});
    },

    create(Identifier: string, Secret: string) : Promise<string> {
        return new Promise<string> ((resolve, reject) => {
            try {
                var cipher = crypto
                    .createHmac('sha1', Secret)
                    .update(Identifier)
                    .digest('hex');
                var bytes = Buffer.from(cipher, 'hex');
                resolve(HexToBase32(bytes));
            } catch (err) {
                reject(err);
            }
        })
    }
}

export default TOTP;


function DecimalToHex(decimal: number) : string { 
    return (decimal < 15.5 ? '0' : '') + Math.round(decimal).toString(16); 
}

function HexToDecimal(hex: string) : number { 
    return parseInt(hex, 16); 
}

function PadLeft(string: string, length: number, padwith: string) : string {
    if (length + 1 >= string.length) {
        string = Array(length + 1 - string.length).join(padwith) + string;
    }
    return string;
}

export function Base32ToHex(base32: string) : Buffer {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";

    for (var i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += PadLeft(val.toString(2), 5, '0');
    }

    for (var i = 0; i+4 <= bits.length; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
    }
    
    var chunk = PadLeft(bits.substr(i, bits.length), 4, '0');
    hex = hex + parseInt(chunk, 2).toString(16);

    var h = Buffer.from(hex, 'hex');
    return h;
}

export function HexToBase32(hex: Buffer) : string {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var base32 = '';
    var bits = 0;
    var value = 0;

    for (var i = 0; i < hex.byteLength; i++) {
        value = (value << 8) | hex[i]
        bits += 8

        while (bits >= 5) {
            base32 += base32chars[(value >>> (bits - 5)) & 31]
            bits -= 5
        }
    }

    // if (bits > 0) {
    //     base32 += base32chars[(value << (5 - bits)) & 31]
    // }

    return base32;
}