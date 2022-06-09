Array.prototype.sum = function() {
    var s = 0;
    for (var i = 0; i < this.length; i++) {
        s += Number(this[i]);
    }
    return s;
};

var BookUtil = {
	NDC_SIZE : {
	"0" : "単行本",
	"1" : "文庫",
	"2" : "新書",
	"3" : "全集・双書",
	"4" : "ムック・その他",
	"5" : "事・辞典",
	"6" : "図鑑",
	"7" : "絵本",
	"8" : "磁性媒体など",
	"9" : "コミック",
	},

	NDC_GENRE : {
	"00" : "総記",
	"01" : "百科事典",
	"02" : "年鑑・雑誌",
	"04" : "情報科学",
	"10" : "哲学",
	"11" : "心理(学)",
	"12" : "倫理(学)",
	"14" : "宗教",
	"15" : "仏教",
	"16" : "キリスト教",
	"20" : "歴史総記",
	"21" : "日本歴史",
	"22" : "外国歴史",
	"23" : "伝記",
	"25" : "地理",
	"26" : "旅行",
	"30" : "社会科学総記",
	"31" : "政治-含む国防軍事",
	"32" : "法律",
	"33" : "経済・財政・統計",
	"34" : "経営",
	"36" : "社会",
	"37" : "教育",
	"39" : "民族・風習",
	"40" : "自然科学総記",
	"41" : "数学",
	"42" : "物理学",
	"43" : "化学",
	"44" : "天文・地学",
	"45" : "生物学",
	"47" : "医学・歯学・薬学",
	"50" : "工学・工学総記",
	"51" : "土木",
	"52" : "建築",
	"53" : "機械",
	"54" : "電気",
	"55" : "電子通信",
	"56" : "海事",
	"57" : "採鉱・冶金",
	"58" : "その他の工業",
	"60" : "産業総記",
	"61" : "農林業",
	"62" : "水産業",
	"63" : "商業",
	"65" : "交通・通信",
	"70" : "芸術総記",
	"71" : "絵画・彫刻",
	"72" : "写真・工芸",
	"73" : "音楽・舞踊",
	"74" : "演劇・映画",
	"75" : "体育・スポーツ",
	"76" : "諸芸・娯楽",
	"77" : "家事",
	"79" : "コミックス・劇画",
	"80" : "語学総記",
	"81" : "日本語",
	"82" : "英米語",
	"84" : "ドイツ語",
	"85" : "フランス語",
	"87" : "各国語",
	"90" : "文学総記",
	"91" : "日本文学総記",
	"92": "日本文学詩歌",
	"93": "日本文学、小説・物語",
	"95": "日本文学、評論、随筆、その他",
	"97": "外国文学小説",
	"98": "外国文学、その他",
	},

	convertCcode : function (ccode){
		var size = this.NDC_SIZE[ccode.substr(1,1)];
		var cat = this.NDC_GENRE[ccode.substr(2,2)];
		return { "size" : size, "genre" : cat}
	},

// ASIN -> ISBN
  asinToIsbn : function (asin) {
    var jan = '978' + String(asin).substr(0, 9);
    var a = jan.split('');
    var m = ([a[0], a[2], a[4], a[6], a[8], a[10]].sum() +
             [a[1], a[3], a[5], a[7], a[9], a[11]].sum() * 3) % 10;
    return jan + (m == 0 ? 0 : 10 - m);
    
  },

  // ISBN -> ASIN
  isbnToAsin : function(id) {
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
  },
  
  urlToAsin : function(url){
    var regex = /www\.amazon\.co.jp\/([\w-%]+\/)?(dp|gp\/product)\/(\w+\/)?(\w{10})/;
    if (regex.test(url)){
      return RegExp.$4;
    }
  },
  
};

function kanaToHira(str) {
  if (!str) return str;
  return str.replace(/[\u30a1-\u30f6]/g, function(match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

//GoogleBooksや楽天の日付文字列をUnix Timeに変換
function formatDate(d){
	d = d.replace(/[年月]/g,"-").replace("日","");
	d = d + "-01-01".slice(d.length-10)
	return Date.parse(d)
}

