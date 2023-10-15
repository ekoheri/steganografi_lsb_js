Vigenere = function () {
    //vigenere
    // Source https://javascript.algorithmexamples.com/web/Ciphers/vigenereCipher.html

    this.Encrypt = function (message, key) {
        let result = '';

        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            result += String.fromCharCode(c.charCodeAt(0) + key.charCodeAt(j));
            j = ++j % key.length;
        }
        return result
    }

    this.Decrypt = function (message, key) {
        let result = '';
        
        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            
            result += String.fromCharCode(c.charCodeAt(0) - key.charCodeAt(j));
            j = ++j % key.length;
        }
        return result;
    }
}