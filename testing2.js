//class
CobaPBO = function() {
    this.prc1 = document.getElementById('proses_1'); //property
    this.prc2 = document.getElementById('proses_2'); //property
    this.prc3 = document.getElementById('proses_3'); //property
    this.prc4 = document.getElementById('proses_4'); //property
    this.Vignr;
    this.Csr;
    this.inisialisasi = function() {
        this.Vignr = new Vigenere();
        this.Csr = new Caesar();
        this.prc1.addEventListener('click', function() {
            this.Proses_1_click();
        }.bind(this));

        this.prc2.addEventListener('click', function() {
            this.Proses_2_click();
        }.bind(this));
        this.prc3.addEventListener('click', function() {
            this.Proses_3_click();
        }.bind(this));

        this.prc4.addEventListener('click', function() {
            this.Proses_4_click();
        }.bind(this));
    }

    this.Proses_1_click = function() {
        var h1 = document.createElement('h1');
        h1.innerHTML = this.Vignr.Enkrip();
        document.body.appendChild(h1);
    }

    this.Proses_2_click = function() {
        var h1 = document.createElement('h1');
        h1.innerHTML = this.Vignr.Dekrip();
        document.body.appendChild(h1);
    }

    this.Proses_3_click = function() {
        var h1 = document.createElement('h1');
        h1.innerHTML = this.Csr.Enkrip();
        document.body.appendChild(h1);
    }

    this.Proses_4_click = function() {
        var h1 = document.createElement('h1');
        h1.innerHTML =this.Csr.Dekrip();
        document.body.appendChild(h1);
    }
}

Vigenere = function() {
    this.Enkrip = function() {
         return 'Ini enkrip vigenere';
    }

    this.Dekrip = function() {
        return ('Ini dekrip vigenere');
    }
}

Caesar = function() {
    this.Enkrip = function() {
         return 'Ini enkrip caesar';
    }

    this.Dekrip = function() {
        return ('Ini dekrip caesar');
    }
}