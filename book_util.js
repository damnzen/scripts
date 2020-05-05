Array.prototype.sum = function() {
    var s = 0;
    for (var i = 0; i < this.length; i++) {
        s += Number(this[i]);
    }
    return s;
};
var jan_cd = function(jan) {
    var a = jan.split('');
    var m = ([a[0], a[2], a[4], a[6], a[8], a[10]].sum() +
             [a[1], a[3], a[5], a[7], a[9], a[11]].sum() * 3) % 10;
    return m == 0 ? 0 : 10 - m;
};

// ASIN -> ISBN
function asinToIsbn(asin) {
    var jan = '978' + String(asin).substr(0, 9);
    var a = jan.split('');
    var m = ([a[0], a[2], a[4], a[6], a[8], a[10]].sum() +
             [a[1], a[3], a[5], a[7], a[9], a[11]].sum() * 3) % 10;
    return jan + (m == 0 ? 0 : 10 - m);

}

// ISBN -> ASIN
function isbnToAsin(id) {
  var a, b, c, i;
  if (id.length === 13) {
    a = 0;
    b = 0;
    for (i = 0; i < 6; i = i + 1) {
      a += Number(id.charAt(i * 2));
      b += Number(id.charAt(i * 2 + 1));
    }
    c = (a + b * 3) % 10;
    
    if (c !== 0) {
      c = 10 - c ;
    }
    if (c === Number(id.charAt(12))) {
      c = 0;
      id = id.slice(3, 12);
      for (i = 0; i < 10; i = i + 1) {
        c += Number(id.charAt(i)) * (10 - i);
      }
      c = 11 - c % 11;
      if (c === 10) {
        c = 'X';
      } else {
        if (c === 11) {
          c = 0;
        } 
      }
      id = id + String(c);
      return id;
    }
    return false;
  }
  return false;
}


//GoogleBooksや楽天の日付文字列をUnix Timeに変換
function formatDate(d){
	d = d.replace(/[年月]/g,"-").replace("日","");
	d = d + "-01-01".slice(d.length-10)
	return Date.parse(d)
}

