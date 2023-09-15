ajax = function() {
    this.ContainerLoading = null;
    this.sendRequest = function (method, url_target, data) {
        var url = url_target;
        const ContainerLoading = this.ContainerLoading;
        return new Promise(function(resolve, reject){
            /* new instance dari object XMLHttpRequest */
            var http = new XMLHttpRequest();

            /* Membuka koneksi dengan backend server */
            http.open(method, url);

            /* Set header */
            // Jika web target di-upload di netlify, maka Cache-Control-nya harus dimatikan
            //http.setRequestHeader("Cache-Control", "no-cache");

            /* Event ketika mulai memuat data dari backend */
            http.onloadstart = function() {
                ContainerLoading.hidden = false;
            }

            /* Event ketika selesai memuat data dari backend */
            http.onloadend = function(){
                ContainerLoading.hidden = true;
            }

            /* Event ketika berhasil mendapatlan data dari backend */
            http.onload = function() {
                if(http.readyState == 4 && http.status == 200){
                    var response = http.responseText;
                    resolve(response);
                }
            }
            
            /* Event ketika gagal melakukan koneksi ke backend */
            http.onerror = reject;

            /* Kirim permintaan (request) data ke backend */
            http.send(data);
        });
    }
}//end ajax

Steganografi_LSB = function() {
    this.txtEncKunciRahasia = document.getElementById('txtEncKunciRahasia');
    this.txtDecKunciRahasia = document.getElementById('txtDecKunciRahasia');
    this.txtWebKunciRahasia = document.getElementById('txtWebKunciRahasia');
    this.txtEncPesanRahasia = document.getElementById('txtEncPesanRahasia');
    this.fileEncGambarAsli = document.getElementById('fileEncGambarAsli');
    this.cvsEncGambarAsli = document.getElementById('cvsEncGambarAsli');
    this.lblEncGambarAsli = document.getElementById('lblEncGambarAsli');
    this.cvsEncGambarStegano = document.getElementById('cvsEncGambarStegano');
    this.lblEncGambarStegano = document.getElementById('lblEncGambarStegano');
    this.btnEnkripsi = document.getElementById('btnEnkripsi');
    this.btnDownload = document.getElementById('btnDownload');
    this.divHasilEnkripsi = document.getElementById('divHasilEnkripsi');

    this.fileDecGambarSteganografi = document.getElementById('fileDecGambarSteganografi');
    this.btnDeskripsi = document.getElementById('btnDeskripsi');
    this.cvsDecGambarStegano = document.getElementById('cvsDecGambarStegano');
    this.txtDecPesanRahasia = document.getElementById('txtDecPesanRahasia');
    this.divPesanRahasia = document.getElementById('divPesanRahasia');

    this.txtDecWebSteganografi = document.getElementById('txtDecWebSteganografi');
    this.btnDeskripsiWeb = document.getElementById('btnDeskripsiWeb');
    this.divPesanDekripWeb = document.getElementById('divPesanDekripWeb');
    this.divLoading = document.getElementById('divLoading');

    this.PesanTerisi = false;
    this.GambarEncTerisi = false;
    this.GambarDecTerisi = false;

    this.inisialisasi = function() {
        this.ctx = this.cvsEncGambarAsli.getContext("2d");

        //this.btnEnkripsi
        this.divHasilEnkripsi.hidden = true;
        this.divPesanRahasia.hidden = true;
        this.divLoading.hidden = true;

        this.txtEncPesanRahasia.addEventListener('keyup', function() {
            if(txtEncPesanRahasia.value != '')
                this.PesanTerisi = true;
            else 
                this.PesanTerisi = false;
        }.bind(this));

        this.txtEncPesanRahasia.addEventListener('change', function() {
            if(txtEncPesanRahasia.value != '')
                this.PesanTerisi = true;
            else 
                this.PesanTerisi = false;
        }.bind(this));

        this.fileEncGambarAsli.addEventListener('change', function() {
            if (this.fileEncGambarAsli.files[0] != null)
                this.GambarEncTerisi = true;
        }.bind(this));

        this.btnEnkripsi.addEventListener('click', function() {
            if(this.PesanTerisi == true && this.GambarEncTerisi == true)
                this.prosesEnkripsi();
            else
                alert("Pesan rahasia atau gambar asli belum diisi");
        }.bind(this));

        this.btnDownload.addEventListener('click', function() {
            this.DownloadPNG();
        }.bind(this));

        this.fileDecGambarSteganografi.addEventListener('change', function() {
            if (this.fileDecGambarSteganografi.files[0] != null)
                this.GambarDecTerisi = true;
        }.bind(this));

        this.btnDeskripsi.addEventListener('click', function() {
            if(this.GambarDecTerisi == true)
                this.ProsesDeskripsi();
            else
                alert("Gambar hasil steganografi belum diisi");
        }.bind(this));
        
        this.btnDeskripsiWeb.addEventListener('click', function() {
            if(this.txtDecWebSteganografi.value != '')
                this.ProsesDeskripsiWeb();
            else
                alert("URL Website belum terisi");
        }.bind(this));
    }

    this.prosesEnkripsi = function() {
        let file = this.fileEncGambarAsli.files[0];
        let reader = new FileReader();
        const ctxAsli = this.cvsEncGambarAsli.getContext("2d");
        const ctxSecret = this.cvsEncGambarStegano.getContext("2d");

        let chiper = this.Vigenere_Encrypt(this.txtEncPesanRahasia.value, this.txtEncKunciRahasia.value);
        const pesan = this.encodeUtf8(chiper, false);

        this.lblEncGambarAsli.innerHTML = 'Gambar Asli';
        this.lblEncGambarStegano.innerHTML = 'Gambar Steganografi';
        reader.onloadend = function() {
            const img = new Image();
            img.src = reader.result;

            img.onload = function () {
                ctxAsli.canvas.width = img.width;
                ctxAsli.canvas.height = img.height;
                ctxAsli.drawImage( img, 0, 0);

                var hasil = this.BuatStegano(ctxAsli.getImageData(0, 0, ctxAsli.canvas.width, ctxAsli.canvas.height), pesan);

                ctxSecret.canvas.width = ctxAsli.canvas.width;
                ctxSecret.canvas.height = ctxAsli.canvas.height;
                ctxSecret.putImageData(hasil, 0, 0 );

                this.divHasilEnkripsi.hidden = false;
            }.bind(this)
        }.bind(this);
        reader.readAsDataURL( file );
    } //end bacaGambarAsli

    this.BuatStegano = function(gambar, pesan) {
        var index = 0;
        for( var i = 0, length = pesan.length; i < length; i++ ) {
            if ( i == 0 ) {
                var secretLength = length * 4;
                //console.info( 'Secret Length(' + length + 'x4) : ' + secretLength )
                if ( secretLength > 255 ) {
                    var division = secretLength / 255;
                    if ( division % 1 === 0 ) {
                        for ( var k = 0; k < division; k++ ) {
                            gambar.data[ k ] = 255;
                            index++;
                        }
                    }
                    // float number
                    else {
    
                        var firstPortion = division.toString().split(".")[ 0 ];
                        var secondPortion = division.toString().split(".")[ 1 ];
    
                        for ( var k = 0; k < firstPortion; k++ ) {
                            gambar.data[ k ] = 255;
                            index++;
                        }
    
                        var numberLeft = Math.round( ( division - firstPortion ) * 255 );
                        //console.info( 'numberLeft : ' + numberLeft )
                        gambar.data[ k ] = numberLeft;
                        index++;
                    }
                } else {
                    gambar.data[ 0 ] = secretLength;
                    index++;
                }

                //console.log( 'sss : ' + gambar.data[ 0 ] )
            }//end if
            var asciiCode = pesan[ i ];
            var first2bit = ( asciiCode & 0x03 ); // 0x03 = 3
            var first4bitMiddle = ( asciiCode & 0x0C ) >> 2;
            var first6bitMiddle = ( asciiCode & 0x30 ) >> 4;
            var first8bitMiddle = ( asciiCode & 0xC0 ) >> 6;

            gambar.data[ index ] = ( gambar.data[ index ] & 0xFC ) | first2bit;
            index++;

            gambar.data[ index ] = ( gambar.data[ index ] & 0xFC ) | first4bitMiddle;
            index++;

            gambar.data[ index ] = ( gambar.data[ index ] & 0xFC ) | first6bitMiddle;
            index++;

            gambar.data[ index ] = ( gambar.data[ index ] & 0xFC ) | first8bitMiddle;
            index++;
        }//end for i

        return gambar;
    }//end bacaByte

    this.ProsesDeskripsi = function() {
        let file = this.fileDecGambarSteganografi.files[0];
        let reader = new FileReader();
        const ctx = this.cvsDecGambarStegano.getContext("2d");
        reader.onloadend = function() {
            const img = new Image();
            img.src = reader.result;
            img.onload = function () {
                ctx.canvas.width = img.width;
                ctx.canvas.height = img.height;
                ctx.drawImage( img, 0, 0);

                var pesan = this.DekripLSB(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
                console.log(pesan);
                let decrypt = this.Vigenere_Decrypt(pesan, this.txtDecKunciRahasia.value);
                this.txtDecPesanRahasia.value = decrypt;

                this.cvsDecGambarStegano.hidden = false;
                this.divPesanRahasia.hidden = false;
            }.bind(this)
        }.bind(this);
        reader.readAsDataURL( file );
    }

    this.DekripLSB = function (gambar) {
        var totalLength = 0;
        var lastIndex;

        for ( var b = 0, viewLength = gambar.data.length; b < viewLength; b++ ) {
            // get the length for matched index only
            if (gambar.data[ b ] == 255) {
                totalLength += gambar.data[ b ];
                if (gambar.data[ b + 1 ] < 255) {
                    totalLength += gambar.data[ b + 1 ];
                    lastIndex = b + 1;
                    break;
                }
            } else {
                totalLength += gambar.data[ b ];
                lastIndex = b;
                break;
            }
        }
        console.info( 'Total length :' + totalLength + ', Last Index : ' + lastIndex );
        var secretLength = totalLength;
        console.log( secretLength );
        var newUint8Array = new Uint8Array( totalLength / 4 );
        var j = 0;
        for ( var i = ( lastIndex + 1 ); i < secretLength; i = i + 4 ) {
            var aShift = ( gambar.data[ i ] & 3 );
            var bShift = ( gambar.data[ i + 1 ] & 3 ) << 2;
            var cShift = ( gambar.data[ i + 2 ] & 3 ) << 4;
            var dShift = ( gambar.data[ i + 3 ] & 3 ) << 6;
            var result = ( ( ( aShift | bShift) | cShift ) | dShift );
            newUint8Array[ j ] = result;
            j++;
        }
        //console.log( newUint8Array )
        var result = this.decodeUtf8( newUint8Array );
        return result;
    }

    this.ProsesDeskripsiWeb = function() {
        // Request data element ke backend
        var Service = new ajax();
        Service.ContainerLoading = this.divLoading;
        Service.sendRequest('get', this.txtDecWebSteganografi.value , null)
        .then(function(result){
            // Jika request berhasil, maka baca data element-nya
            this.BacaWebsite(result);
        }.bind(this))
        .catch(function(error){
            // Jika request gagal, maka tampilkan error-nya
            alert('Ada kesalahan ketika mengakses URL '+this.txtDecWebSteganografi.value);
            console.log(error);
        });
    };

    this.BacaWebsite = function(html_string) {
        let parser = new DOMParser();
        let dom_document = parser.parseFromString(html_string, "text/html");
        var img = dom_document.querySelectorAll("img");
        for(var i =0 ; i <img.length; i++) {
            const img_temp = new Image();
            img_temp.src = img[i].src;
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext("2d");
            img_temp.onload = function () {
                ctx.canvas.width = img_temp.width;
                ctx.canvas.height = img_temp.height;
                ctx.drawImage( img_temp, 0, 0);

                try {
                    var p1 = document.createElement('p');
                    var pesan = this.DekripLSB(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
                    let decrypt = this.Vigenere_Decrypt(pesan, this.txtWebKunciRahasia.value);
                    
                    p1.appendChild(canvas);
                    this.divPesanDekripWeb.appendChild(p1);

                    var p2 = document.createElement('p');
                    txtArea = document.createElement("textarea");
                    txtArea.rows = "5";
                    txtArea.cols = "50";
                    txtArea.value = decrypt;
                    p2.appendChild(txtArea);
                    this.divPesanDekripWeb.appendChild(p2);
                } catch (err) {
                    console.log('gambar tidak mengandung pesan rahasia');
                }
            }.bind(this)
        }
    }
    this.encodeUtf8 = function(stringToEncode, insertBOM) {
        stringToEncode = stringToEncode.replace(/\r\n/g,"\n");
        var utftext = [];
        if( insertBOM == true )  {
            utftext[0]=  0xef;
            utftext[1]=  0xbb;
            utftext[2]=  0xbf;
        }

        for (var n = 0; n < stringToEncode.length; n++) {

            var c = stringToEncode.charCodeAt(n);

            if (c < 128) {
                utftext[utftext.length]= c;
            }
            else if((c > 127) && (c < 2048)) {
                utftext[utftext.length]= (c >> 6) | 192;
                utftext[utftext.length]= (c & 63) | 128;
            }
            else {
                utftext[utftext.length]= (c >> 12) | 224;
                utftext[utftext.length]= ((c >> 6) & 63) | 128;
                utftext[utftext.length]= (c & 63) | 128;
            }

        }
        return utftext;  
    };

    this.decodeUtf8 = function(arrayBuffer) {
        var result = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
    
        var data = new Uint8Array(arrayBuffer);
    
        // If we have a BOM skip it
        if (data.length >= 3 && data[0] === 0xef && data[1] === 0xBB && data[2] === 0xBF) {
            i = 3;
        }
    
        while (i < data.length) {
            c = data[i];
    
            if (c < 128) {
                result += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                if (i + 1 >= data.length) {
                    throw "UTF-8 Decode failed. Two byte character was truncated.";
                }
                c2 = data[i + 1];
                result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                if (i + 2 >= data.length) {
                    throw "UTF-8 Decode failed. Multi byte character was truncated.";
                }
                c2 = data[i + 1];
                c3 = data[i + 2];
                result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return result;
    }

    this.DownloadPNG = function() {
        var anchor = document.createElement("a");
        anchor.href = this.cvsEncGambarStegano.toDataURL("image/png");
        anchor.download = "gambar_rahasia.png";
        anchor.click();
    }

    //vigenere
    // Source https://javascript.algorithmexamples.com/web/Ciphers/vigenereCipher.html
    
    this.isLetter = function (str) {
        return str.length === 1 && str.match(/[a-zA-Z]/i);
    }

    this.isUpperCase = function (character) {
        if (character === character.toUpperCase()) {
            return true;
        }
        if (character === character.toLowerCase()) {
            return false;
        }
    }

    this.Vigenere_Encrypt = function (message, key) {
        let result = '';

        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            if (this.isLetter(c)) {
                if (this.isUpperCase(c)) {
                    result += String.fromCharCode((c.charCodeAt(0) + key.toUpperCase().charCodeAt(j) - 2 * 65) % 26 + 65); // A: 65
                } else {
                    result += String.fromCharCode((c.charCodeAt(0) + key.toLowerCase().charCodeAt(j) - 2 * 97) % 26 + 97); // a: 97
                }
            } else {
                result += c;
            }
            j = ++j % key.length;
        }
        return result
    }

    this.Vigenere_Decrypt = function (message, key) {
        let result = '';
        
        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            if (this.isLetter(c)) {
                if (this.isUpperCase(c)) {
                    result += String.fromCharCode(90 - (25 - (c.charCodeAt(0) - key.toUpperCase().charCodeAt(j))) % 26);
                } else {
                    result += String.fromCharCode(122 - (25 - (c.charCodeAt(0) - key.toLowerCase().charCodeAt(j))) % 26);
                }
            } else {
                result += c;
            }
            j = ++j % key.length;
        }
        return result;
    }
}//end class

// Fungsi Bootstrap untuk mulai menjalakan class HandleUI
window.addEventListener('load', () => {
    var stegano = new Steganografi_LSB();
    stegano.inisialisasi();
});