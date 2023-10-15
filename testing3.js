class JsPBO {
    prc1 = document.getElementById('proses_1');
    prc2 = document.getElementById('proses_2');
    vignr;
    //csr;
    
    //inisialisasi() {
    constructor() {
        this.vignr = new Vigenere();
        //this.csr = new Caesar();
        this.prc1.addEventListener('click', function() {
            this.Proses_1_click();
        }.bind(this));
    }

    Proses_1_click() {
        var key = "halo";
        var pesan_awal = "Poltekad OKE";
        var rahasia = this.vignr.Enkrip(pesan_awal, key);
        alert(rahasia);

        var pesan_asli = this.vignr.Dekrip(rahasia, key);
        alert(pesan_asli);

        //alert(this.csr.Dekrip());
        //alert (this.csr.Enkrip('caesar'));
    }
}

class Vigenere {
    Enkrip(message, key) {
        let result = '';

        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            result += String.fromCharCode(c.charCodeAt(0) + key.charCodeAt(j));
            j = ++j % key.length;
        }
        return result;
    }

    Dekrip(message, key) {
        let result = '';
        
        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            
            result += String.fromCharCode(c.charCodeAt(0) - key.charCodeAt(j));
            j = ++j % key.length;
        }
        return result;
    }
}

class Caesar extends Vigenere {
    //vin = new Vigenere();
    Enkrip(jenis) {
        if(jenis == 'caesar')
            return "Enkripsi Caesar";
        else
            return Vigenere.Enkrip();
    }
}