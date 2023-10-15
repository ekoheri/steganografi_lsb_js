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

Handle_UI = function() {
    this.txtEncKunciPrivate = document.getElementById('txtEncKunciPrivate');
    this.txtEncKunciPublic = document.getElementById('txtEncKunciPublic');
    this.txtDecKunciPublic = document.getElementById('txtDecKunciPublic');
    this.txtDecKunciPrivate = document.getElementById('txtDecKunciPrivate');
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

    this.stegano_lsb;
    this.reverse;
    this.vigenere;
    this.caesar;
    this.encryptMD5;
    this.encryptSHA1;
    this.Sengkalan;

    this.inisialisasi = function() {
        this.reverse = new Reverse();
        this.vigenere = new Vigenere();
        this.caesar = new Caesar();

        this.stegano_lsb = new Steganografy_LSB();
        this.encryptMD5 = new Encrypt_MD5();
        this.encryptSHA1 = new Encrypt_SHA1();
        this.Sengkalan = new Sengkalan();

        this.ctx = this.cvsEncGambarAsli.getContext("2d");

        //this.btnEnkripsi
        this.divHasilEnkripsi.hidden = true;
        this.divPesanRahasia.hidden = true;
        this.divLoading.hidden = true;

        this.txtEncKunciPrivate.addEventListener('blur', function() {
            var public_key = this.Sengkalan.generate(this.txtEncKunciPrivate.value);
            this.txtEncKunciPublic.value = public_key;
        }.bind(this))

        this.txtDecKunciPublic.addEventListener('blur', function() {
            var private_key = this.Sengkalan.baca(this.txtDecKunciPublic.value);
            this.txtDecKunciPrivate.value = private_key;
        }.bind(this))

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

        //let chiper = this.vigenere.Encrypt(this.txtEncPesanRahasia.value, this.txtEncKunciRahasia.value);
        //const pesan = this.stegano_lsb.encodeUtf8(chiper, false);

        var kunci = this.encryptMD5.md5(this.txtEncKunciPrivate.value);
        //console.log("MD5 : "+kunci);
        kunci = this.encryptSHA1.SHA1(kunci);
        //console.log("SHA1 : "+kunci);
        const chiper_reverse = this.reverse.Encrypt(this.txtEncPesanRahasia.value);
        console.log("Reverse Encrypt : " + chiper_reverse);
        const chiper_vigenere = this.vigenere.Encrypt(chiper_reverse, kunci);
        console.log("Vigenere Encrypt : " + chiper_vigenere);
        const chiper_caesar = this.caesar.Encrypt(chiper_vigenere, kunci);
        console.log("Caesar Encrypt : " + chiper_caesar);

        this.lblEncGambarAsli.innerHTML = 'Gambar Asli';
        this.lblEncGambarStegano.innerHTML = 'Gambar Steganografi';
        reader.onloadend = function() {
            const img = new Image();
            img.src = reader.result;

            img.onload = function () {
                ctxAsli.canvas.width = img.width;
                ctxAsli.canvas.height = img.height;
                ctxAsli.drawImage( img, 0, 0);

                var hasil = this.stegano_lsb.Encrypt(ctxAsli.getImageData(0, 0, ctxAsli.canvas.width, ctxAsli.canvas.height), chiper_caesar);

                ctxSecret.canvas.width = ctxAsli.canvas.width;
                ctxSecret.canvas.height = ctxAsli.canvas.height;
                ctxSecret.putImageData(hasil, 0, 0 );

                this.divHasilEnkripsi.hidden = false;
            }.bind(this)
        }.bind(this);
        reader.readAsDataURL( file );
    } //end bacaGambarAsli

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

                var chiper = this.stegano_lsb.Decrypt(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
                //console.log(chiper);
                var kunci = this.encryptMD5.md5(this.txtDecKunciPrivate.value);
                //console.log(kunci);
                //console.log("MD5 : "+kunci);
                kunci = this.encryptSHA1.SHA1(kunci);
                //console.log("SHA1 : "+kunci);
                let chiper_caesar = this.caesar.Decrypt(chiper, kunci);
                let chiper_vigenere = this.vigenere.Decrypt(chiper_caesar , kunci);
                let pesan = this.reverse.Decrypt(chiper_vigenere);

                this.txtDecPesanRahasia.value = pesan;

                this.cvsDecGambarStegano.hidden = false;
                this.divPesanRahasia.hidden = false;
            }.bind(this)
        }.bind(this);
        reader.readAsDataURL( file );
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
        //var lsb = new Steganografy_LSB();
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
                    
                    var pesan = this.stegano_lsb.Decrypt(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
                    var kunci = this.encryptMD5.md5(this.txtWebKunciRahasia.value);
                    let decrypt = this.vigenere.Decrypt(pesan, kunci);
                    
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

    this.DownloadPNG = function() {
        var anchor = document.createElement("a");
        anchor.href = this.cvsEncGambarStegano.toDataURL("image/png");
        anchor.download = "gambar_rahasia.png";
        anchor.click();
    }

}//end class

Steganografy_LSB = function() {
    this.Encrypt = function(gambar, secret_msg) {
        var index = 0;
        var pesan = this.encodeUtf8(secret_msg);
        for( var i = 0, length = pesan.length; i < length; i++ ) {
            if ( i == 0 ) {
                var secretLength = length * 4; 
                //console.info( 'Secret Length(' + length + 'x4) : ' + secretLength );
                if ( secretLength > 255 ) {
                    var division = secretLength / 255;
                    if ( division % 1 === 0 ) {
                        for ( var k = 0; k < division; k++ ) {
                            gambar.data[ k ] = 255;
                            index++;
                        }
                    }
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
    }//end Encrypt

    this.Decrypt = function (gambar) {
        var totalLength = 0;
        var lastIndex;

        for ( var b = 0, viewLength = gambar.data.length; b < viewLength; b++ ) {
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
        var secretLength = totalLength;
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
        var result = this.decodeUtf8( newUint8Array );
        return result;
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
}

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

// https://medium.com/@6465660/javascript-magic-tricks-steganography-a0f9330e5e0d
Stegano_LSB = function () {
    this.get_number_from_bits = function(bytes, history) {
        var number = 0;
        var pos = 0;
        while (pos < 16) {
            var loc = this.get_next_location(history, bytes.length);
            var bit = this.getBit(bytes[loc], 0);
            number = this.set_bit(number, pos, bit);
            pos++;
        }
        return number;
    };
    this.get_next_location = function(history, total) {
        var pos = history.length;
        var loc = Math.abs(pos + 1) % total;
        while (true) {
            if (loc >= total) {
                loc = 0;
            } else if (history.indexOf(loc) >= 0) {
                loc++;
            } else if ((loc + 1) % 4 === 0) {
                loc++;
            } else {
                history.push(loc);
                return loc;
            }
        }
    };
    this.set_bit = function(number, location, bit) {
        return (number & ~(1 << location)) | (bit << location);
    };
    //将信息字符串转为二进制编码
    this.get_message_bits = function(message) {
        var message_bits = [];
        for (var i = 0; i < message.length; i++) {
            var code = message.charCodeAt(i);
            message_bits = message_bits.concat(this.get_bits_from_number(code));
        }
        return message_bits;
    };
    this.get_bits_from_number = function(number) {
        var bits = [];
        for (var i = 0; i < 16; i++) {
            bits.push(this.getBit(number, i));
        }
        return bits;
    };
    this.getBit = function(number, location) {
        return ((number >> location) & 1);
    };
    //编码信息
    this.Encrypt = function(gambar, message) {
        var colors = gambar.data;
        var message_bits = this.get_bits_from_number(message.length);
        message_bits = message_bits.concat(this.get_message_bits(message));
        var history = [];
        var pos = 0;
        while (pos < message_bits.length) {
            var loc = this.get_next_location(history, colors.length);
            colors[loc] = this.set_bit(colors[loc], 0, message_bits[pos]);
            while ((loc + 1) % 4 !== 0) {
                loc++;
            }
            colors[loc] = 255;
            pos++;
        }
        return gambar;
    };
    //解码信息
    this.Decrypt = function(gambar) {
        var colors = gambar.data;
        var history = [];
        var message_size = this.get_number_from_bits(colors, history);
        if ((message_size + 1) * 16 > colors.length * 0.75) {
            return '';
        }
        var message = [];
        for(var i = 0; i < message_size; i++) {
            var code = this.get_number_from_bits(colors, history);
            message.push(String.fromCharCode(code));
        }
        return message.join('');
    };
}

Encrypt_MD5 = function() {
    this.safeAdd = function(x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }
    
    this.bitRotateLeft = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    this.md5cmn = function(q, a, b, x, s, t) {
        return this.safeAdd(
            this.bitRotateLeft(
                this.safeAdd(
                    this.safeAdd(a, q), 
                    this.safeAdd(x, t)
                ), s
            ), b
        );
    }

    this.md5ff = function (a, b, c, d, x, s, t) {
        return this.md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }

    this.md5gg = function (a, b, c, d, x, s, t) {
        return this.md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }

    this.md5hh = function (a, b, c, d, x, s, t) {
        return this.md5cmn(b ^ c ^ d, a, b, x, s, t);
    }

    this.md5ii = function (a, b, c, d, x, s, t) {
        return this.md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    this.binlMD5 = function(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << len % 32;
        x[(((len + 64) >>> 9) << 4) + 14] = len;
    
        var i;
        var olda;
        var oldb;
        var oldc;
        var oldd;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
    
        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;
    
          a = this.md5ff(a, b, c, d, x[i], 7, -680876936);
          d = this.md5ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = this.md5ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = this.md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = this.md5ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = this.md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = this.md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = this.md5ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = this.md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = this.md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = this.md5ff(c, d, a, b, x[i + 10], 17, -42063);
          b = this.md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = this.md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = this.md5ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = this.md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = this.md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    
          a = this.md5gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = this.md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = this.md5gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = this.md5gg(b, c, d, a, x[i], 20, -373897302);
          a = this.md5gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = this.md5gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = this.md5gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = this.md5gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = this.md5gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = this.md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = this.md5gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = this.md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = this.md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = this.md5gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = this.md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = this.md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    
          a = this.md5hh(a, b, c, d, x[i + 5], 4, -378558);
          d = this.md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = this.md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = this.md5hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = this.md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = this.md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = this.md5hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = this.md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = this.md5hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = this.md5hh(d, a, b, c, x[i], 11, -358537222);
          c = this.md5hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = this.md5hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = this.md5hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = this.md5hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = this.md5hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = this.md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    
          a = this.md5ii(a, b, c, d, x[i], 6, -198630844);
          d = this.md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = this.md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = this.md5ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = this.md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = this.md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = this.md5ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = this.md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = this.md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = this.md5ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = this.md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = this.md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = this.md5ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = this.md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = this.md5ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = this.md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    
          a = this.safeAdd(a, olda);
          b = this.safeAdd(b, oldb);
          c = this.safeAdd(c, oldc);
          d = this.safeAdd(d, oldd);
        }
        return [a, b, c, d];
      }
    
      this.binl2rstr = function(input) {
        var i;
        var output = '';
        var length32 = input.length * 32;
        for (i = 0; i < length32; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
        }
        return output;
      }

      this.rstr2binl = function(input) {
        var i;
        var output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }
        var length8 = input.length * 8;
        for (i = 0; i < length8; i += 8) {
          output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
        }
        return output;
      }
    
      this.rstrMD5 = function (s) {
        return this.binl2rstr(this.binlMD5(this.rstr2binl(s), s.length * 8));
      }

      this.rstrHMACMD5 = function (key, data) {
        var i;
        var bkey = this.rstr2binl(key);
        var ipad = [];
        var opad = [];
        var hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
          bkey = this.binlMD5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        hash = this.binlMD5(ipad.concat(this.rstr2binl(data)), 512 + data.length * 8);
        return this.binl2rstr(this.binlMD5(opad.concat(hash), 512 + 128));
      }

      this.rstr2hex = function (input) {
        var hexTab = '0123456789abcdef';
        var output = '';
        var x;
        var i;
        for (i = 0; i < input.length; i += 1) {
          x = input.charCodeAt(i);
          output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output;
      }

      this.str2rstrUTF8 = function (input) {
        return unescape(encodeURIComponent(input));
      }

      this.rawMD5 = function (s) {
        return this.rstrMD5(this.str2rstrUTF8(s));
      } 

      this.hexMD5 = function (s) {
        return this.rstr2hex(this.rawMD5(s));
      }

      this.rawHMACMD5 = function (k, d) {
        return this.rstrHMACMD5(this.str2rstrUTF8(k), this.str2rstrUTF8(d));
      }

      this.hexHMACMD5 = function (k, d) {
        return this.rstr2hex(this.rawHMACMD5(k, d));
      }
    
      this.md5 = function (string, key, raw) {
        if (!key) {
          if (!raw) {
            return this.hexMD5(string);
          }
          return this.rawMD5(string);
        }
        if (!raw) {
          return this.hexHMACMD5(key, string);
        }
        return this.rawHMACMD5(key, string);
      }  
}//end class Encrypt_MD5

Encrypt_SHA1 = function() {
    this.CHAR_SIZE = 8;

    this.pad = function(str, bits) {
        let res = str;
        while (res.length % bits !== 0) {
          res = '0' + res;
        }
        return res;
    }

    this.chunkify = function (str, size) {
        const chunks = [];
        for (let i = 0; i < str.length; i += size) {
          chunks.push(str.slice(i, i + size));
        }
        return chunks;
    }

    this.rotateLeft = function (bits, turns) {
        return bits.substr(turns) + bits.substr(0, turns);
    }

    this.preProcess = function (message) {
        // convert message to binary representation padded to
        // 8 bits, and add 1
        let m = message.split('')
          .map(e => e.charCodeAt(0))
          .map(e => e.toString(2))
          .map(e => this.pad(e, 8))
          .join('') + '1';
       
        // extend message by adding empty bits (0)
        while (m.length % 512 !== 448) {
          m += '0';
        }
       
        // length of message in binary, padded, and extended
        // to a 64 bit representation
        let ml = (message.length * this.CHAR_SIZE).toString(2);
        ml = this.pad(ml, 8);
        ml = '0'.repeat(64 - ml.length) + ml;
       
        return m + ml;
    }

    this.SHA1 = function (message) {
        // main variables
        let H0 = 0x67452301;
        let H1 = 0xEFCDAB89;
        let H2 = 0x98BADCFE;
        let H3 = 0x10325476;
        let H4 = 0xC3D2E1F0;
       
        // pre-process message and split into 512 bit chunks
        const bits = this.preProcess(message);
        const chunks = this.chunkify(bits, 512);
       
        chunks.forEach(function (chunk, i) {
          // break each chunk into 16 32-bit words
            this.chunkify = function (str, size) {
                const chunks = [];
                for (let i = 0; i < str.length; i += size) {
                chunks.push(str.slice(i, i + size));
                }
                return chunks;
            }
            this.pad = function(str, bits) {
                let res = str;
                while (res.length % bits !== 0) {
                  res = '0' + res;
                }
                return res;
            }
            this.rotateLeft = function (bits, turns) {
                return bits.substr(turns) + bits.substr(0, turns);
            }
          const words = this.chunkify(chunk, 32);
       
          // extend 16 32-bit words to 80 32-bit words
          for (let i = 16; i < 80; i++) {
            const val = [words[i - 3], words[i - 8], words[i - 14], words[i - 16]]
              .map(e => parseInt(e, 2))
              .reduce((acc, curr) => curr ^ acc, 0);
            const bin = (val >>> 0).toString(2);
            const paddedBin = this.pad(bin, 32);
            const word = this.rotateLeft(paddedBin, 1);
            words.push(word);
          }
       
          // initialize variables for this chunk
          let [a, b, c, d, e] = [H0, H1, H2, H3, H4];
       
          for (let i = 0; i < 80; i++) {
            let f, k;
            if (i < 20) {
              f = (b & c) | (~b & d);
              k = 0x5A827999;
            } else if (i < 40) {
              f = b ^ c ^ d;
              k = 0x6ED9EBA1;
            } else if (i < 60) {
              f = (b & c) | (b & d) | (c & d);
              k = 0x8F1BBCDC;
            } else {
              f = b ^ c ^ d;
              k = 0xCA62C1D6;
            }
            // make sure f is unsigned
            f >>>= 0;
       
            const aRot = rotateLeft(pad(a.toString(2), 32), 5);
            const aInt = parseInt(aRot, 2) >>> 0;
            const wordInt = parseInt(words[i], 2) >>> 0;
            const t = aInt + f + e + k + wordInt;
            e = d >>> 0;
            d = c >>> 0;
            const bRot = rotateLeft(pad(b.toString(2), 32), 30);
            c = parseInt(bRot, 2) >>> 0;
            b = a >>> 0;
            a = t >>> 0;
          }
       
          // add values for this chunk to main hash variables (unsigned)
          H0 = (H0 + a) >>> 0;
          H1 = (H1 + b) >>> 0;
          H2 = (H2 + c) >>> 0;
          H3 = (H3 + d) >>> 0;
          H4 = (H4 + e) >>> 0;
        })
       
        // combine hash values of main hash variables and return
        const HH = [H0, H1, H2, H3, H4]
          .map(e => e.toString(16))
          .map(e => pad(e, 8))
          .join('');
       
        return HH;
    }
}

Sengkalan = function() {
    this.daftar = [
        ["Akasa", "Awang-Awang", "Barakan", "Brastha", "Byoma", "Doh", "Gegana","Ilang", "Kombul", "Kos", "Langit",	"Luhur", "Mesat", "Mletik", "Muksa", "Muluk","Musna", "Nenga", "Ngles", "Nir", "Nis"],
        ["Badan","Budha","Budi","Buweng","Candra",	"Dara",	"Dhara","Eka","Gusti","Hyang","Iku","Jagat","Kartika","Kenya","Lek","Luwih","Maha",	"Nabi",	"Nata",	"Nekung","Niyata"],
        ["Apasang", "Asta", "Athi-athi", "Buja", "Bujana", "Dresthi", "Dwi","Gandeng","kalih", "Kanthi", "kembar", "Lar","Mandeng", "Myat", "Nayana", "Nembeh",	"Netra", "Ngabekti", "Paksa", "Sikara",	"Sungu"],
        ["Agni", "Api",  "Apyu", "Bahni", "Benter", "Brama", "Dahana", "Guna", "Jatha", "Kaeksi", "Katingalan", "Katon", "Kawruh", "Kaya", "Kobar", "Kukus", "Lir", "Murub", "Nala", "Naut", "nauti"],
        ["Bun", "Catur", "Dadya", "Gawe", "Her", "Jaladri", "Jalanidhi", "karta", "Karti", "Karya", "Keblat", "Marna", "Marta", "Masuh", "Nadi", "Papat", "Pat", "Samodra", "Sagara", "Sindu", "Suci"],
        ["Angin", "Astra", "Bajra", "Bana", "Bayu", "Buta", "Cakra", "Diyu", "Galak", "Gati", "Guling", "Hru", "Indri", "Indriya", "Jemparing", "Lima", "Lungid", "Marga", "Margana", "Maruta", "Nata"],
        ["Amla", "Anggana", "Anggang-Anggang", "Amnggas", "Artati", "Carem", "Glinggang", "Hoyag", "Ilat", "Karaseng", "Karengya", "Kayasa", "Kayu", "Kilatan", "Lidhah", "Lindhu", "Lona", "Manis", "Naya", "Nem", "Nenem"],
        ["Acala",  "Ajar",  "Angsa",  "Ardi",  "Arga",  "Aswa",  "Biksu",  "Biksuka",  "Dwija",  "Giri",  "Gora",  "Himawan",  "Kaswareng",  "Kuda",  "Muni",  "Nabda",  "Pandhita",  "Pitu",  "Prabata",  "Resi",  "Sabda"],
        ["Anggusti", "Astha", "Bajul", "Basu", "Basuki", "Baya", "Bebaya", "Brahma", "Brahmana", "Bujangga", "Dirada", "Dwipa", "Dwipangga", "Dwirada", "Estha", "Esthi", "Gajah", "Kunjara", "Madya", "Liman", "Madya"],
        ["Ambuka", "Anggangsir", "Angleng", "Angrong", "Arum", "Babahan", "Bedah", "Bolong", "Butul", "Dewa", "Dwara", "Ganda", "Gapura", "Gatra", "Guwa", "Jawata", "Kori", "Kusuma ", "Lawang", "Manjing", "Masuk"]
    ];

    this.generate = function(angka) {
        var kalimat = "";
        for(var i = 0; i < angka.length; i++) {
            if(kalimat == "")
                kalimat = this.daftar[parseInt(angka.charAt(i))][Math.floor(Math.random() * 21)];
            else
                kalimat += " "+this.daftar[parseInt(angka.charAt(i))][Math.floor(Math.random() * 21)];
        }
        return kalimat;
    }

    this.baca = function(kalimat) {
        var kata = kalimat.split(" ");
        var angka = "";
        for(var i = 0; i < kata.length; i++) {
            var ketemu = false;
            var baris = 0;
            while((ketemu == false) && (baris < 10)) {
                var kolom = 0;
                while((ketemu == false) && (kolom < 21)) {
                    if(this.daftar[baris][kolom] == kata[i]) 
                        ketemu = true;
                    else
                        kolom++;
                }
                if(ketemu == false)
                    baris++;
            }
            if(ketemu == true)
                angka += baris.toString() ;
        }
        return angka;
    }
}

Caesar = function() {
    this.Encrypt = function (message, key) {
        let result = '';

        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            result += String.fromCharCode(c.charCodeAt(0) + key.length);
        }
        return result
    }

    this.Decrypt = function (message, key) {
        let result = '';
        
        for (let i = 0, j = 0; i < message.length; i++) {
            const c = message.charAt(i);
            
            result += String.fromCharCode(c.charCodeAt(0) - key.length);
        }
        return result;
    }
}

Reverse = function() {
    this.Encrypt = function (message) {
        let result = "";
        var len = message.length - 1;
        for(i = len; i > -1; i--){
            result += message[i];
        }
        return result;
    }

    this.Decrypt = function(message) {
        let result = this.Encrypt(message);
        return result;
    }
}
// Fungsi Bootstrap untuk mulai menjalakan class HandleUI
window.addEventListener('load', () => {
    var stegano = new Handle_UI();
    stegano.inisialisasi();
    console.log('Window selesai di load');
});
