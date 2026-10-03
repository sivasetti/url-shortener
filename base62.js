const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encode(num){
    if (num === 0) return '0';
    let result = '';
    while (num > 0){
        result = ALPHABET[num % 62] + result;
        num = Math.floor(num /62);
    }
    return result;
}


function decode(code){
    let num = 0;

    for(const letter of code){
        num = num * 62 + ALPHABET.indexOf(letter);
    }
    return num;
}

module.exports = {encode, decode};