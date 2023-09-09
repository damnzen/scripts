function JanSearch(){
    this.BASE_URL = "https://www.jancode.xyz";
    this.CATEGORIES_MAP = {
        "レディースファッション"  :  "ファッション",
        "メンズファッション"  :  "ファッション",
        "インナー・下着・ナイトウェア"  :  "ファッション",
        "バッグ・小物・ブランド雑貨"  :  "ファッション",
        "靴"  :  "ファッション",
        "腕時計"  :  "ファッション",
        "ジュエリー・アクセサリー"  :  "ファッション",
        "家電"  :  "家電",
        "TV・オーディオ・カメラ" : "家電",
        "パソコン・周辺機器" : "パソコン",
        "スマートフォン・タブレット" : "パソコン",
        "食品" : "食品",
        "スイーツ・お菓子" : "食品",
        "水・ソフトドリンク" : "食品",
        "ビール・洋酒" : "食品",
        "日本酒・焼酎" : "食品",
        "日用品雑貨・文房具・手芸" : "日用品",
        "ダイエット・健康" : "ヘルス＆ビューティー",
        "医薬品・コンタクト・介護" : "ヘルス＆ビューティー",
        "美容・コスメ・香水" : "ヘルス＆ビューティー",
        "キッズ・ベビー・マタニティ" : "日用品",
        "インテリア・寝具・収納" : "日用品",
        "キッチン用品・食器・調理器具" : "日用品",
        "ペット・ペットグッズ" : "日用品",
        "花・ガーデン・DIY" : "日用品",
        "スポーツ・アウトドア" : "日用品",
        "車用品・バイク用品" : "日用品",
        "おもちゃ" : "ホビー",
        "本・雑誌・コミック" : "ホビー",
        "CD・DVD" : "ホビー",
        "ホビー" : "ホビー",
        "楽器・音響機器" : "ホビー"
    };
    this.BIG_CATEGORY_BREAKDOWN = {
        "ファッション" : false,
        "家電" : true,
        "パソコン" : true,
        "食品" : false,
        "日用品" : true,
        "ヘルス＆ビューティー" : true,
        "ホビー" : false,
    }
    
}

JanSearch.prototype.search= function(query){
    let url = this.BASE_URL + "/word/?q=" + encodeURIComponent(query);
    let r = http().get(url);
    let items = r.body.match(/<h4 class="title">JANコード:[\s\S]*?<\/p>/g);
    if (items.length){
        let products = items.map(item => {
            let m = item.match(/<h4 class="title">JANコード:(\d+)<\/h4>[\s\S]*?<img src="([^"]*)".*?>\s*(.*?)\s*<\/p>/);
            return {
                "id" : m[1],
                "jan" : m[1],
                "title" : m[3],
                "url" : this.BASE_URL + "/" + m[1] + "/",
                "thumb" : this.BASE_URL + m[2],
                "image" : this.BASE_URL + m[2].replace("/item/", "/item/d/")
            }
        })
        return products
    }
    
}

JanSearch.prototype.extra = function(jan){
    function removeTags(str){
        return str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
    }
      
    function getTableVal(b, key, html){
        let re = new RegExp("<th>" + key + "</th>\\s*<td>(.*?)</td>")
        let m = b.match(re);
        if (m){
            if (html){
                return m[1];
            }else{
                return removeTags(m[1]);
            }
        }else{
            return ""
        }
    }

    function parseHTMLTable(html) {
        const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/g; // テーブルの正規表現
        const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g; // 行の正規表現
        const cellRegex = /<(th|td)[^>]*>(.*?)<\/(th|td)>/g; // セルの正規表現
      
        //const result = {};
        const result = [];

        const tableMatches = html.match(tableRegex); // テーブルを抽出
        if (!tableMatches) {
          //throw new Error('テーブルが見つかりませんでした。');
          return null
        }
      
        tableMatches.forEach(tableMatch => {
          const rowMatches = tableMatch.match(rowRegex); // 行を抽出
          if (!rowMatches) return;
      
          rowMatches.forEach(rowMatch => {
            const cellMatches = rowMatch.match(cellRegex); // セルを抽出
            if (cellMatches && cellMatches.length === 2) {
              const key = cellMatches[0].replace(/<\/?(th|td)[^>]*>/g, '').trim();
              const value = cellMatches[1].replace(/<\/?(th|td)[^>]*>/g, '').trim();
              if (key == "広告") return;
              //result[key] = value;
              result.push(key + " : " + value);
            }
          });
        });
      
        return result;
    }

    function parseJapaneseDateString(dateString) {
        if (!dateString) return null;
        const dateArray = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      
        if (dateArray) {
          const year = parseInt(dateArray[1]);
          const month = parseInt(dateArray[2]) - 1; // 月は0から始まるため、1を引きます
          const day = parseInt(dateArray[3]);
      
          return new Date(year, month, day).getTime();
        } else {
          return null
        }
    }

    this.convertCategory = function (cats){
        if(!cats) return [];
        let bigcat, smallcat;
        bigcat = this.CATEGORIES_MAP[cats[0]];
        if(this.BIG_CATEGORY_BREAKDOWN[bigcat]){
            smallcat = cats[cats.length-1];
        }else{
            smallcat = cats[0];
        }
        return [bigcat,smallcat];
    }

    let url = this.BASE_URL + "/" + jan + "/";
    let r = http().get(url);

    let tables = r.body.match(/<table [\s\S]*<\/table>/g);
    if (!tables.length) return {}

    let product = {
        "title" : getTableVal(tables[0], "商品名"),
        "jan" : jan,
        "maker" : getTableVal(tables[0], "会社名").replace("株式会社", ""),
        "productcode" : getTableVal(tables[0], "品番/型番"),
        "saledate" : parseJapaneseDateString(getTableVal(tables[0], "発売日")),
        //"category" : getTableVal(tables[0], "商品ジャンル").split(" &gt ")
    }

    let org_category = getTableVal(tables[0], "商品ジャンル").split(" &gt ");
    product["category"] = this.convertCategory(org_category).join("/");

    let img = getTableVal(tables[0], "商品イメージ", true);
    if (img && /src="(.*?)"/.test(img)){
        product["image"] = this.BASE_URL + RegExp.$1;
    }

    //if(/<h3>商品詳細情報<\/h3>[\s\S]*?<\/table>/.test(r.body)){
    let amount;
    if(tables.length>1){
        let table = tables[1];
        let spec = parseHTMLTable(table);
        product["spec"] = spec.join("\n");
        amount = getTableVal(table, "内容量");
    }

    if (!amount) amount = amountFromTitle(product.title);
    product["amount"] = amount;

    return product
}
